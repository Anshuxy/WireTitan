# Evidence – Extension F: Troubleshooting

## What This Folder Demonstrates

Extension F verified three failure and recovery scenarios:

1. **Both backends down** → nginx returns `HTTP 502 Bad Gateway`.
2. **Backend recovery** → nginx returns `HTTP 200 OK` after backends are restored.
3. **Wrong destination port** → TCP connection fails (`curl error 7`).

## Screenshots

| File | Machine | What It Shows |
|---|---|---|
| `extension-f-both-backends-down.png` | Mac 2 (dark terminal) | Continuation of the `502 Bad Gateway` HTML response body at top; `curl -k -i https://127.0.0.1:8443/api/status` after backend recovery → `HTTP/1.1 200 OK` (`X-Backend: A`); Wi-Fi DNS restored to `1.1.1.1 10.0.0.1`; `curl -k -i https://127.0.0.1:8444/api/status` → `curl: (7) Failed to connect` |

> Note: The preceding `curl -k -i --connect-timeout 5 https://127.0.0.1:8443/api/status` command and `HTTP/1.1 502 Bad Gateway` response headers appear at the bottom of `../extension-b/extension-b-record-change.png`. `extension-f-both-backends-down.png` continues that terminal scrollback with the HTML body, recovery `HTTP 200 OK`, DNS restore, and port `8444` connection failure.

## Status

✅ **Complete** — All three planned troubleshooting scenarios demonstrated.

## What Was NOT Tested

- Wrong DNS server fault injection.
- Wrong DNS A record fault injection.

## Commands Used

```bash
# Mac 2 – both backends down (stop Backend A and Backend B first)
curl -k -i --connect-timeout 5 https://127.0.0.1:8443/api/status
# Expected: HTTP 502 Bad Gateway

# Mac 2 – restart backends, then:
curl -k -i --connect-timeout 5 https://127.0.0.1:8443/api/status
# Expected: HTTP 200 OK

# Mac 2 – wrong port
curl -k -i --connect-timeout 3 https://127.0.0.1:8444/api/status
# Expected: curl: (7) Failed to connect to 127.0.0.1 port 8444
```
