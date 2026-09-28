# @servlink/core-domain

Single source of truth for job states, the transition map, and `NormalizedRequest`.
Every channel adapter and the API import from here — states are never redefined elsewhere.
