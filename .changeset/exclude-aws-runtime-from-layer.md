---
"@effortless-aws/cli": patch
---

fix: exclude AWS runtime packages (@aws-sdk/*, @smithy/*, @aws-crypto/*, @aws/*) from Lambda layer and lockfile hash
