# Extension C – Service Isolation

## Objective

Restrict backend access so that only authorised traffic (via the nginx edge) can reach the backend services. Demonstrate that direct access from unauthorized sources is blocked.

## Implementation

### Backend A – Application-Level Source Filtering

Backend A (`backend-a/server.js`) listens on `0.0.0.0:3001` so Mac 2's nginx can reach it across the LAN.

It applies application-level source IP filtering (not PF firewall enforcement) by checking the TCP peer address via `req.socket.remoteAddress` (handling IPv4-mapped IPv6 addresses such as `::ffff:10.7.3.20`). Only requests arriving from the Mac 2 primary nginx IP (`10.7.3.20`) are allowed; requests from other source IPs (including direct requests from Mac 1) are rejected with `HTTP 403 Forbidden`. Client-supplied HTTP headers such as `X-Forwarded-For` or `X-Real-IP` are not trusted as proof of identity.

### Backend B – Bind-Address Isolation

Backend B (`backend-b/server.js`) binds to `127.0.0.1:3002` only. It is not reachable from other machines on the LAN. Mac 1 cannot connect to `10.7.3.20:3002`.

## Test Results

### Backend A direct access from Mac 1 → HTTP 403

```
curl -s -i http://10.7.10.202:3001/api/status
HTTP/1.1 403 Forbidden
{"error":"Access denied"}
```

Evidence: `evidence/phase-2/extension-c/extension-c-backend-a-direct-403.png`

### Backend B remote access from Mac 1 → connection refused

```
curl -i --connect-timeout 5 http://10.7.3.20:3002/api/status
curl: (7) Failed to connect to 10.7.3.20 port 3002 after 1011 ms
```

Evidence: `evidence/phase-2/extension-c/extension-c-backend-a-direct-403.png` (same screenshot)

### Backend B listener verification on Mac 2

```
lsof -nP -iTCP:3002 -sTCP:LISTEN
# TCP 127.0.0.1:3002 (LISTEN)
```

Evidence: `evidence/phase-2/extension-c/extension-c-backend-b-listener-and-reach.png`

### Backend A reachable from Mac 2 nginx → HTTP 200

```
curl -s -i http://10.7.10.202:3001/api/status
HTTP/1.1 200 OK
X-Backend: A
```

Evidence: `evidence/phase-2/extension-c/extension-c-backend-b-listener-and-reach.png`

## What Was NOT Completed

PF packet-filter firewall enforcement (`pfctl -f`) was blocked by managed-device restrictions on the university Macs. OS-level firewall isolation was not tested.

## Status

⚠️ **Partial** — Application-level and bind-address isolation verified. PF firewall enforcement was not achievable.
