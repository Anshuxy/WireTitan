# WireTitan

## Project Overview

WireTitan is a networking project demonstrating local DNS, REST backend services, nginx reverse proxy/load balancing, HTTPS/TLS, and HTTP caching.

The project uses two backend services behind nginx. DNS is handled using `dnsmasq`, while nginx provides the HTTPS entry point, reverse proxy, load balancing, and caching.

## Architecture

```text
                     Client
                       |
                  HTTPS :8443
                       |
                       v
                +-------------+
                |    nginx    |
                | TLS / Proxy |
                | Load Balance|
                |   + Cache   |
                +------+------+
                       |
              +--------+--------+
              |                 |
              v                 v
       Backend A          Backend B
    10.7.6.126:3001      127.0.0.1:3002
```

DNS names used by the project:

```text
app.wiretitan.test
api.wiretitan.test
```

## IP / Port Table

| Component | IP / Host            |   Port |
| --------- | -------------------- | -----: |
| Backend A | `10.7.6.126`         | `3001` |
| Backend B | `127.0.0.1`          | `3002` |
| nginx     | `app.wiretitan.test` | `8443` |

Backend A and Backend B are configured as nginx upstream servers, while nginx provides HTTPS on port `8443`.

## Team Roles

| Team Member          | Responsibility                                                                     |
| -------------------- | ---------------------------------------------------------------------------------- |
| Farhana Pervin/ Mac1 | Backend A, dnsmasq configuration, TLS setup notes, Wireshark evidence              |
| Anshu Yadav/ Mac2    | Backend B, nginx configuration, GitHub organization/push, final README integration |

Both members' work is included in the same repository.

## DNS Setup

DNS is configured using `dnsmasq`.

Configuration file:

```text
dns/dnsmasq.conf
```

The configuration provides the following local names:

```text
app.wiretitan.test
api.wiretitan.test
```

The relevant machine IP addresses are configured in `dnsmasq.conf`.

## Backend A

Backend A is stored in:

```text
backend-a/
```

It runs as a REST service on:

```text
10.7.6.126:3001
```

## Backend B

Backend B is stored in:

```text
backend-b/
```

It runs as a REST service on:

```text
127.0.0.1:3002
```

Both backend applications are simple REST services.

## nginx Load Balancer

nginx is configured in:

```text
nginx/nginx.conf
```

It provides:

* Reverse proxy
* Load balancing between Backend A and Backend B
* HTTPS on port `8443`
* TLS certificate configuration
* HTTP caching

The configured upstream servers are Backend A at `10.7.6.126:3001` and Backend B at `127.0.0.1:3002`.

## HTTPS / TLS

HTTPS is served by nginx on port `8443` using the local TLS certificate configuration.

TLS setup and client trust configuration are documented in:

```text
tls/README.md
```

Private keys, passwords, tokens, and other secrets must not be committed to GitHub.

## HTTP Caching

nginx provides HTTP caching for configured responses.

Caching can be verified using the response header:

```text
X-Cache-Status: MISS
```

followed by:

```text
X-Cache-Status: HIT
```

for subsequent cached requests.

## Testing

The system can be tested by:

1. Checking DNS resolution for `app.wiretitan.test`.
2. Starting Backend A and Backend B.
3. Starting nginx.
4. Sending HTTPS requests to:

```text
https://app.wiretitan.test:8443
```

5. Checking load balancing using:

```text
X-Backend: A
X-Backend: B
```

6. Checking caching using:

```text
X-Cache-Status: MISS
X-Cache-Status: HIT
```

## Wireshark Evidence

The `evidence/` directory contains screenshots and evidence for the networking tests:

```text
evidence/
├── dns/
├── tcp/
├── tls/
├── http/
├── load-balancing/
└── caching/
```

Evidence includes DNS queries, TCP handshake, TLS handshake, HTTP headers, load balancing, and caching behavior.

## How to Run

Start the components in the following order:

```text
1. Start dnsmasq
2. Start Backend A
3. Start Backend B
4. Start nginx
5. Test HTTPS
```

Main configuration files:

```text
dns/dnsmasq.conf
nginx/nginx.conf
tls/README.md
```

For detailed startup and troubleshooting instructions, see:

```text
docs/setup.md
docs/troubleshooting.md
```

## Repository Structure

```text
WireTitan/
├── README.md
├── backend-a/
├── backend-b/
├── dns/
├── nginx/
├── tls/
├── docs/
└── evidence/
```

---

# Phase 2 – Advanced Network Services and High Availability

## 1. Overview

Phase 2 extends the WireTitan private network service platform developed in Phase 1.

The objective is to improve service availability, DNS management, backend isolation, edge migration and failure recovery.

The implementation uses two Mac computers connected through a private network.

## 2. Phase 2 Objectives

The following extensions were investigated:

- Extension A: Backup DNS
- Extension B: DNS TTL Management
- Extension C: Service Isolation
- Extension D: High Availability and Backend Failover
- Extension E: Edge Migration
- Extension F: Troubleshooting and Failure Testing

## 3. Updated Architecture

WireTitan uses the following components:

| Component | Technology |
|---|---|
| DNS service | dnsmasq |
| Reverse proxy | Nginx |
| Backend A | Node.js and Express |
| Backend B | Node.js and Express |
| HTTPS | TLS/SSL |
| Load balancing | Nginx upstream |
| DNS testing | dig |
| HTTP testing | curl |
| Repository management | Git and GitHub |

Application hostname:

`app.wiretitan.test`

HTTPS port:

`8443`

DNS TTL:

`30 seconds`

## 4. Phase 2 Extensions

### Extension A – Backup DNS

Investigated an alternative DNS resolution path to improve DNS availability.

Remote backup DNS validation was restricted by the university-managed network firewall.

### Extension B – DNS TTL Management

Configured dnsmasq with a local TTL of 30 seconds.

Verified DNS records and tested hostname migration using dig.

### Extension C – Service Isolation

Investigated application-level access restrictions and network binding to limit unnecessary backend exposure.

Full PF firewall enforcement could not be completed in the managed environment.

### Extension D – High Availability and Failover

Used Nginx upstream configuration to distribute requests between Backend A and Backend B.

Tested backend availability, failure and recovery.

### Extension E – Edge Migration

Tested DNS-based migration of the application hostname between the two edge services.

Verified HTTPS access after updating the DNS record.

The standby edge currently retains an upstream dependency on the primary edge.

### Extension F – Troubleshooting

Performed failure testing involving:

- Both backends unavailable.
- HTTP 502 Bad Gateway.
- Backend recovery.
- Incorrect destination port.
- DNS resolution and migration.

## 5. Testing and Verification

The following results were observed during testing:

| Test | Result |
|---|---|
| DNS resolution | Successful |
| DNS TTL configuration | 30 seconds |
| DNS record migration | Verified |
| HTTPS application access | HTTP 200 OK |
| Backend A/B responses | Verified |
| Both backends unavailable | HTTP 502 |
| Backend recovery | HTTP 200 OK |
| Incorrect destination port | Connection failure |

## 6. Repository Structure

```text
WireTitan/
│
├── backend-a/
├── backend-b/
├── dns/
│   ├── dnsmasq.conf
│   └── phase2-dns-config.conf
│
├── docs/
│   └── phase-2/
│       ├── phase2-report.md
│       ├── extension-a-backup-dns.md
│       ├── extension-b-dns-ttl.md
│       ├── extension-c-service-isolation.md
│       ├── extension-d-ha-failover.md
│       ├── extension-e-edge-migration.md
│       ├── extension-f-troubleshooting.md
│       └── phase2-architecture.png
│
├── evidence/
├── nginx/
│   ├── nginx.conf
│   ├── primary.conf
│   └── standby.conf
│
├── tls/
├── .gitignore
└── README.md
```

## 7. Limitations

The following limitations were encountered:

1. Remote backup DNS validation was restricted by the university-managed firewall.
2. Client-side DNS cache persistence was not fully demonstrated.
3. PF firewall enforcement could not be completed in the managed environment.
4. The standby nginx edge currently depends on the primary nginx upstream.

These limitations are documented to distinguish completed implementation from incomplete validation.

## 8. Conclusion

Phase 2 extends WireTitan with DNS TTL management, backend load balancing, failure recovery, edge migration and troubleshooting.

The project demonstrates how multiple network services can work together to improve application availability and reliability.

The implementation and testing evidence are maintained in this repository for documentation, verification and future improvements.



