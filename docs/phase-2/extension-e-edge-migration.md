# Extension E – Controlled Edge Migration

## Objective

Demonstrate DNS-based edge migration: change the DNS A record to route traffic through the standby nginx on Mac 1 instead of the primary nginx on Mac 2. Verify HTTPS access and backend responses through the standby edge.

## Implementation

### Standby nginx on Mac 1

Configured `nginx/phase-2/standby.conf` on Mac 1 (`10.7.10.202`):

- Listens on `0.0.0.0:8443` with TLS termination.
- Proxies all requests upstream to `https://10.7.3.20:8443` (primary nginx on Mac 2).

> **Important limitation:** The standby nginx is not an independent edge. It proxies to the primary nginx on Mac 2. If Mac 2 is unavailable, the standby cannot serve requests.

### DNS Record Change

Changed `dns/dnsmasq.conf`:
```
address=/app.wiretitan.test/10.7.10.202   # temporary (during migration test)
```

After testing, restored to:
```
address=/app.wiretitan.test/10.7.3.20
```

## Test Results

### Standby nginx local test (Mac 1)

```bash
curl -k -i --connect-timeout 5 --max-time 10 https://127.0.0.1:8443/api/status
# HTTP/1.1 200 OK
# X-Backend: A
# X-Cache-Status: HIT
```

Evidence: `evidence/phase-2/extension-e/extension-e-standby-edge-test.png`

### Standby via hostname (Mac 1)

```bash
curl -k -i --connect-timeout 5 https://app.wiretitan.test:8443/api/status
# HTTP/1.1 200 OK
# X-Backend: B
# X-Cache-Status: HIT
```

Evidence: `evidence/phase-2/extension-e/extension-e-standby-dns-https.png`

### Mac 2 direct access to standby and hostname routing

```bash
curl -k -i --connect-timeout 5 https://10.7.10.202:8443/api/status
# HTTP/1.1 200 OK, X-Backend: A, X-Cache-Status: EXPIRED

curl -k -i --resolve app.wiretitan.test:8443:10.7.10.202 https://app.wiretitan.test:8443/api/status
# HTTP/1.1 200 OK, X-Backend: A, X-Cache-Status: HIT
```

Evidence: `evidence/phase-2/extension-e/extension-e-mac2-standby-https.png`

### Mac 2 DNS verification

`dscacheutil -q host -a name app.wiretitan.test` confirmed:
- During migration: `ip_address: 10.7.10.202`
- After restore: `ip_address: 10.7.3.20`

`scutil --dns` showed Mac 2 using `10.7.10.202` as its DNS resolver.

Evidence: `evidence/phase-2/extension-b/extension-b-record-change.png`

## What Was NOT Demonstrated

- Clients retaining the old edge IP (`10.7.3.20`) until the 30-second TTL expired after the DNS record change.
- The standby nginx operating independently if the primary nginx (Mac 2) were offline.

## Status

⚠️ **Partial** — DNS migration, HTTPS access through standby, and hostname routing all verified. Standby nginx is not independent. Client TTL retention not observed.
