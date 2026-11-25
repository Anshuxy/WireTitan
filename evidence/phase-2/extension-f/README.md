# Evidence – Extension F: Troubleshooting

## What This Folder Demonstrates

Extension F verified three failure and recovery scenarios:

1. **Both backends down** → nginx returns `HTTP 502 Bad Gateway`.
2. **Backend recovery** → nginx returns `HTTP 200 OK` after backends are restored.
3. **Wrong destination port** → TCP connection fails (`curl error 7`).

## Screenshots

| File | Machine | What It Shows |
|---|---|---|
| `extension-f-both-backends-down.png` | Mac 2 (dark terminal) | Composite screenshot: DNS record change (dscacheutil showing 10.7.10.202 → 10.7.3.20); `curl https://127.0.0.1:8443` → HTTP 502; recovery → HTTP 200; `curl https://127.0.0.1:8444` → curl error 7 |

> Note: The `extension-f-both-backends-down.png` screenshot is a composite that also contains Extension B DNS record change evidence. For the specific 502/200/wrong-port sequence, see the lower portion of this image.

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
