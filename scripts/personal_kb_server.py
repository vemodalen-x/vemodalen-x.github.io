"""Local-only HTTP server and durable state API for the personal knowledge hub."""

from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import subprocess
import sys
import threading
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


MAX_BODY_BYTES = 10 * 1024 * 1024
STATE_KEY_PATTERN = re.compile(r"^[a-zA-Z0-9._-]{1,100}$")


def timestamp() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


class StateStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        with self._connect() as connection:
            connection.executescript(
                """
                PRAGMA journal_mode=WAL;
                CREATE TABLE IF NOT EXISTS state (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS events_type_created
                    ON events(event_type, created_at);
                """
            )

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path, timeout=10)

    def get(self, key: str):
        with self._connect() as connection:
            row = connection.execute("SELECT value, updated_at FROM state WHERE key = ?", (key,)).fetchone()
        if not row:
            return None
        return {"value": json.loads(row[0]), "updatedAt": row[1]}

    def set(self, key: str, value) -> str:
        serialized = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        updated_at = timestamp()
        with self._lock, self._connect() as connection:
            connection.execute(
                """INSERT INTO state(key, value, updated_at) VALUES (?, ?, ?)
                   ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at""",
                (key, serialized, updated_at),
            )
        return updated_at

    def delete(self, key: str) -> None:
        with self._lock, self._connect() as connection:
            connection.execute("DELETE FROM state WHERE key = ?", (key,))

    def add_event(self, event_type: str, payload) -> None:
        with self._lock, self._connect() as connection:
            connection.execute(
                "INSERT INTO events(event_type, payload, created_at) VALUES (?, ?, ?)",
                (event_type[:80], json.dumps(payload, ensure_ascii=False), timestamp()),
            )

    def metrics(self) -> dict:
        with self._connect() as connection:
            event_rows = connection.execute(
                "SELECT event_type, COUNT(*) FROM events GROUP BY event_type"
            ).fetchall()
            feedback_rows = connection.execute(
                "SELECT payload FROM events WHERE event_type = 'search_feedback'"
            ).fetchall()
        feedback = {"useful": 0, "missing": 0}
        for (payload,) in feedback_rows:
            try:
                rating = json.loads(payload).get("rating")
                if rating in feedback:
                    feedback[rating] += 1
            except (json.JSONDecodeError, AttributeError):
                continue
        total = feedback["useful"] + feedback["missing"]
        return {
            "events": dict(event_rows),
            "searchFeedback": feedback,
            "searchSuccessRate": round(feedback["useful"] * 100 / total) if total else None,
        }

    def export(self) -> dict:
        with self._connect() as connection:
            states = connection.execute("SELECT key, value, updated_at FROM state ORDER BY key").fetchall()
            events = connection.execute(
                "SELECT event_type, payload, created_at FROM events ORDER BY id DESC LIMIT 5000"
            ).fetchall()
        return {
            "schemaVersion": 1,
            "exportedAt": timestamp(),
            "state": {
                key: {"value": json.loads(value), "updatedAt": updated_at}
                for key, value, updated_at in states
            },
            "events": [
                {"type": event_type, "payload": json.loads(payload), "createdAt": created_at}
                for event_type, payload, created_at in reversed(events)
            ],
        }

    def import_backup(self, payload: dict) -> dict:
        states = payload.get("state", {})
        if not isinstance(states, dict):
            raise ValueError("Backup state must be an object")
        imported_states = 0
        for key, item in states.items():
            if not STATE_KEY_PATTERN.fullmatch(key):
                continue
            value = item.get("value") if isinstance(item, dict) and "value" in item else item
            self.set(key, value)
            imported_states += 1
        events = payload.get("events", [])
        imported_events = 0
        if isinstance(events, list):
            with self._lock, self._connect() as connection:
                connection.execute("DELETE FROM events")
                for event in events[:5000]:
                    if not isinstance(event, dict) or not event.get("type"):
                        continue
                    connection.execute(
                        "INSERT INTO events(event_type, payload, created_at) VALUES (?, ?, ?)",
                        (
                            str(event["type"])[:80],
                            json.dumps(event.get("payload", {}), ensure_ascii=False),
                            str(event.get("createdAt") or timestamp()),
                        ),
                    )
                    imported_events += 1
        return {"states": imported_states, "events": imported_events}


class KnowledgeRequestHandler(SimpleHTTPRequestHandler):
    server_version = "PersonalKnowledgeHub/1.0"

    def __init__(self, *args, directory: str, store: StateStore, root: Path, port: int, **kwargs):
        self.store = store
        self.root = root
        self.port = port
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        if self.path.endswith((".html", ".js", ".css")) or self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format_string: str, *args) -> None:
        if self.path.startswith("/api/") or args[1] not in {"200", "304"}:
            super().log_message(format_string, *args)

    def _send_json(self, payload, status: HTTPStatus = HTTPStatus.OK, headers: dict | None = None) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(data)

    def _read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Invalid Content-Length") from error
        if length <= 0 or length > MAX_BODY_BYTES:
            raise ValueError("Request body is empty or too large")
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def _origin_allowed(self) -> bool:
        origin = self.headers.get("Origin")
        return not origin or origin in {
            f"http://127.0.0.1:{self.port}",
            f"http://localhost:{self.port}",
        }

    def _state_key(self, parsed) -> str:
        key = parse_qs(parsed.query).get("key", [""])[0]
        if not STATE_KEY_PATTERN.fullmatch(key):
            raise ValueError("Invalid state key")
        return key

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            return super().do_GET()
        try:
            if parsed.path == "/api/health":
                self._send_json({"ok": True, "version": 1, "storage": str(self.store.path)})
            elif parsed.path == "/api/state":
                self._send_json({"ok": True, "state": self.store.get(self._state_key(parsed))})
            elif parsed.path == "/api/metrics":
                self._send_json({"ok": True, **self.store.metrics()})
            elif parsed.path == "/api/export":
                filename = f"personal-kb-backup-{datetime.now():%Y-%m-%d}.json"
                self._send_json(
                    self.store.export(),
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'},
                )
            elif parsed.path == "/api/document":
                self._serve_document(parsed)
            else:
                self._send_json({"ok": False, "error": "API endpoint not found"}, HTTPStatus.NOT_FOUND)
        except (ValueError, json.JSONDecodeError) as error:
            self._send_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
        except Exception as error:  # Keep local API errors visible without exposing a traceback to the browser.
            self._send_json({"ok": False, "error": str(error)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/state":
            return self._send_json({"ok": False, "error": "API endpoint not found"}, HTTPStatus.NOT_FOUND)
        if not self._origin_allowed():
            return self._send_json({"ok": False, "error": "Origin not allowed"}, HTTPStatus.FORBIDDEN)
        try:
            payload = self._read_json()
            key = payload.get("key", "")
            if not STATE_KEY_PATTERN.fullmatch(key):
                raise ValueError("Invalid state key")
            updated_at = self.store.set(key, payload.get("value"))
            self._send_json({"ok": True, "updatedAt": updated_at})
        except (ValueError, json.JSONDecodeError) as error:
            self._send_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/state":
            return self._send_json({"ok": False, "error": "API endpoint not found"}, HTTPStatus.NOT_FOUND)
        if not self._origin_allowed():
            return self._send_json({"ok": False, "error": "Origin not allowed"}, HTTPStatus.FORBIDDEN)
        try:
            self.store.delete(self._state_key(parsed))
            self._send_json({"ok": True})
        except ValueError as error:
            self._send_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            return self._send_json({"ok": False, "error": "API endpoint not found"}, HTTPStatus.NOT_FOUND)
        if not self._origin_allowed():
            return self._send_json({"ok": False, "error": "Origin not allowed"}, HTTPStatus.FORBIDDEN)
        try:
            if parsed.path == "/api/event":
                payload = self._read_json()
                event_type = str(payload.get("type", ""))
                if not event_type or len(event_type) > 80:
                    raise ValueError("Invalid event type")
                self.store.add_event(event_type, payload.get("payload", {}))
                self._send_json({"ok": True}, HTTPStatus.CREATED)
            elif parsed.path == "/api/import":
                imported = self.store.import_backup(self._read_json())
                self._send_json({"ok": True, "imported": imported})
            elif parsed.path == "/api/reindex":
                result = subprocess.run(
                    [sys.executable, str(self.root / "scripts" / "build-personal-kb-index.py")],
                    cwd=self.root,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    timeout=180,
                    check=False,
                )
                self._send_json(
                    {"ok": result.returncode == 0, "output": result.stdout.strip(), "error": result.stderr.strip()},
                    HTTPStatus.OK if result.returncode == 0 else HTTPStatus.INTERNAL_SERVER_ERROR,
                )
            else:
                self._send_json({"ok": False, "error": "API endpoint not found"}, HTTPStatus.NOT_FOUND)
        except (ValueError, json.JSONDecodeError) as error:
            self._send_json({"ok": False, "error": str(error)}, HTTPStatus.BAD_REQUEST)
        except subprocess.TimeoutExpired:
            self._send_json({"ok": False, "error": "Index build timed out"}, HTTPStatus.REQUEST_TIMEOUT)

    def _serve_document(self, parsed) -> None:
        relative = unquote(parse_qs(parsed.query).get("path", [""])[0]).replace("\\", "/")
        if not relative.startswith("notes/") or not relative.lower().endswith(".md"):
            raise ValueError("Only Markdown files under notes/ can be previewed")
        target = (self.root / relative).resolve()
        notes_root = (self.root / "notes").resolve()
        if notes_root not in target.parents or not target.is_file():
            raise ValueError("Document is outside the knowledge notes directory")
        content = target.read_text(encoding="utf-8", errors="replace")
        self._send_json({"ok": True, "path": relative, "content": content[:2_000_000]})


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--database", type=Path, help="Override the SQLite path, mainly for testing")
    args = parser.parse_args()
    root = args.root.resolve()
    local_app_data = Path(os.environ.get("LOCALAPPDATA", Path.home() / ".local" / "share"))
    database = args.database.resolve() if args.database else local_app_data / "PersonalKnowledgeHub" / "state.sqlite3"
    store = StateStore(database)

    def handler(*handler_args, **handler_kwargs):
        return KnowledgeRequestHandler(
            *handler_args,
            directory=str(root),
            store=store,
            root=root,
            port=args.port,
            **handler_kwargs,
        )

    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"Personal Knowledge Hub: http://127.0.0.1:{args.port}/personal-knowledge-hub.html")
    print(f"Durable state: {database}")
    print("Bound to 127.0.0.1 only. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Personal Knowledge Hub.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
