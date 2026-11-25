# WireTitan Setup Guide

## Prerequisites

- Mac 1 (Farhana) IP: `10.7.10.202`
- Mac 2 (Anshu) IP: `10.7.3.20`
- Both Macs on the same LAN
- Node.js installed on both Macs
- nginx installed via Homebrew on both Macs
- dnsmasq installed via Homebrew on Mac 1

---

## Mac 1 Setup (Farhana – 10.7.10.202)

### 1. Configure and Start dnsmasq

The dnsmasq configuration file is `dns/dnsmasq.conf`.

It listens on `127.0.0.1` and `10.7.10.202`, port 53, and provides:
- `app.wiretitan.test → 10.7.3.20` (final state)
- `api.wiretitan.test → 10.7.3.20`
- TTL = 30 seconds

Start dnsmasq:

```bash
# Using Homebrew services (runs in background)
sudo brew services start dnsmasq

# Or manually with the project config:
sudo dnsmasq --conf-file=/path/to/dns/dnsmasq.conf --no-daemon
```

Verify DNS is working:

```bash
dig @127.0.0.1 app.wiretitan.test
# Expected answer: app.wiretitan.test. 30 IN A 10.7.3.20
```

### 2. Start Backend A

Backend A listens on `0.0.0.0:3001` (accessible from Mac 2 via LAN). It applies application-level source filtering to block direct access.

```bash
cd backend-a
npm install
node server.js
```

Verify Backend A is running:

```bash
curl -s http://10.7.10.202:3001/api/status
# Expected: HTTP 403 Forbidden (direct access blocked)
```

### 3. (Optional) Configure and Start Standby nginx

The standby nginx configuration is `nginx/phase-2/standby.conf`.

> **Note:** The standby nginx proxies all traffic to the primary nginx on Mac 2 at `https://10.7.3.20:8443`. It is not an independent edge. See `docs/architecture.md` for details.

```bash
# Test configuration syntax
nginx -c /path/to/nginx/phase-2/standby.conf -t

# Start standby nginx
nginx -c /path/to/nginx/phase-2/standby.conf
```

Verify standby is working:

```bash
curl -k -i --connect-timeout 5 --max-time 10 https://127.0.0.1:8443/api/status
# Expected: HTTP 200 OK, X-Backend: A or B
```

---

## Mac 2 Setup (Anshu – 10.7.3.20)

### 1. Configure DNS Resolver

Point Mac 2 to use Mac 1 as its DNS server:

```bash
sudo networksetup -setdnsservers Wi-Fi 10.7.10.202
```

Verify:

```bash
scutil --dns | grep nameserver
dscacheutil -q host -a name app.wiretitan.test
# Expected: ip_address: 10.7.3.20
```

### 2. Start Backend B

Backend B binds to `127.0.0.1:3002` only. It is **not** reachable from other machines on the LAN.

```bash
cd backend-b
npm install
node server.js
```

### 3. Configure and Start Primary nginx

The primary nginx configuration is `nginx/phase-2/primary.conf`.

Adjust the certificate paths in the configuration file to match the actual certificate location on this Mac. As an example, Mac 2's Homebrew nginx configuration used:

```
ssl_certificate     /opt/homebrew/etc/nginx/certs/app.wiretitan.test.crt;
ssl_certificate_key /opt/homebrew/etc/nginx/certs/app.wiretitan.test.key;
```

*(Replace with your host's actual certificate paths; portable examples use `<PATH_TO_CERTS>/...` placeholders.)*

> **Never commit the private key file to the repository.**

```bash
# Test configuration
nginx -c /path/to/nginx/phase-2/primary.conf -t

# Start nginx
nginx -c /path/to/nginx/phase-2/primary.conf

# Or reload if already running:
nginx -c /path/to/nginx/phase-2/primary.conf -s reload
```

### 4. Test HTTPS Access

```bash
# Via IP
curl -k -i https://127.0.0.1:8443/api/status

# Via hostname (requires DNS to be pointing to Mac 2)
curl -k -i https://app.wiretitan.test:8443/api/status
```

---

## Verifying Load Balancing

Run multiple requests and check the `X-Backend` header:

```bash
for i in 1 2 3 4 5 6; do
  curl -ks https://127.0.0.1:8443/api/status | python3 -c 'import sys,json; print(json.load(sys.stdin)["backend"])'
done
# Expected output: A B A B A B
```

## Verifying HTTP Caching

```bash
curl -k -i https://127.0.0.1:8443/api/status
# First request: X-Cache-Status: MISS

curl -k -i https://127.0.0.1:8443/api/status
# Second request: X-Cache-Status: HIT
```

---

## Security Checklist

Before committing:
- [ ] No `*.key` files staged
- [ ] No `*.pem` files staged
- [ ] No `.env` files staged
- [ ] `node_modules/` not staged
- [ ] Run `git diff --cached` and check for secrets

```bash
git diff --cached
git status
```
