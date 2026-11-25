# Evidence – Extension E: Controlled Edge Migration

## What This Folder Demonstrates

Extension E demonstrated DNS-based edge migration:

1. Standby nginx configured on Mac 1 (port 8443).
2. DNS A record for `app.wiretitan.test` changed from `10.7.3.20` to `10.7.10.202`.
3. HTTPS traffic routed through standby nginx returned HTTP 200.
4. Hostname-based routing using `curl --resolve` confirmed TLS and HTTP work through the standby.

## Screenshots

| File | Machine | What It Shows |
|---|---|---|
| `extension-e-standby-edge-test.png` | Mac 1 (white terminal) | `curl -k -i https://127.0.0.1:8443/api/status` → HTTP 200, X-Backend: A, X-Cache-Status: HIT |
| `extension-e-standby-dns-https.png` | Mac 1 (white terminal) | `curl -k -i https://app.wiretitan.test:8443/api/status` → HTTP 200, X-Backend: B, X-Cache-Status: HIT |
| `extension-e-mac2-standby-https.png` | Mac 2 (dark terminal) | Direct access to Mac 1 standby at 10.7.10.202:8443 (HTTP 200); `curl --resolve` hostname routing (HTTP 200, HIT); `scutil --dns` showing resolver 10.7.10.202 |

## Status

⚠️ **Partial** — DNS migration and HTTPS access demonstrated. Standby nginx is NOT independent — it proxies all requests to the primary nginx on Mac 2 (10.7.3.20:8443). Client TTL retention after DNS change was not observed.

## Commands Used

```bash
# Mac 1 – standby nginx local test
curl -k -i --connect-timeout 5 --max-time 10 https://127.0.0.1:8443/api/status

# Mac 1 – standby via hostname (after DNS record change to 10.7.10.202)
curl -k -i --connect-timeout 5 https://app.wiretitan.test:8443/api/status

# Mac 2 – direct standby access
curl -k -i --connect-timeout 5 https://10.7.10.202:8443/api/status

# Mac 2 – hostname routing through standby
curl -k -i --resolve app.wiretitan.test:8443:10.7.10.202 https://app.wiretitan.test:8443/api/status

# Mac 2 – DNS record verification
dscacheutil -q host -a name app.wiretitan.test
scutil --dns | grep nameserver
```

## Important Limitation

The standby nginx on Mac 1 does **not** connect directly to Backend A or Backend B.  
It proxies all requests to `https://10.7.3.20:8443` (primary nginx on Mac 2).  
If the primary nginx is down, the standby cannot serve requests.
