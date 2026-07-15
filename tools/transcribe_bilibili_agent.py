from __future__ import annotations

import json
import os
from pathlib import Path

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")

import torch
import soundfile as sf
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (
    ROOT
    / "tools"
    / "data"
    / "bilibili_agent_architecture_source"
    / "BV1ADWCzrEXL_16k_mono.wav"
)
OUTPUT = ROOT / "tools" / "data" / "bilibili_agent_architecture_transcript.json"
VTT_OUTPUT = SOURCE.with_name("BV1ADWCzrEXL.whisper-large-v3.vtt")
MODEL_NAME = "openai/whisper-large-v3"


def vtt_time(seconds: float) -> str:
    milliseconds = round(seconds * 1000)
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    secs, millis = divmod(remainder, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def main() -> None:
    if not SOURCE.exists():
        raise FileNotFoundError(SOURCE)

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is required for the local Whisper large-v3 workflow")
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        MODEL_NAME,
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True,
        use_safetensors=True,
        local_files_only=True,
    )
    model.to("cuda:0")
    processor = AutoProcessor.from_pretrained(MODEL_NAME, local_files_only=True)
    transcriber = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        batch_size=1,
        dtype=torch.float16,
        device=0,
    )
    audio, sampling_rate = sf.read(str(SOURCE), dtype="float32")
    chunk_seconds = 300
    overlap_seconds = 2
    chunk_samples = chunk_seconds * sampling_rate
    step_samples = (chunk_seconds - overlap_seconds) * sampling_rate
    segments = []
    for chunk_start in range(0, len(audio), step_samples):
        chunk_audio = audio[chunk_start : chunk_start + chunk_samples]
        if len(chunk_audio) < sampling_rate:
            continue
        offset = chunk_start / sampling_rate
        result = transcriber(
            {"array": chunk_audio, "sampling_rate": sampling_rate},
            return_timestamps=True,
            generate_kwargs={"language": "zh", "task": "transcribe"},
        )
        for chunk in result.get("chunks", []):
            start, end = chunk["timestamp"]
            text = chunk["text"].strip()
            if not text or start is None or end is None:
                continue
            absolute_start = offset + float(start)
            absolute_end = offset + float(end)
            if segments and absolute_end <= segments[-1]["end"]:
                continue
            if segments and absolute_start < segments[-1]["end"]:
                absolute_start = segments[-1]["end"]
            segments.append(
                {
                    "id": len(segments),
                    "start": round(absolute_start, 3),
                    "end": round(absolute_end, 3),
                    "text": text,
                }
            )
    if not segments:
        raise RuntimeError("Whisper returned no timestamped transcript segments")

    payload = {
        "source": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "model": MODEL_NAME,
        "backend": "transformers",
        "device": "cuda:0",
        "compute_type": "float16",
        "audio_chunk_seconds": chunk_seconds,
        "audio_overlap_seconds": overlap_seconds,
        "requested_language": "zh",
        "detected_language": "zh",
        "duration": round(max(segment["end"] for segment in segments), 3),
        "segment_count": len(segments),
        "segments": segments,
    }
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    vtt_lines = ["WEBVTT", ""]
    for index, segment in enumerate(segments, start=1):
        vtt_lines.extend(
            [
                str(index),
                f'{vtt_time(segment["start"])} --> {vtt_time(segment["end"])}',
                segment["text"],
                "",
            ]
        )
    VTT_OUTPUT.write_text("\n".join(vtt_lines), encoding="utf-8")
    print(
        json.dumps(
            {
                "output": str(OUTPUT),
                "vtt": str(VTT_OUTPUT),
                "segments": len(segments),
                "language": "zh",
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
