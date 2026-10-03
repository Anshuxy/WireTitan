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

Before pushing the repository, verify that both backend source codes, DNS/nginx configuration, TLS notes, and evidence are present, and that no private keys or secrets are included.

