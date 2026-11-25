# WireTitan – Private Network Service Platform

> **Computer Networks Project · Phase 1 & Phase 2**  
> Team: Farhana Pervin (Mac 1) · Anshu Yadav (Mac 2)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Objectives](#objectives)
3. [Technologies](#technologies)
4. [Two-Mac Architecture](#two-mac-architecture)
5. [IP and Port Reference](#ip-and-port-reference)
6. [DNS Names](#dns-names)
7. [Request Flow](#request-flow)
8. [Phase 1 Summary](#phase-1-summary)
9. [Phase 2 Extensions](#phase-2-extensions)
10. [Setup Instructions](#setup-instructions)
11. [Testing Commands](#testing-commands)
12. [Repository Structure](#repository-structure)
13. [Security Notes](#security-notes)
14. [Team Responsibilities](#team-responsibilities)
15. [Limitations](#limitations)

---

## Project Overview

WireTitan is a private network service platform built for a Computer Networks course project. It demonstrates DNS resolution, TCP connections, TLS termination, HTTP caching, reverse proxying, load balancing, backend failover, and edge migration — all running across two physical Mac computers on a shared LAN.

---

## Objectives

- Provide local DNS using `dnsmasq` with configurable TTL
- Run two independent REST backend services (Backend A and Backend B)
- Front both backends through an nginx reverse proxy with HTTPS termination
- Demonstrate round-robin load balancing and HTTP response caching
- Show backend failover and automatic recovery
- Demonstrate controlled DNS-based edge migration
- Document service isolation through bind-address restriction and application-level access control
- Capture and present network-level evidence using curl, dig, and Wireshark

---

## Technologies

| Technology | Purpose |
|---|---|
| dnsmasq | Private DNS server |
| Node.js + Express | Backend A and Backend B REST services |
| nginx | HTTPS reverse proxy, load balancer, HTTP cache |
| OpenSSL / local CA | TLS certificate generation and trust |
| curl | HTTP/HTTPS testing and evidence collection |
| dig | DNS query testing and TTL verification |
| Wireshark | TCP and TLS handshake capture (Phase 1) |
| Git + GitHub | Version control and repository management |

---

## Two-Mac Architecture

```text
                           ┌─────────────────────────────────┐
                           │   Mac 1 – Farhana (10.7.10.202) │
                           │                                 │
                           │  ┌───────────────────────────┐  │
                           │  │   dnsmasq DNS (:53)       │  │
                           │  │   app.wiretitan.test      │  │
                           │  │   api.wiretitan.test      │  │
                           │  │   TTL = 30 s              │  │
                           │  └───────────────────────────┘  │
                           │                                 │
                           │  ┌───────────────────────────┐  │
                           │  │  Backend A (:3001)        │  │
                           │  │  Listens: 0.0.0.0:3001    │  │
                           │  │  App-level edge filtering │  │
                           │  └───────────────────────────┘  │
                           │                                 │
                           │  ┌───────────────────────────┐  │
                           │  │  Standby nginx (:8443)    │  │
                           │  │  Proxies → Mac 2 :8443    │  │
                           │  │  (NOT independent)        │  │
                           │  └───────────────────────────┘  │
                           └─────────────────────────────────┘
                                           ▲
                                     LAN / Wi-Fi
                                           ▼
      Client ──DNS──► dnsmasq (Mac 1)
      Client ──HTTPS:8443──► nginx (Mac 2 primary)
                                           │
                           ┌─────────────────────────────────┐
                           │   Mac 2 – Anshu (10.7.3.20)    │
                           │                                 │
                           │  ┌───────────────────────────┐  │
                           │  │  Primary nginx (:8443)    │  │
                           │  │  HTTPS termination        │  │
                           │  │  Round-robin load balance │  │
                           │  │  HTTP caching             │  │
                           │  └─────────┬─────────────────┘  │
                           │            │                     │
                           │      ┌─────┴──────────┐          │
                           │      ▼                ▼          │
                           │  Backend A        Backend B      │
                           │  10.7.10.202:3001 127.0.0.1:3002│
                           │  (Mac 1)          (local only)   │
                           └─────────────────────────────────┘
```

**Primary nginx on Mac 2** receives all HTTPS traffic and distributes it between:
- **Backend A** on Mac 1 at `10.7.10.202:3001` — remote backend
- **Backend B** on Mac 2 at `127.0.0.1:3002` — local backend

**Standby nginx on Mac 1** accepts HTTPS traffic on port 8443 but proxies it to the primary nginx on Mac 2 at `10.7.3.20:8443`. It is **not** an independent failover edge.

---

## IP and Port Reference

| Component | Host / IP | Port | Protocol | Location |
|---|---|---|---|---|
| dnsmasq DNS | `10.7.10.202` | `53` | UDP/TCP | Mac 1 |
| Backend A | `10.7.10.202` | `3001` | HTTP | Mac 1 |
| Backend B | `127.0.0.1` | `3002` | HTTP | Mac 2 (loopback only) |
| Primary nginx | `10.7.3.20` | `8443` | HTTPS | Mac 2 |
| Standby nginx | `10.7.10.202` | `8443` | HTTPS | Mac 1 |

---

## DNS Names

| Hostname | Record Type | Final Value | TTL |
|---|---|---|---|
| `app.wiretitan.test` | A | `10.7.3.20` | 30 s |
| `api.wiretitan.test` | A | `10.7.3.20` | 30 s |

> **Note:** During the Extension E controlled edge migration test, `app.wiretitan.test` was temporarily changed to `10.7.10.202`. The final state points back to `10.7.3.20`.

---

## Request Flow

A normal application request follows this path:

```
1. DNS        Client queries dnsmasq on Mac 1 (10.7.10.202:53)
                → resolves app.wiretitan.test → 10.7.3.20 (TTL 30 s)

2. TCP         Client opens TCP connection to 10.7.3.20:8443

3. TLS         nginx on Mac 2 presents app.wiretitan.test certificate
               Client verifies against local CA

4. HTTP        Client sends HTTP GET /api/status over TLS

5. nginx       Checks proxy cache (X-Cache-Status: HIT / MISS)
               If MISS, selects next backend in round-robin

6. Backend     Chosen backend (A or B) processes request and responds
               with X-Backend: A or X-Backend: B header

7. nginx       Returns response to client; caches if cacheable

8. Client      Receives JSON response with HTTP 200 OK
```

---

## Phase 1 Summary

Phase 1 established the core WireTitan infrastructure:

| Feature | Evidence |
|---|---|
| dnsmasq DNS resolution | `evidence/dns/` |
| TCP three-way handshake | `evidence/tcp/` |
| TLS handshake (Wireshark) | `evidence/tls/` |
| HTTP headers and responses | `evidence/http/` |
| nginx load balancing (A/B) | `evidence/load-balancing/` |
| nginx HTTP caching (MISS→HIT) | `evidence/caching/` |

---

## Phase 2 Extensions

| Extension | Description | Status |
|---|---|---|
| **A – Backup DNS** | Secondary DNS failover path | ⚠️ Blocked by university firewall |
| **B – DNS TTL** | TTL=30 configured and verified; DNS record change demonstrated | ⚠️ Partial (client-side cache expiry not observed) |
| **C – Service Isolation** | App-level filtering (Backend A 403); Backend B loopback bind | ⚠️ Partial (PF firewall blocked by managed device) |
| **D – High Availability** | Load balancing, failover on Backend A stop, recovery verified | ✅ Complete |
| **E – Edge Migration** | DNS record change to standby; HTTPS 200 through standby nginx | ⚠️ Partial (standby not independent of primary) |
| **F – Troubleshooting** | 502 on both backends down; 200 on recovery; wrong port fails | ✅ Complete |

### Extension A – Backup DNS
Intended design: configure a secondary DNS server on Mac 2 so that if the primary dnsmasq on Mac 1 becomes unreachable, Mac 2 would continue resolving `app.wiretitan.test`.

**Result:** The university-managed macOS firewall blocked inbound DNS traffic (UDP/TCP port 53) on the student Mac used as the backup DNS host. Remote backup DNS failover could not be validated. The design is documented in `docs/phase-2/extension-a-backup-dns.md`.

### Extension B – DNS TTL ⚠️ Partial
- Configured `local-ttl=30` in dnsmasq.
- Verified TTL=30 using `dig @127.0.0.1 app.wiretitan.test` on Mac 1.
- Changed DNS A record from `10.7.3.20` to `10.7.10.202` during Extension E and verified with `dscacheutil` on Mac 2.
- **Not demonstrated:** Client-side retention of an old cached DNS answer until TTL expiry, nor manual DNS cache flushing with `dscacheutil -flushcache`.

Evidence: `evidence/phase-2/extension-b/`

### Extension C – Service Isolation ⚠️ Partial
- **Backend A** implements application-level source filtering. Direct access from Mac 1 (not via nginx) returns `HTTP 403 Forbidden`.
- **Backend B** binds to `127.0.0.1:3002`, making it unreachable from other machines on the LAN. Mac 1 direct access to `10.7.3.20:3002` returns `curl: (7) Failed to connect`.
- **Not completed:** PF packet-filter firewall rules could not be loaded or tested on the university-managed Macs.

Evidence: `evidence/phase-2/extension-c/`

### Extension D – High Availability ✅ Complete
- Normal load balancing: 6 sequential requests returned `A B A B A B`.
- Backend A stopped: 6 requests returned `B B B B B B`.
- Backend A restarted: requests returned to `A/B` alternation.
- **Limitation noted:** The primary nginx on Mac 2 remains a single point of failure.

Evidence: `evidence/phase-2/extension-d/`

### Extension E – Controlled Edge Migration ⚠️ Partial
- Standby nginx configured on Mac 1 (port 8443).
- DNS A record changed from `10.7.3.20` to `10.7.10.202`.
- Direct HTTPS to `https://127.0.0.1:8443` on Mac 1 returned `HTTP 200` with `X-Backend: A`.
- `curl --resolve app.wiretitan.test:8443:10.7.10.202` returned `HTTP 200`.
- Mac 2 also confirmed the new DNS entry via `dscacheutil`.
- **Limitation:** Standby nginx proxies to primary nginx. It is not independent. Old cached clients retaining the previous edge IP until TTL expiry was not observed.

Evidence: `evidence/phase-2/extension-e/`

### Extension F – Troubleshooting ✅ Complete
- Both backends stopped → nginx returned `HTTP 502 Bad Gateway`.
- Both backends restored → nginx returned `HTTP 200 OK`.
- Request to wrong port `127.0.0.1:8444` → `curl: (7) Failed to connect`.
- DNS fault injection (wrong DNS server or wrong A record) was **not** tested.

Evidence: `evidence/phase-2/extension-f/`

---

## Setup Instructions

### Prerequisites

Both Macs must be on the same LAN. Node.js, nginx (Homebrew), and dnsmasq must be installed.

### Mac 1 (Farhana – 10.7.10.202)

```bash
# 1. Start dnsmasq
brew services start dnsmasq
# Or with explicit config:
sudo dnsmasq --conf-file=/path/to/dns/dnsmasq.conf --no-daemon

# 2. Verify DNS
dig @127.0.0.1 app.wiretitan.test
# Expected: app.wiretitan.test. 30 IN A 10.7.3.20

# 3. Start Backend A
cd backend-a && node server.js

# 4. (Optional) Start standby nginx
nginx -c /path/to/nginx/phase-2/standby.conf
```

### Mac 2 (Anshu – 10.7.3.20)

```bash
# 1. Configure DNS resolver to use Mac 1
sudo networksetup -setdnsservers Wi-Fi 10.7.10.202

# 2. Start Backend B
cd backend-b && node server.js

# 3. Start primary nginx
nginx -c /path/to/nginx/phase-2/primary.conf

# 4. Test
curl -k -i https://127.0.0.1:8443/api/status
```

> See `docs/setup.md` for detailed startup instructions and `docs/troubleshooting.md` for common issues.

---

## Testing Commands

```bash
# DNS resolution
dig @10.7.10.202 app.wiretitan.test

# HTTPS via primary edge (Mac 2)
curl -k -i https://app.wiretitan.test:8443/api/status

# Load balancing – run 6 times and check X-Backend header
for i in 1 2 3 4 5 6; do
  curl -ks https://127.0.0.1:8443/api/status | python3 -c 'import sys,json; print(json.load(sys.stdin)["backend"])'
done

# Caching – first request shows MISS, subsequent shows HIT
curl -k -i https://app.wiretitan.test:8443/api/status
# Look for: X-Cache-Status: HIT

# Standby edge (Mac 1)
curl -k -i --connect-timeout 5 --max-time 10 https://127.0.0.1:8443/api/status

# Hostname routing through standby (Mac 2)
curl -k -i --resolve app.wiretitan.test:8443:10.7.10.202 https://app.wiretitan.test:8443/api/status

# Extension C – direct Backend A access (should return 403)
curl -s -i http://10.7.10.202:3001/api/status

# Extension F – wrong port (should fail to connect)
curl -k -i --connect-timeout 3 https://127.0.0.1:8444/api/status
```

> **TLS Validation Note:** Commands above using `curl -k` verify HTTPS connectivity only while skipping certificate validation. To demonstrate certificate trust, use `curl --cacert <path-to-wiretitan-ca.crt> https://app.wiretitan.test:8443/api/status` (see [tls/README.md](tls/README.md)).

---

## Repository Structure

```text
WireTitan/
├── README.md
├── .gitignore
│
├── backend-a/
│   ├── server.js           # Backend A (Mac 1, port 3001, app-level isolation)
│   └── package.json
│
├── backend-b/
│   ├── server.js           # Backend B (Mac 2, port 3002, loopback bind)
│   └── package.json
│
├── dns/
│   ├── dnsmasq.conf        # Main dnsmasq configuration (Mac 1)
│   └── phase2-dns-config.conf  # Phase 2 DNS reference with TTL and migration notes
│
├── nginx/
│   ├── nginx.conf          # Phase 1 reference configuration
│   └── phase-2/
│       ├── primary.conf    # Primary edge – Mac 2 (load balancing, caching)
│       └── standby.conf    # Standby edge – Mac 1 (proxies to primary)
│
├── tls/
│   └── README.md           # TLS certificate setup and client trust notes
│
├── docs/
│   ├── architecture.md     # Two-Mac architecture description
│   ├── setup.md            # Startup and configuration guide
│   ├── troubleshooting.md  # Common issues and fixes
│   └── phase-2/
│       ├── phase2-report.md                    # Phase 2 Markdown report
│       ├── WireTitan_Phase_2_Final_Report.pdf  # Official submitted PDF
│       ├── extension-a-backup-dns.md
│       ├── extension-b-dns-ttl.md
│       ├── extension-c-service-isolation.md
│       ├── extension-d-ha-failover.md
│       ├── extension-e-edge-migration.md
│       ├── extension-f-troubleshooting.md
│       └── phase2-architecture.png
│
└── evidence/
    ├── dns/                        # Phase 1 DNS evidence
    ├── tcp/                        # Phase 1 TCP handshake evidence
    ├── tls/                        # Phase 1 TLS handshake evidence
    ├── http/                       # Phase 1 HTTP header evidence
    ├── caching/                    # Phase 1 cache MISS/HIT evidence
    ├── load-balancing/             # Phase 1 load balancing evidence
    └── phase-2/
        ├── extension-a/            # (No evidence – firewall blocked)
        ├── extension-b/            # TTL=30 dig output; DNS record change
        ├── extension-c/            # Backend A 403; Backend B remote refused
        ├── extension-d/            # Normal load balance; failover; recovery
        ├── extension-e/            # Standby nginx tests; DNS cutover; resolve
        └── extension-f/            # 502 down; 200 recovery; wrong port
```

---

## Security Notes

This is a **public repository**.

The following files must **never** be committed:
- `wiretitan-ca.key` — CA private key
- `app.wiretitan.test.key` — Server private key
- Any `.env` file containing passwords or tokens
- Any `.pem` or `.key` file

The `.gitignore` excludes `*.key`, `*.pem`, `*.p12`, `.env`, `node_modules/`, `logs/`, and nginx cache directories.

If you discover a private key in the repository history, stop and report it immediately. Do not rewrite history without explicit team approval.

Public certificates (`.crt`) may be included when needed for client trust documentation.

---

## Team Responsibilities

| Team Member | Role |
|---|---|
| **Farhana Pervin** (Mac 1 · 10.7.10.202) | dnsmasq configuration, Backend A, TLS setup, standby nginx, Wireshark evidence, Phase 2 Ext B/C/E Mac 1 testing |
| **Anshu Yadav** (Mac 2 · 10.7.3.20) | Backend B, primary nginx, HTTPS termination, load balancing, Phase 2 Ext C/D/E/F Mac 2 testing, GitHub organisation |

---

## Limitations

| Limitation | Detail |
|---|---|
| Extension A incomplete | University firewall blocked inbound DNS traffic on the backup host |
| Extension B partial | TTL=30 verified; client-side cache expiry not observed |
| Extension C partial | Application-level isolation verified; PF firewall enforcement blocked by managed device |
| Extension E partial | Standby nginx is not independent; it proxies to primary nginx |
| Standby SPOF | Standby nginx cannot serve requests if primary nginx (Mac 2) is down |
| Primary SPOF | The primary nginx edge itself remains a single point of failure |
| Old-client TTL retention | Client retaining an old cached DNS answer until TTL expiry was not demonstrated in any extension |
