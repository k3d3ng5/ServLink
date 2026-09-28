# Full lifecycle smoke test. API must be running. Run from services/core-api.
$ErrorActionPreference = "Stop"
$b = "http://localhost:3001"

function Post($url, $obj) {
  Invoke-RestMethod $url -Method Post -ContentType "application/json" -Body ($obj | ConvertTo-Json)
}

$r = Post "$b/requests" @{ description = "Kitchen sink leaking"; categoryId = "plumbing"; zoneId = "gwarinpa"; address = "House 5, 3rd Avenue"; channel = "telegram"; handle = "smokechat"; name = "Smoke User" }
"REQ: $($r.request.id) status=$($r.request.status)"

$a = Post "$b/providers/provider-applications" @{ name = "Musa Pipes"; phone = "08030000001"; categories = @("plumbing"); zones = @("gwarinpa"); skillNote = "10 yrs" }
"APP: $($a.application.id)"

$v = Post "$b/providers/provider-applications/$($a.application.id)/review" @{ decision = "approve" }
"PROV: $($v.provider.id)"

$m = Post "$b/requests/$($r.request.id)/match" @{ providerId = $v.provider.id }
"JOB: $($m.job.id)"

foreach ($to in @("CONFIRMED", "IN_PROGRESS", "DONE_PENDING_CONFIRM")) {
  $t = Post "$b/requests/jobs/$($m.job.id)/transition" @{ to = $to }
  "TRANS: $($t.from)->$($t.to)"
}

$f = Post "$b/jobs/$($m.job.id)/followup" @{ channel = "telegram" }
"FU: $($f.followUp.id)"

$fr = Post "$b/jobs/followups/$($f.followUp.id)/respond" @{ confirmedOk = $true }
"RESP: ->$($fr.to)"

$g = Invoke-RestMethod "$b/requests/$($r.request.id)"
"FINAL: $($g.request.status) events=$($g.request.events.Count)"

$met = Invoke-RestMethod "$b/metrics"
"METRICS: req=$($met.requests) match=$($met.matchRate) comp=$($met.completionRate) ok=$($met.confirmedOk)"
