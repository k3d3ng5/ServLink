# Full assistant conversation test: slot-filling, YES gate, creation, auto-dispatch.
$ErrorActionPreference = "Stop"
$b = "http://localhost:3001"
$sid = $null
function Say($text) {
  $body = @{ email = "chatflow@example.com"; message = $text }
  if ($sid) { $body.sessionId = $sid }
  $r = Invoke-RestMethod "$b/assistant/chat" -Method Post -ContentType "application/json" -Body ($body | ConvertTo-Json)
  $script:sid = $r.sessionId
  "YOU: $text"
  "BOT: $($r.reply)"
  "done=$($r.done) req=$($r.requestId)"
  ""
  return $r
}
$r1 = Say "my kitchen sink is leaking badly"
$r2 = Say "plumbing"
$r3 = Say "House 5, 3rd Avenue, Gwarinpa"
$r4 = Say "08031234567"
$r5 = Say "YES"
if (-not $r5.done -or -not $r5.requestId) { throw "conversation did not complete" }
Start-Sleep 3
$q = Invoke-RestMethod "$b/requests/$($r5.requestId)"
"FINAL: status=$($q.request.status) jobs=$($q.request.jobs.Count)"
"CHAT-FLOW-OK"
