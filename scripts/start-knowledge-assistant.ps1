param(
  [int]$Port = 8765,
  [switch]$SkipIndexBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$url = "http://127.0.0.1:$Port/personal-knowledge-hub.html"

$pythonCandidates = @(
  'D:\Env\miniconda\python.exe',
  (Get-Command python -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue)
) | Where-Object { $_ -and (Test-Path $_) }

if (-not $pythonCandidates) {
  throw 'Python 3 was not found. Update pythonCandidates in this script.'
}

if (-not $SkipIndexBuild) {
  Write-Host 'Rebuilding the local knowledge index...'
  & $pythonCandidates[0] (Join-Path $PSScriptRoot 'build-personal-kb-index.py')
  if ($LASTEXITCODE -ne 0) {
    throw 'Knowledge index build failed.'
  }
}

$existing = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Port $Port is already in use. Opening $url"
  Start-Process $url
  exit 0
}

Set-Location $root
Write-Host "Personal Knowledge Hub: $url"
Write-Host 'Bound to 127.0.0.1 only. Press Ctrl+C to stop.'
Start-Process $url
& $pythonCandidates[0] (Join-Path $PSScriptRoot 'personal_kb_server.py') --port $Port --root $root
