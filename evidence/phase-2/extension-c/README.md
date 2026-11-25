# Evidence – Extension C: Service Isolation

## What This Folder Demonstrates

Extension C verified service isolation using two mechanisms:

1. **Application-level filtering (Backend A):** Direct HTTP requests to Backend A on Mac 1 that do not arrive through the nginx proxy are rejected with `HTTP 403 Forbidden`.
2. **Bind-address isolation (Backend B):** Backend B binds to `127.0.0.1:3002` only. Mac 1 cannot connect to it remotely.

## Screenshots

| File | Machine | What It Shows |
|---|---|---|
| `extension-c-backend-a-direct-403.png` | Mac 1 (white terminal) | Direct `curl http://10.7.10.202:3001/api/status` → HTTP 403, `{"error":"Access denied"}`; also shows Mac 1 attempt to reach Backend B at 10.7.3.20:3002 → `curl error (7) Failed to connect` |
| `extension-c-backend-b-listener-and-reach.png` | Mac 2 (dark terminal) | `lsof` shows Backend B listening on `127.0.0.1:3002`; Mac 2 reaches Backend A at 10.7.10.202:3001 → HTTP 200 |

## Status

⚠️ **Partial** — Application-level and bind-address isolation verified. PF packet-filter firewall enforcement was not achievable on managed university Macs.

## Commands Used

```bash
# Mac 1 – direct access to Backend A (expected: 403)
curl -s -i http://10.7.10.202:3001/api/status

# Mac 1 – remote access to Backend B (expected: connection failed)
curl -i --connect-timeout 5 http://10.7.3.20:3002/api/status

# Mac 2 – verify Backend B bind address
lsof -nP -iTCP:3002 -sTCP:LISTEN

# Mac 2 – verify Backend A reachability
curl -s -i http://10.7.10.202:3001/api/status
```
