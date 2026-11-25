# WireTitan Architecture

## 1. System Topology

WireTitan is deployed across two Mac computers connected through a shared LAN. The architecture consists of a DNS server, two backend REST services, a primary nginx edge on Mac 2, and a standby nginx edge on Mac 1.

```text
                    Client
                      │
              DNS Query (UDP/TCP :53)
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Mac 1 – Farhana            │
        │  10.7.10.202                │
        │                             │
        │  dnsmasq (port 53)          │
        │  app.wiretitan.test → 10.7.3.20  │
        │  api.wiretitan.test → 10.7.3.20  │
        │  TTL = 30 seconds           │
        └─────────────────────────────┘
                      │
        (DNS resolves app.wiretitan.test → 10.7.3.20)
                      │
              HTTPS :8443
                      ▼
        ┌─────────────────────────────┐
        │  Mac 2 – Anshu              │
        │  10.7.3.20                  │
        │                             │
        │  Primary nginx (:8443)      │
        │  TLS termination            │
        │  Round-robin load balance   │
        │  HTTP proxy cache           │
        └──────────┬──────────────────┘
                   │
         ┌─────────┴───────────┐
         ▼                     ▼
 Backend A                 Backend B
 10.7.10.202:3001          127.0.0.1:3002
 (Mac 1 – remote)          (Mac 2 – loopback)

Additional component:

        ┌─────────────────────────────┐
        │  Mac 1 – Farhana            │
        │  Standby nginx (:8443)      │
        │  Proxies → 10.7.3.20:8443  │
        │  (NOT independent)          │
        └─────────────────────────────┘
```

## 2. Machine / Service Roles

| Machine / Service | IP | Port | Role |
|---|---|---|---|
| dnsmasq (Mac 1) | `10.7.10.202` | `53` | Private DNS, TTL=30 |
| Backend A (Mac 1) | `10.7.10.202` | `3001` | REST backend, app-level isolation |
| Standby nginx (Mac 1) | `10.7.10.202` | `8443` | Alternative HTTPS entry, proxies to Mac 2 |
| Primary nginx (Mac 2) | `10.7.3.20` | `8443` | HTTPS entry, load balancer, cache |
| Backend B (Mac 2) | `127.0.0.1` | `3002` | REST backend, loopback-bound only |

## 3. IP / Port Table

| Component | IP / Host | Port | Protocol | Purpose |
|---|---|---|---|---|
| dnsmasq | `10.7.10.202` | `53` | UDP/TCP | Local DNS |
| Backend A | `10.7.10.202` | `3001` | HTTP | REST service |
| Backend B | `127.0.0.1` | `3002` | HTTP | REST service (loopback) |
| Primary nginx | `10.7.3.20` | `8443` | HTTPS | Main edge |
| Standby nginx | `10.7.10.202` | `8443` | HTTPS | Alt edge (proxy only) |

## 4. Request Flow

1. Client queries dnsmasq on `10.7.10.202:53` for `app.wiretitan.test`.
2. dnsmasq returns `10.7.3.20` with TTL=30 seconds.
3. Client establishes TCP connection to `10.7.3.20:8443`.
4. nginx on Mac 2 terminates TLS using `app.wiretitan.test` certificate.
5. nginx checks proxy cache. If `HIT`, returns cached response with `X-Cache-Status: HIT`.
6. If `MISS`, nginx selects the next backend in round-robin order.
7. nginx forwards request to Backend A (`10.7.10.202:3001`) or Backend B (`127.0.0.1:3002`).
8. Backend returns JSON response with `X-Backend: A` or `X-Backend: B` header.
9. nginx caches the response and returns it to the client with `X-Cache-Status: MISS`.
10. Client receives `HTTP 200 OK` with JSON body.

## 5. DNS Names

| Name | Type | Current Value | TTL |
|---|---|---|---|
| `app.wiretitan.test` | A | `10.7.3.20` | 30 s |
| `api.wiretitan.test` | A | `10.7.3.20` | 30 s |

> During Extension E, `app.wiretitan.test` was temporarily set to `10.7.10.202`. After testing, it was restored to `10.7.3.20`.

## 6. TLS and Security

TLS is terminated at nginx. The certificate `app.wiretitan.test.crt` is signed by a local CA (`wiretitan-ca.crt`). Clients must trust the local CA to establish verified HTTPS connections.

> **Private keys (`*.key`) must never be committed to this repository.**

See `tls/README.md` for CA setup and client trust configuration.

## 7. Standby Edge – Important Limitation

The standby nginx on Mac 1 accepts HTTPS connections but proxies all traffic to the primary nginx on Mac 2 (`https://10.7.3.20:8443`). This means:

- If the primary nginx (Mac 2) is down, the standby edge **cannot** serve requests independently.
- The standby is an alternative **entry point** only, not a fully independent failover edge.
- Backends A and B are still reached through the primary nginx on Mac 2.
