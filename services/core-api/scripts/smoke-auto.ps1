# Auto-dispatch smoke test. API must be running. Run from services/core-api.
$ErrorActionPreference = "Stop"
$b = "http://localhost:3001"

function Post($url, $obj) {
  Invoke-RestMethod $url -Method Post -ContentType "application/json" -Body ($obj | ConvertTo-Json)
}

# ensure an online GPS provider exists
$all = (Invoke-RestMethod "$b/providers").providers
$near = $all | Where-Object { $_.name -eq "Near Plumber" } | Select-Object -First 1
if (-not $near) { throw "Near Plumber missing - run base seed first" }
Invoke-RestMethod "$b/providers/$($near.id)/online" -Method Post -ContentType "application/json" -Body '{"online":true}' | Out-Null
"ONLINE: $($near.name)"

# intake (no zone - auto) with GPS near Near Plumber
$r = Post "$b/requests" @{ description = "Auto dispatch test"; categoryId = "plumbing"; address = "Gwarinpa gate"; latitude = 9.1075; longitude = 7.412; channel = "telegram"; handle = "autotest"; name = "Auto User" }
"REQ: $($r.request.id) zone=$($r.request.zoneId)"
Start-Sleep 3
$q = Invoke-RestMethod "$b/requests/$($r.request.id)"
"STATUS: $($q.request.status) jobs=$($q.request.jobs.Count)"
$job = $q.request.jobs[0]
if (-not $job) { throw "auto-dispatch created no job" }

# provider accepts via offer endpoint
$a = Post "$b/jobs/$($job.id)/accept" @{ actor = "provider" }
"ACCEPT: $($a.to)"
foreach ($to in @("IN_PROGRESS", "DONE_PENDING_CONFIRM")) {
  $t = Post "$b/requests/jobs/$($job.id)/transition" @{ to = $to }
  "TRANS: $($t.from)->$($t.to)"
}
$f = Post "$b/jobs/$($job.id)/followup" @{ channel = "telegram" }
$fr = Post "$b/jobs/followups/$($f.followUp.id)/respond" @{ confirmedOk = $true }
"RESP: ->$($fr.to)"
$met = Invoke-RestMethod "$b/metrics"
"METRICS: req=$($met.requests) match=$($met.matchRate) comp=$($met.completionRate) ok=$($met.confirmedOk)"
"SMOKE-AUTO-OK"
