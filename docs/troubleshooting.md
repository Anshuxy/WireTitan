# WireTitan Troubleshooting Guide

This document records common problems encountered while setting up and testing WireTitan, along with their fixes.

---

## 1. DNS Not Resolving

**Problem:** `app.wiretitan.test` or `api.wiretitan.test` does not resolve.

**Fix:**
- Verify dnsmasq is running on Mac 1 (`10.7.10.202`).
- Check that `dns/dnsmasq.conf` contains the correct IP addresses (Backend target: `10.7.3.20`).
- Verify that Mac 2's DNS resolver is set to Mac 1:

```bash
sudo networksetup -setdnsservers Wi-Fi 10.7.10.202
scutil --dns | grep nameserver
```

- Test DNS directly:

```bash
dig @10.7.10.202 app.wiretitan.test
# Expected: 10.7.3.20 with TTL 30
```

- Restart dnsmasq if changes are made: `sudo brew services restart dnsmasq`

---

## 2. Backend A Not Reachable from nginx

**Problem:** nginx on Mac 2 receives `502 Bad Gateway` and cannot connect to Backend A.

**Fix:**
- Verify Backend A is running on Mac 1: `node backend-a/server.js`
- Confirm it listens on `0.0.0.0:3001` (not loopback-only).
- Verify connectivity from Mac 2: `curl -s http://10.7.10.202:3001/api/status`
- Check no firewall is blocking port 3001 on Mac 1.

---

## 3. Backend B Not Reachable from nginx

**Problem:** nginx cannot connect to Backend B.

**Fix:**
- Backend B must be running on Mac 2: `node backend-b/server.js`
- Verify it is listening on `127.0.0.1:3002`:

```bash
lsof -nP -iTCP:3002 -sTCP:LISTEN
```

- Check the nginx upstream configuration uses `127.0.0.1:3002`.

---

## 4. Direct Access to Backend A Returns 403

This is **expected behaviour** for Extension C.

Backend A applies application-level access filtering. Requests that do not arrive through the nginx proxy are rejected with `HTTP 403 Forbidden`. To test via nginx, use the HTTPS endpoint: `https://app.wiretitan.test:8443/api/status`.

---

## 5. Direct Remote Access to Backend B Fails

This is **expected behaviour** for Extension C.

Backend B binds to `127.0.0.1:3002` only. Connections from other machines (e.g. Mac 1 attempting to reach `10.7.3.20:3002`) fail with `curl: (7) Failed to connect`. This is the intended isolation behaviour.

---

## 6. nginx Configuration Error

**Problem:** nginx fails to start because of a configuration error.

**Fix:**

```bash
nginx -c /path/to/nginx/phase-2/primary.conf -t
# Fix any reported errors, then:
nginx -c /path/to/nginx/phase-2/primary.conf
```

Common issues:
- Wrong certificate path (`ssl_certificate` or `ssl_certificate_key`)
- Cache directory does not exist (create `/opt/homebrew/var/cache/nginx` if missing)
- Port 8443 already in use (`lsof -i :8443`)

---

## 7. HTTPS / TLS Error

**Problem:** HTTPS request fails with certificate error.

**Fix:**
- Use `curl -k` to skip certificate verification during testing (acceptable for local private network).
- For verified HTTPS, install the local CA certificate in macOS Keychain and set trust to "Always Trust".
- See `tls/README.md` for CA setup.

---

## 8. HTTP 502 Bad Gateway

**Problem:** nginx returns `HTTP 502 Bad Gateway`.

**Causes:**
1. Both backends are down. Start Backend A and Backend B.
2. Backend A is unreachable from Mac 2 (network issue). Check LAN connectivity.
3. Certificate or config error on the upstream proxy connection (standby → primary).

**Fix:** Restart backends, verify connectivity, and check nginx error logs.

---

## 9. Cache Not Working (always MISS)

**Problem:** `X-Cache-Status: MISS` on every request.

**Fix:**
- Confirm the proxy cache path exists: `ls /opt/homebrew/var/cache/nginx/`
- If the directory is missing, create it: `mkdir -p /opt/homebrew/var/cache/nginx`
- Ensure the backend is returning `Cache-Control: max-age=60` in its response headers.
- Check that the same URL is being requested repeatedly (different query strings bypass cache).

---

## 10. Load Balancing Not Visible

**Problem:** All requests return only Backend A or only Backend B.

**Fix:**
- Confirm both backends are running and healthy.
- nginx uses round-robin by default; if one backend is down, it falls back to the other (Extension D behaviour).
- Restart both backends and retry multiple requests.
- Check `X-Backend` header in responses.

---

## 11. Standby nginx Returns 502

**Problem:** Requests to the standby nginx on Mac 1 return `HTTP 502`.

**Explanation:** The standby nginx on Mac 1 proxies all traffic to the primary nginx on Mac 2 (`https://10.7.3.20:8443`). If the primary nginx is down or unreachable, the standby cannot serve requests.

**Fix:** Ensure the primary nginx on Mac 2 is running and that Mac 1 can reach `10.7.3.20:8443`.

---

## 12. Extension A – Remote DNS Blocked

**Problem:** Cannot configure backup DNS on a second machine accessible remotely.

**Explanation:** The university-managed macOS firewall blocks inbound DNS traffic (UDP/TCP port 53) on student Macs. This is a managed-device restriction outside project control. The Extension A design is documented but the remote failover test could not be completed.

---

## 13. Extension B – DNS Cache Not Expiring Visibly

**Problem:** After changing the DNS A record, the client immediately shows the new address rather than retaining the old one.

**Explanation:** `dscacheutil -q host` on macOS performs a live DNS lookup rather than reading from a local cache in all cases. Demonstrating that a client retains an old cached IP for the full TTL duration was not achieved.
