# WireTitan Architecture

## 1. System Topology

WireTitan consists of two backend services running on separate machines/processes, with nginx acting as the HTTPS reverse proxy and load balancer.

```text
                         Client
                           |
                           | HTTPS :8443
                           | app.wiretitan.test
                           v
                    +----------------+
                    |     nginx      |
                    | HTTPS / TLS   |
                    | Reverse Proxy |
                    | Load Balancer |
                    |    + Cache     |
                    +-------+--------+
                            |
                    +-------+-------+
                    |               |
                    v               v
          +----------------+  +----------------+
          |   Backend A    |  |   Backend B    |
          | 10.7.6.126     |  | 127.0.0.1     |
          |     :3001      |  |     :3002      |
          +----------------+  +----------------+

DNS:
  app.wiretitan.test
  api.wiretitan.test
        |
        v
     dnsmasq
```

The nginx configuration uses Backend A at `10.7.6.126:3001` and Backend B at `127.0.0.1:3002`. nginx serves HTTPS on port `8443` for `app.wiretitan.test`, performs reverse proxying/load balancing, and provides HTTP caching.

## 2. Machine / Service Roles

| Machine / Service | Role                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Client            | Sends HTTPS requests to the WireTitan application.                                                                                        |
| dnsmasq           | Provides local DNS resolution for `app.wiretitan.test` and `api.wiretitan.test`.                                                          |
| nginx             | Terminates TLS, accepts HTTPS traffic on port `8443`, reverse-proxies requests, load-balances between the backends, and performs caching. |
| Backend A         | REST backend service listening on `10.7.6.126:3001`.                                                                                      |
| Backend B         | REST backend service listening on `127.0.0.1:3002`.                                                                                       |

The project requires both backend applications to remain simple REST services.

## 3. IP / Port Table

| Component | IP / Host            |   Port | Purpose                                                |
| --------- | -------------------- | -----: | ------------------------------------------------------ |
| Backend A | `10.7.6.126`         | `3001` | REST backend                                           |
| Backend B | `127.0.0.1`          | `3002` | REST backend                                           |
| nginx     | `app.wiretitan.test` | `8443` | HTTPS entry point / reverse proxy                      |
| DNS       | Local dnsmasq        |    DNS | Resolves `app.wiretitan.test` and `api.wiretitan.test` |

The documented nginx upstream endpoints are `10.7.6.126:3001` for Backend A and `127.0.0.1:3002` for Backend B; nginx exposes HTTPS on `8443`.

> **Note:** The guide says to document the relevant Mac IPs for the DNS configuration, but it does not provide every machine's IP address in the document. Do not invent any additional IP addresses; replace/add them here once they are confirmed from the team's actual configuration.

## 4. Request Flow

A typical application request follows this path:

1. The client requests `app.wiretitan.test`.
2. Local DNS resolution through dnsmasq resolves the WireTitan hostname to the appropriate machine/IP.
3. The client establishes an HTTPS connection to nginx on port `8443`.
4. nginx terminates the TLS connection using the configured TLS certificate.
5. nginx checks its cache for the requested resource.
6. If the response is cached, nginx can return the cached response.
7. If the response is not cached, nginx forwards the request through its upstream configuration to one of the backend services:

   * Backend A: `10.7.6.126:3001`
   * Backend B: `127.0.0.1:3002`
8. The selected backend processes the REST request and returns the response to nginx.
9. nginx can cache the response according to its caching configuration.
10. nginx returns the HTTP response to the client over the established HTTPS connection.

The evidence requirements specifically include repeated requests demonstrating load balancing between Backend A and Backend B (`X-Backend: A` / `X-Backend: B`) and caching behavior showing `X-Cache-Status: MISS` followed by `HIT`.

## 5. DNS Names

The architecture uses the following local DNS names:

* `app.wiretitan.test`
* `api.wiretitan.test`

These names should be configured through the project's `dns/dnsmasq.conf`.

## 6. TLS and Security

TLS is terminated at nginx. The nginx configuration contains the TLS certificate configuration, and the project includes documentation describing the local CA/certificate setup and client trust configuration.

Private keys and secrets must not be committed to the repository. In particular, files such as `wiretitan-ca.key` and `app.wiretitan.test.key`, along with passwords and tokens, must remain private.


