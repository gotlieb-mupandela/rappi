$ErrorActionPreference = "Continue"
Set-Location "D:\Projects\rappi-sport"
$env:TEMP = "D:\Temp\git-push"
$env:TMP = "D:\Temp\git-push"
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null

git fetch github
git checkout -B push-main github/main

$all = @(git diff --name-only f206c9c 8513f5a)
$remaining = @()
foreach ($f in $all) {
  $a = git rev-parse "HEAD:$f" 2>$null
  $b = git rev-parse "8513f5a:$f" 2>$null
  if ($a -ne $b) { $remaining += $f }
}
Write-Output "remaining=$($remaining.Count)"

$batchSize = 15
$bi = 0
for ($i = 0; $i -lt $remaining.Count; $i += $batchSize) {
  $end = [Math]::Min($i + $batchSize - 1, $remaining.Count - 1)
  $arr = @($remaining[$i..$end])
  $bi++
  Write-Output "batch $bi files=$($arr.Length) start=$($arr[0])"
  git checkout 8513f5a -- @arr
  if (-not (git status --porcelain)) {
    Write-Output "  empty skip"
    continue
  }
  git -c user.email="gotlieb@local" -c user.name="gotlieb" commit -m "chore: sync assets batch $bi" | Out-Null

  $ok = $false
  for ($t = 1; $t -le 5 -and -not $ok; $t++) {
    Write-Output "  push try $t"
    $p = Start-Process -FilePath git -ArgumentList @(
      "-c", "http.version=HTTP/1.1",
      "-c", "http.postBuffer=524288000",
      "push", "github", "HEAD:main"
    ) -Wait -PassThru -NoNewWindow `
      -RedirectStandardError "D:\Temp\git-push\err.txt" `
      -RedirectStandardOutput "D:\Temp\git-push\out.txt"
    if ($p.ExitCode -eq 0) {
      $ok = $true
      Write-Output "  OK"
    } else {
      Get-Content "D:\Temp\git-push\err.txt" -ErrorAction SilentlyContinue | Select-Object -Last 3
      Start-Sleep -Seconds 3
    }
  }
  if (-not $ok) {
    Write-Output "FAIL batch $bi"
    git ls-remote github refs/heads/main
    exit 1
  }
}

# Tip commit (catalog check script)
git checkout 0109118 -- scripts/check-catalog.py
if (git status --porcelain) {
  git -c user.email="gotlieb@local" -c user.name="gotlieb" add -A
  git -c user.email="gotlieb@local" -c user.name="gotlieb" commit -m "chore: sync catalog check tip"
  $p = Start-Process -FilePath git -ArgumentList @(
    "-c", "http.version=HTTP/1.1",
    "-c", "http.postBuffer=524288000",
    "push", "github", "HEAD:main"
  ) -Wait -PassThru -NoNewWindow
  if ($p.ExitCode -ne 0) { Write-Output "FAIL tip"; exit 1 }
}

Write-Output "DONE"
git ls-remote github refs/heads/main
Write-Output "trees:"
git rev-parse "HEAD^{tree}"
git rev-parse "0109118^{tree}"
git checkout main
