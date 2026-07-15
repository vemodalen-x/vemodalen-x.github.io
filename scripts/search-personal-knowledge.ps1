param(
  [Parameter(Mandatory = $true)]
  [string]$Query,
  [int]$MaxResults = 50
)

$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$legacy = 'C:\Users\User\Documents\Codex\2026-06-14\tianyu2fm-https-space-bilibili-com-623448014\outputs\person_knowledge_pc'

$roots = @(
  (Join-Path $workspace 'notes'),
  (Join-Path $workspace 'knowledge'),
  (Join-Path $legacy 'notes'),
  (Join-Path $legacy 'categories')
) | Where-Object { Test-Path $_ }

$files = foreach ($root in $roots) {
  Get-ChildItem -LiteralPath $root -Recurse -File -Include '*.md', '*.js' -ErrorAction SilentlyContinue
}

$matches = $files |
  Select-String -Pattern $Query -SimpleMatch -Encoding UTF8 -ErrorAction SilentlyContinue |
  Group-Object Path |
  ForEach-Object {
    $first = $_.Group | Select-Object -First 1
    [PSCustomObject]@{
      File = $first.Path
      Hits = $_.Count
      Line = $first.LineNumber
      Preview = ($first.Line.Trim() -replace '\s+', ' ')
    }
  } |
  Sort-Object -Property @{ Expression = 'Hits'; Descending = $true }, File |
  Select-Object -First $MaxResults

if (-not $matches) {
  Write-Host "No matches: $Query"
  exit 0
}

$matches | Format-Table Hits, Line, Preview, File -Wrap -AutoSize
