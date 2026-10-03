# WireTitan Setup Guide

## 1. Start DNS

WireTitan uses `dnsmasq` for local DNS. The configuration file is:

```text
dns/dnsmasq.conf
```

It provides local DNS entries for:

```text
app.wiretitan.test
api.wiretitan.test
```

Start `dnsmasq` using the configured command:

```bash
<START-DNSMASQ-COMMAND>
```

Verify that both hostnames resolve to the correct project IP addresses.

## 2. Start Backend A

Backend A is located in `backend-a/` and listens on:

```text
10.7.6.126:3001
```

Start the service:

```bash
cd backend-a
<START-BACKEND-A-COMMAND>
```

Make sure the backend is running before starting nginx.

## 3. Start Backend B

Backend B is located in `backend-b/` and listens on:

```text
127.0.0.1:3002
```

Start the service:

```bash
cd backend-b
<START-BACKEND-B-COMMAND>
```

Both backend addresses are configured as nginx upstream servers.

## 4. Start nginx

The nginx configuration is stored in:

```text
nginx/nginx.conf
```

The configuration includes Backend A, Backend B, HTTPS on port `8443`, TLS certificates, reverse proxy/load balancing, and caching.

First test the nginx configuration:

```bash
<NGINX-CONFIG-TEST-COMMAND>
```

Then start/reload nginx:

```bash
<START-NGINX-COMMAND>
```

## 5. Test HTTPS

After DNS, both backends, and nginx are running, test the application using:

```bash
<HTTPS-TEST-COMMAND> https://app.wiretitan.test:8443
```

The HTTPS request should successfully complete the TLS connection and return the backend response.

Test multiple requests to verify load balancing between Backend A and Backend B. The response should show:

```text
X-Backend: A
X-Backend: B
```

Test the same request again to verify nginx caching. The expected cache headers are:

```text
X-Cache-Status: MISS
X-Cache-Status: HIT
```

These headers are also part of the required project evidence.

## 6. Security

TLS certificates and client trust configuration are documented in `tls/README.md`.

Do not commit private keys, passwords, tokens, or other secrets to GitHub.

