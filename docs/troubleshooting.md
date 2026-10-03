# WireTitan Troubleshooting Guide

This document records common problems encountered while setting up and testing WireTitan, along with their fixes.

## 1. DNS Not Resolving

**Problem:**
`app.wiretitan.test` or `api.wiretitan.test` does not resolve correctly.

**Fix:**
Check that `dnsmasq` is running and that the entries in `dns/dnsmasq.conf` contain the correct IP addresses. Restart `dnsmasq` after making changes.

## 2. Backend A Not Reachable

**Problem:**
nginx cannot connect to Backend A.

**Fix:**
Make sure Backend A is running and listening on:

```text
10.7.6.126:3001
```

Also check that the address and port match the nginx upstream configuration.

## 3. Backend B Not Reachable

**Problem:**
nginx cannot connect to Backend B.

**Fix:**
Start Backend B and verify that it is listening on:

```text
127.0.0.1:3002
```

Check that the nginx upstream configuration uses the same address and port.

## 4. nginx Configuration Error

**Problem:**
nginx fails to start because of a configuration error.

**Fix:**
Test the configuration before starting nginx:

```bash
<NGINX-CONFIG-TEST-COMMAND>
```

Check `nginx/nginx.conf` for incorrect upstream addresses, ports, server settings, or TLS configuration.

## 5. HTTPS / TLS Error

**Problem:**
The HTTPS request fails or the certificate is not trusted.

**Fix:**
Check the TLS certificate configuration and make sure the client trusts the local CA. The TLS setup is documented in `tls/README.md`.

## 6. Cache Not Working

**Problem:**
The expected cache `MISS` and `HIT` responses are not appearing.

**Fix:**
Check the nginx caching configuration and send the same request multiple times. The first request should normally show:

```text
X-Cache-Status: MISS
```

and a subsequent cached request should show:

```text
X-Cache-Status: HIT
```

## 7. Load Balancing Not Visible

**Problem:**
Requests appear to reach only one backend.

**Fix:**
Make sure both Backend A and Backend B are running and correctly configured as nginx upstream servers. Send multiple requests and check the `X-Backend` response header for:

```text
X-Backend: A
X-Backend: B
```

These checks correspond to the project's required DNS, TLS, HTTP, load-balancing, and caching evidence.

