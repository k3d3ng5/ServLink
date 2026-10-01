# Bilateral completion + NIN auto-approval smoke test.
$ErrorActionPreference = "Stop"
$b = "http://localhost:3001"
function Post($url, $obj) {
  Invoke-RestMethod $url -Method Post -ContentType "application/json" -Body ($obj | ConvertTo-Json)
}
# 1. NIN application auto-approves
$a = Post "$b/providers/provider-applications" @{ name = "NIN Test"; phone = "08039990111"; categories = @("electrical"); zones = @("general"); nin = "12345678901"; skillNote = "test" }
"AUTO: $($null -ne $a.autoApproved.providerId)"
# 2. bad NIN stays manual
$a2 = Post "$b/providers/provider-applications" @{ name = "NoNIN Test"; phone = "08039990222"; categories = @("electrical"); zones = @("general"); skillNote = "test" }
"MANUAL: $($null -eq $a2.autoApproved)"
# 3. fresh job, driven to IN_PROGRESS; customer-first must fail, then both agree
$nr = Post "$b/requests" @{ description = "Bilateral test job"; categoryId = "plumbing"; address = "Gwarinpa gate"; latitude = 9.1075; longitude = 7.412; channel = "telegram"; handle = "bilattest"; name = "Bilat User" }
Start-Sleep 3
$nq = Invoke-RestMethod "$b/requests/$($nr.request.id)"
$job = $nq.request.jobs[-1].id
"JOB: $job status=$($nq.request.status)"
Post "$b/jobs/$job/accept" @{ actor = "provider" } | Out-Null
Post "$b/requests/jobs/$job/transition" @{ to = "IN_PROGRESS" } | Out-Null
try { Post "$b/jobs/$job/mark-done" @{ actor = "customer" } | Out-Null; "EARLY-CUSTOMER: NOT-BLOCKED (bad)" }
catch { "EARLY-CUSTOMER: blocked (good)" }
Post "$b/jobs/$job/mark-done" @{ actor = "provider" } | Out-Null
"PROVIDER-DONE: ok"
$f = Post "$b/jobs/$job/mark-done" @{ actor = "customer" }
"BILATERAL: $($f.bilateral) -> $($f.to)"
"BILATERAL-SMOKE-OK"
