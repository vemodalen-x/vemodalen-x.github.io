param(
  [string]$AppDirectory = $PSScriptRoot,
  [string]$ShortcutName = 'AI Interview Learning'
)

$ErrorActionPreference = 'Stop'
$appDirectory = (Resolve-Path -LiteralPath $AppDirectory).Path
$appPath = Join-Path $appDirectory 'learning-os.html'
if (-not (Test-Path -LiteralPath $appPath -PathType Leaf)) {
  throw "Learning app not found: $appPath"
}

$browserCandidates = @(
  'C:\Program Files\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
)
$browser = $browserCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
if (-not $browser) {
  throw 'Chrome or Microsoft Edge was not found.'
}

$appUri = [System.Uri]::new($appPath).AbsoluteUri
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "$ShortcutName.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $browser
$shortcut.Arguments = "--app=`"$appUri`" --start-maximized"
$shortcut.WorkingDirectory = $appDirectory
$shortcut.IconLocation = "$browser,0"
$shortcut.Description = 'AI interview practice, review, knowledge directory, and offline search'
$shortcut.Save()

Write-Output $shortcutPath
