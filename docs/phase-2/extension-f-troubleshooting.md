# Extension F – Troubleshooting

## Objective

Systematically test failure scenarios and verify that the system returns expected error responses. Document the diagnostic approach used.

## Tests Performed

### 1. Both Backends Down → HTTP 502 Bad Gateway

**Procedure:** Stop Backend A on Mac 1 and Backend B on Mac 2. Send a request to nginx.

**Result:**

```
HTTP/1.1 502 Bad Gateway
Server: nginx/1.31.6
```

nginx cannot reach either backend and returns `502 Bad Gateway`. This is a network-layer proxy error, not an application error.

Evidence: `evidence/phase-2/extension-b/extension-b-record-change.png` (command and `HTTP/1.1 502 Bad Gateway` headers at bottom) and `evidence/phase-2/extension-f/extension-f-both-backends-down.png` (continuation of 502 HTML body at top)

### 2. Backend Recovery → HTTP 200 OK

**Procedure:** Restart both backends. Send a request to nginx.

**Result:**

```
HTTP/1.1 200 OK
X-Backend: A
```

After both backends were restarted, the same endpoint returned `HTTP 200 OK`.

Evidence: `evidence/phase-2/extension-f/extension-f-both-backends-down.png`

### 3. Wrong Destination Port → Connection Failure

**Procedure:** Send a request to port 8444 (nothing listening).

```bash
curl -k -i --connect-timeout 3 https://127.0.0.1:8444/api/status
```

**Result:**

```
curl: (7) Failed to connect to 127.0.0.1 port 8444 after 0 ms: Could not connect to server
```

No HTTP response — the TCP connection itself failed because nothing is listening on port 8444.

Evidence: `evidence/phase-2/extension-f/extension-f-both-backends-down.png` (same screenshot, final entry)

## What Was NOT Tested

- Wrong DNS server fault injection (pointing client at a non-responding resolver).
- Wrong DNS A record (inserting a deliberately incorrect IP into dnsmasq).

## Status

✅ **Complete** — All three planned troubleshooting scenarios successfully demonstrated.

## Key Finding

The difference between `HTTP 502 Bad Gateway` and `curl error (7) Connection refused`:
- **502**: The proxy is running and accepting connections, but cannot reach the upstream backend.
- **curl error 7**: The TCP connection itself cannot be established — nothing is listening at the target address and port.

This distinction is important when diagnosing network vs. application-layer failures.
