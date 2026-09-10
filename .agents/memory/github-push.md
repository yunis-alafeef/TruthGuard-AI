---
name: GitHub connector pushes
description: Reliable way to publish a local repository through the Replit GitHub connector.
---

When publishing to an empty GitHub repository through the Replit connector, create one initial file with the Contents API first; Git Data API blob creation returns a repository-empty error otherwise. Upload blobs sequentially or with low concurrency and respect the connector's 10 requests/second limit.

**Why:** Direct git push cannot use the connector's OAuth session, and the connector enforces a per-Repl request rate limit.

**How to apply:** Use the authenticated `github` connector, initialize an empty repo with a Contents API PUT, then build the full tree and commit through the Git Data API with throttling.