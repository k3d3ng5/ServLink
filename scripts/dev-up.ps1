# ServLink dev boot — ONE script, staggered, no port fights.
# Run from ServLink root: powershell -ExecutionPolicy Bypass -File scripts/dev-up.ps1
$ErrorActionPreference = "Continue"
$root = Split-Path $PSScriptRoot -Parent

function Start-Svc($name, $dir, $cmd) {
  $busy = Get-NetTCPConnection -LocalPort @{api=3001;bot=0;console=3000;expo=8081}[$name] -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($name -ne "bot" -and $busy) { "$name already up — skipping"; return }
  Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$dir'; $cmd" -WindowStyle Minimized
  "$name starting..."
}

# API first — everything else needs it.
Start-Svc api "$root\services\core-api" '$env:DATABASE_URL="file:./dev.db"; ..\..\node_modules\.bin\tsx.cmd watch src/index.ts'
Start-Sleep 45
try { (Invoke-WebRequest http://localhost:3001/health -UseBasicParsing -TimeoutSec 10).Content | Out-Null; "API: UP" }
catch { "API: DOWN — read the API window for errors"; exit 1 }

Start-Svc bot "$root\apps\telegram-bot" '..\..\node_modules\.bin\tsx.cmd watch src/bot.ts'
Start-Svc console "$root\apps\dispatch-console" '..\..\node_modules\.bin\next.cmd start --port 3000'
Start-Svc expo "$root\apps\consumer-app" 'npx.cmd expo start'
"Done. Console: http://localhost:3000  API: http://localhost:3001/health"
