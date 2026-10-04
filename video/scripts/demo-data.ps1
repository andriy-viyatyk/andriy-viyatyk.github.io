# Switch Persephone between the author's real data and the demo data used for site videos.
#
#   powershell -File video/scripts/demo-data.ps1 use       # real data aside, demo data in place
#   powershell -File video/scripts/demo-data.ps1 restore   # demo data aside, real data back
#   powershell -File video/scripts/demo-data.ps1 status
#
# Persephone (installed and dev builds alike) keeps its state in %APPDATA%\persephone. The swap
# renames these folders, which hold everything a video could show:
#   data           settings, app-bar folders, recent files, open tabs, boards, trust, site extensions
#   Partitions     browser profiles: cookies, history, address-bar suggestions
#   Local Storage  renderer local storage
# "use" renames each X to X-user and demo-X to X; "restore" does the reverse. A folder with no
# demo copy yet starts empty, so the first "use" gives a fresh Persephone.
#
# Persephone must be closed: the script refuses while the profile lockfile is held. The marker
# file demo-mode.marker records which state is active, so neither command can run twice.
param([Parameter(Mandatory = $true)][ValidateSet('use', 'restore', 'status')][string]$Mode)

$ErrorActionPreference = 'Stop'
$root = Join-Path $env:APPDATA 'persephone'
$marker = Join-Path $root 'demo-mode.marker'
$folders = @('data', 'Partitions', 'Local Storage')

function Assert-Closed {
    $lock = Join-Path $root 'lockfile'
    if (-not (Test-Path $lock)) { return }
    try {
        $stream = [System.IO.File]::Open($lock, 'Open', 'ReadWrite', 'None')
        $stream.Close()
    } catch {
        throw 'Persephone is running. Close it (all windows, and the tray icon) first.'
    }
}

function Move-Folder([string]$from, [string]$to) {
    $source = Join-Path $root $from
    if (-not (Test-Path $source)) { return }
    if (Test-Path (Join-Path $root $to)) { throw "Cannot rename '$from': '$to' already exists." }
    Rename-Item -LiteralPath $source -NewName $to
}

$demo = Test-Path $marker
if ($Mode -eq 'status') {
    if ($demo) { 'demo data is active' } else { 'real data is active' }
    return
}

Assert-Closed
if ($Mode -eq 'use') {
    if ($demo) { throw 'Demo data is already active.' }
    foreach ($f in $folders) { Move-Folder $f "$f-user" }
    foreach ($f in $folders) { Move-Folder "demo-$f" $f }
    Set-Content -LiteralPath $marker -Value (Get-Date -Format o)
    'demo data is active'
} else {
    if (-not $demo) { throw 'Real data is already active.' }
    foreach ($f in $folders) { Move-Folder $f "demo-$f" }
    foreach ($f in $folders) { Move-Folder "$f-user" $f }
    Remove-Item -LiteralPath $marker
    'real data is active'
}
