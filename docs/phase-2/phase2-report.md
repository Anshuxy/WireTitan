# WireTitan – Phase 2 Final Report

**Project:** WireTitan – Private Network Service Platform  
**Team:** Farhana Pervin (Mac 1 · 10.7.10.202) · Anshu Yadav (Mac 2 · 10.7.3.20)  
**Date:** November 2026

---

## 1. Introduction

WireTitan is a private network service platform developed as part of a Computer Networks course project. Phase 1 established the core infrastructure: local DNS using dnsmasq, two REST backend services, an nginx reverse proxy with HTTPS termination, round-robin load balancing, and HTTP caching — all demonstrated with curl, dig, and Wireshark evidence.

Phase 2 extends this platform with DNS TTL management, service isolation, high availability through backend failover, DNS-based edge migration, and systematic fault troubleshooting. The implementation uses two Mac computers connected through a shared LAN.

---

## 2. Phase 2 Objectives

| # | Objective |
|---|---|
| A | Investigate backup DNS configuration for DNS redundancy |
| B | Configure and verify DNS TTL; demonstrate controlled DNS record changes |
| C | Improve backend service isolation through bind-address restriction and application-level access control |
| D | Implement high availability through nginx upstream failover and recovery |
| E | Demonstrate controlled edge migration using DNS record changes |
| F | Test failure scenarios and verify recovery behaviour |

---

## 3. System Architecture

### 3.1 Two-Mac Deployment

| Component | Mac | IP | Port |
|---|---|---|---|
| dnsmasq DNS | Mac 1 (Farhana) | `10.7.10.202` | `53` |
| Backend A | Mac 1 (Farhana) | `10.7.10.202` | `3001` |
| Standby nginx | Mac 1 (Farhana) | `10.7.10.202` | `8443` |
| Primary nginx | Mac 2 (Anshu) | `10.7.3.20` | `8443` |
| Backend B | Mac 2 (Anshu) | `127.0.0.1` | `3002` |

Application hostname: `app.wiretitan.test`  
DNS TTL: 30 seconds  
HTTPS port: 8443

### 3.2 Architecture Diagram

```text
Client
  │
  │  1. DNS query → 10.7.10.202:53
  ▼
dnsmasq (Mac 1)  →  app.wiretitan.test → 10.7.3.20 (TTL=30s)
  │
  │  2. HTTPS connection → 10.7.3.20:8443
  ▼
Primary nginx (Mac 2)
  │  TLS termination · HTTP caching · Round-robin
  │
  ├──► Backend A (10.7.10.202:3001) [Mac 1]
  └──► Backend B (127.0.0.1:3002) [Mac 2]

Standby nginx (Mac 1, port 8443):
  Accepts HTTPS → proxies to Primary nginx (10.7.3.20:8443)
  ⚠️ NOT independent of primary nginx
```

### 3.3 Important Architecture Limitation

The standby nginx on Mac 1 does not connect directly to the backends. It proxies all requests to the primary nginx on Mac 2 (`https://10.7.3.20:8443`). Therefore:

- If the primary nginx (Mac 2) fails, the standby **cannot** continue serving requests.
- The standby provides an alternative entry point and DNS-based migration capability only.
- This limitation is clearly noted in all extension documentation.

---

## 4. Technologies Used

- **Node.js + Express** — Backend A and Backend B REST services
- **nginx 1.31.x** — Primary and standby HTTPS edges, load balancer, proxy cache
- **dnsmasq** — Private DNS server with configurable TTL
- **OpenSSL / local CA** — TLS certificate generation and trust
- **curl** — HTTP/HTTPS testing and evidence collection
- **dig** — DNS query testing and TTL verification
- **dscacheutil / scutil** — macOS DNS cache inspection
- **Wireshark** — TCP and TLS packet capture (Phase 1)
- **Git + GitHub** — Version control and repository management

---

## 5. Extension A – Backup DNS

### 5.1 Objective

Configure a secondary DNS server so that if the primary dnsmasq instance on Mac 1 becomes unreachable, an alternative DNS resolver could respond to queries for `app.wiretitan.test`.

### 5.2 Intended Design

- Run a secondary dnsmasq (or bind9) instance on Mac 2.
- Configure Mac 2's resolver to try `10.7.10.202:53` first, then fall back to `10.7.3.20:53`.
- Test failover by stopping dnsmasq on Mac 1 and verifying Mac 2 continues resolving the hostname.

### 5.3 Result: Blocked

The university-managed macOS firewall on the student Macs blocks inbound DNS traffic on UDP/TCP port 53. The firewall rules are enforced at the operating-system level and cannot be modified on managed devices. Because inbound port 53 was blocked, Mac 2 could not receive DNS queries from Mac 1 (or any external client), making remote backup DNS failover impossible to test.

### 5.4 Status

⚠️ **Blocked** — University-managed device firewall prevented remote DNS testing. The design is documented. No evidence screenshots exist for this extension.

### 5.5 Learning

Managing DNS redundancy in enterprise environments requires firewall coordination. When managed-device restrictions prevent testing, documenting the intended design and the specific restriction accurately is the appropriate response.

---

## 6. Extension B – DNS TTL Management

### 6.1 Objective

Configure dnsmasq with a short DNS TTL to enable rapid DNS record changes. Verify the TTL value and demonstrate that a DNS record change propagates to clients.

### 6.2 Implementation

Updated `dns/dnsmasq.conf` with:

```
local-ttl=30
address=/app.wiretitan.test/10.7.3.20
address=/api.wiretitan.test/10.7.3.20
```

### 6.3 Test Results

**TTL Verification (Mac 1 — white terminal):**

Using `dig @127.0.0.1 app.wiretitan.test` on Mac 1:

```
;; ANSWER SECTION:
app.wiretitan.test.    30    IN    A    10.7.10.202
;; SERVER: 127.0.0.1#53
```

The dig output confirmed TTL=30. The A record was `10.7.10.202` at the time of this capture (during the Extension E edge migration test when the DNS record was temporarily pointed at Mac 1).

Evidence: `evidence/phase-2/extension-b/extension-b-ttl-30.png`

**DNS Record Change (Mac 2 — dark terminal):**

After changing the DNS A record (during Extension E), `dscacheutil -q host -a name app.wiretitan.test` on Mac 2 showed the new address `10.7.3.20` immediately after restoration. Screenshots in the Extension B evidence folder show the record changing between `10.7.10.202` and `10.7.3.20`.

Evidence: `evidence/phase-2/extension-b/extension-b-record-change.png`

### 6.4 What Was NOT Demonstrated

- Client-side retention of the old cached DNS answer for the full 30-second TTL period before the new answer was accepted.
- Manual DNS cache flushing using `dscacheutil -flushcache`.

### 6.5 Status

⚠️ **Partial** — TTL=30 configured and verified; DNS record changes verified. Client-side cache expiry not observed.

### 6.6 Learning

DNS TTL is a critical tool for controlling how quickly clients adopt DNS changes. A TTL of 30 seconds allows rapid migration but requires that clients actually honour the TTL. macOS's DNS cache behaviour made it difficult to observe the client-side retention period in practice.

---

## 7. Extension C – Service Isolation

### 7.1 Objective

Restrict access to the backend services so that they are not directly accessible from unauthorized sources. Use network binding and application-level access control.

### 7.2 Implementation

**Backend A (Mac 1):**
- Listens on `0.0.0.0:3001` so Mac 2's nginx can reach it across the LAN.
- Applies application-level source filtering: requests that do not arrive through the nginx proxy (i.e. do not have the `X-Forwarded-For` header set by nginx) are rejected with `HTTP 403 Forbidden`.

**Backend B (Mac 2):**
- Binds to `127.0.0.1:3002` only.
- Not reachable from other machines on the LAN. Mac 1 cannot connect to `10.7.3.20:3002`.

### 7.3 Test Results

**Mac 1 direct access to Backend A — HTTP 403 (white terminal):**

```bash
curl -s -i http://10.7.10.202:3001/api/status
# HTTP/1.1 403 Forbidden
# {"error":"Access denied"}
```

This confirmed that Backend A rejected the direct request from Mac 1 (which did not arrive through the nginx edge on Mac 2).

**Mac 1 remote access to Backend B — connection refused (white terminal):**

```bash
curl -i --connect-timeout 5 http://10.7.3.20:3002/api/status
# curl: (7) Failed to connect to 10.7.3.20 port 3002 after 1011 ms
```

This confirmed that Backend B is not reachable from Mac 1.

Evidence: `evidence/phase-2/extension-c/extension-c-backend-a-direct-403.png`

**Mac 2 — Backend B listener verification (dark terminal):**

```
lsof -nP -iTCP:3002 -sTCP:LISTEN
# TCP 127.0.0.1:3002 (LISTEN)
```

Confirmed Backend B was bound to `127.0.0.1` only. Mac 2 nginx could also reach Backend A at `10.7.10.202:3001` and receive `HTTP 200`.

Evidence: `evidence/phase-2/extension-c/extension-c-backend-b-listener-and-reach.png`

### 7.4 What Was NOT Completed

PF packet-filter firewall rules to enforce isolation at the operating-system level could not be tested. The university-managed Mac devices have restrictions that prevent loading custom PF rules with `pfctl -f`.

### 7.5 Status

⚠️ **Partial** — Application-level and bind-address isolation verified. PF firewall enforcement not achievable on managed devices.

### 7.6 Learning

Service isolation can be implemented at different layers: application code (filtering by header/IP), network binding (loopback vs LAN interface), and OS-level firewall rules. Each layer adds defence in depth. When OS-level rules are unavailable, the application and binding layers still provide meaningful isolation.

---

## 8. Extension D – High Availability and Backend Failover

### 8.1 Objective

Demonstrate that nginx distributes requests across both backends and that the system continues operating when one backend fails and recovers when it is restored.

### 8.2 Implementation

Primary nginx on Mac 2 configured with round-robin upstream:

```nginx
upstream backends {
    server 10.7.10.202:3001;   # Backend A
    server 127.0.0.1:3002;     # Backend B
}
```

### 8.3 Test Results

**Normal load balancing (Mac 2 — dark terminal):**

6 requests issued in sequence:

```
A, B, A, B, A, B
```

Confirmed true round-robin distribution between Backend A and Backend B.

Evidence: `evidence/phase-2/extension-d/extension-d-normal-load-balancing.png`

**Backend A stopped — failover to Backend B (Mac 2 — dark terminal):**

Backend A process stopped on Mac 1. 6 requests:

```
B, B, B, B, B, B
```

nginx detected that Backend A was unavailable and routed all requests to Backend B automatically. No `502` errors during failover.

Evidence: `evidence/phase-2/extension-d/extension-d-backend-failover.png`

**Backend A restarted — recovery to A/B distribution (Mac 2 — dark terminal):**

Backend A restarted on Mac 1. 6 requests:

```
B, B, A, B, A, B
```

nginx detected the restored backend and resumed round-robin distribution. The first two responses were `B` while nginx performed its upstream health probe.

Evidence: `evidence/phase-2/extension-d/extension-d-backend-recovery.png`

### 8.4 Limitation

The primary nginx on Mac 2 itself remains a single point of failure. If Mac 2 or the nginx process fails, no traffic can be served (the standby nginx on Mac 1 would also fail because it proxies to the same primary nginx).

### 8.5 Status

✅ **Complete** — Load balancing, failover, and recovery all demonstrated successfully.

### 8.6 Learning

nginx upstream failover is automatic and low-latency. The transition from A/B distribution to B-only and back to A/B happens within a few seconds of the backend becoming unavailable or available. This demonstrates the value of having multiple upstream backends even on a simple two-machine deployment.

---

## 9. Extension E – Controlled Edge Migration

### 9.1 Objective

Demonstrate DNS-based edge migration: change the DNS A record to point to the standby nginx on Mac 1, verify that HTTPS traffic is served through the standby edge, and restore the original configuration.

### 9.2 Implementation

**Standby nginx on Mac 1 (`nginx/phase-2/standby.conf`):**
- Listens on `0.0.0.0:8443` with TLS termination.
- Proxies all requests to `https://10.7.3.20:8443` (primary nginx on Mac 2).

**DNS record change:**
- Changed `address=/app.wiretitan.test/` from `10.7.3.20` to `10.7.10.202` in dnsmasq.
- Verified the new record was returned by DNS queries.

### 9.3 Test Results

**Standby nginx local test — HTTP 200 (Mac 1 — white terminal):**

```bash
curl -k -i --connect-timeout 5 --max-time 10 https://127.0.0.1:8443/api/status
# HTTP/1.1 200 OK
# X-Backend: A
# X-Cache-Status: HIT
```

Confirmed standby nginx was accepting HTTPS connections and returning a valid response.

Evidence: `evidence/phase-2/extension-e/extension-e-standby-edge-test.png`

**Standby HTTPS via hostname (Mac 1 — white terminal):**

```bash
curl -k -i --connect-timeout 5 https://app.wiretitan.test:8443/api/status
# HTTP/1.1 200 OK
# X-Backend: B
# X-Cache-Status: HIT
```

Confirmed HTTPS access through the hostname after DNS migration.

Evidence: `evidence/phase-2/extension-e/extension-e-standby-dns-https.png`

**Mac 2 — standby nginx direct access and hostname routing (dark terminal):**

```bash
# Direct access to Mac 1 standby
curl -k -i --connect-timeout 5 https://10.7.10.202:8443/api/status
# HTTP/1.1 200 OK, X-Backend: A, X-Cache-Status: EXPIRED

# --resolve routing
curl -k -i --resolve app.wiretitan.test:8443:10.7.10.202 https://app.wiretitan.test:8443/api/status
# HTTP/1.1 200 OK, X-Backend: A, X-Cache-Status: HIT
```

Evidence: `evidence/phase-2/extension-e/extension-e-mac2-standby-https.png`

**Mac 2 — DNS record change verification (dark terminal):**

`dscacheutil -q host -a name app.wiretitan.test` showed `10.7.10.202` immediately after the DNS record change, and `10.7.3.20` after restoration. `scutil --dns` showed Mac 2 using `10.7.10.202` as its DNS resolver.

Evidence: `evidence/phase-2/extension-b/extension-b-record-change.png`

### 9.4 What Was NOT Demonstrated

- Old cached clients retaining the previous edge IP (`10.7.3.20`) until the 30-second TTL expired after the DNS change.
- The standby nginx operating independently if the primary nginx (Mac 2) were down.

### 9.5 Status

⚠️ **Partial** — DNS migration and HTTPS access through standby nginx demonstrated. Standby remains dependent on primary nginx. Client TTL retention not observed.

### 9.6 Learning

DNS-based edge migration is a low-disruption technique for switching the active edge server. With a TTL of 30 seconds, migration can happen quickly. The limitation discovered is that a standby nginx that proxies to the primary nginx provides redundant entry points but not true high availability at the edge layer.

---

## 10. Extension F – Troubleshooting

### 10.1 Objective

Test specific failure scenarios and verify that the system returns expected error responses. Document the troubleshooting methodology.

### 10.2 Test Results

**Both backends down — HTTP 502 (Mac 2 — dark terminal):**

Both Backend A and Backend B stopped. curl to `https://127.0.0.1:8443/api/status`:

```
HTTP/1.1 502 Bad Gateway
Server: nginx/1.31.6
```

Evidence: `evidence/phase-2/extension-f/extension-f-both-backends-down.png`

**Backend recovery — HTTP 200 (Mac 2 — dark terminal):**

Both backends restored. curl to `https://127.0.0.1:8443/api/status`:

```
HTTP/1.1 200 OK
X-Backend: A
```

Same screenshot shows the recovery sequence (502 followed by 200).

**Wrong port — connection failure (Mac 2 — dark terminal):**

Request to `https://127.0.0.1:8444/api/status` (port 8444, nothing listening):

```
curl: (7) Failed to connect to 127.0.0.1 port 8444 after 0 ms
```

Confirmed that an incorrect port produces a TCP-level connection failure, not an HTTP error.

Same screenshot: `evidence/phase-2/extension-f/extension-f-both-backends-down.png`

### 10.3 What Was NOT Tested

- Wrong DNS server (pointing client at a non-existent or incorrect resolver).
- Wrong DNS A record fault injection (inserting a deliberately incorrect IP into dnsmasq).

### 10.4 Status

✅ **Complete** — All three planned troubleshooting scenarios demonstrated successfully.

### 10.5 Learning

The distinction between application-level errors (`HTTP 502`) and transport-level failures (TCP connection refused) is important in network troubleshooting. `HTTP 502` tells you the proxy is running but cannot reach its backends. A TCP connection failure (curl error 7) tells you nothing is listening at the target address and port.

---

## 11. Testing and Validation Summary

| Test | Method | Result |
|---|---|---|
| DNS resolution | `dig @127.0.0.1 app.wiretitan.test` | ✅ NOERROR, TTL=30 |
| DNS TTL | `dig` output | ✅ 30 seconds |
| DNS record change | `dscacheutil`, `dig` | ✅ New IP shown |
| Client-side DNS retention | Observation after change | ❌ Not demonstrated |
| HTTPS primary edge | `curl -k -i https://127.0.0.1:8443/api/status` | ✅ HTTP 200 |
| Load balancing A/B | 6 sequential requests | ✅ A B A B A B |
| Backend A failover | Stop Backend A; 6 requests | ✅ B B B B B B |
| Backend recovery | Restart Backend A; 6 requests | ✅ B B A B A B |
| Backend A direct 403 | `curl http://10.7.10.202:3001/api/status` | ✅ HTTP 403 |
| Backend B remote refused | `curl http://10.7.3.20:3002/api/status` | ✅ curl error 7 |
| Backend B loopback bind | `lsof -iTCP:3002` | ✅ 127.0.0.1:3002 |
| Standby nginx local | `curl -k https://127.0.0.1:8443/api/status` (Mac 1) | ✅ HTTP 200 |
| Standby via hostname | `curl -k https://app.wiretitan.test:8443/api/status` (Mac 1) | ✅ HTTP 200 |
| Standby via –resolve | `curl -k --resolve app.wiretitan.test:8443:10.7.10.202` | ✅ HTTP 200 |
| Both backends down | Stop both; `curl https://127.0.0.1:8443/api/status` | ✅ HTTP 502 |
| Backend recovery | Restart both; `curl https://127.0.0.1:8443/api/status` | ✅ HTTP 200 |
| Wrong port | `curl https://127.0.0.1:8444/api/status` | ✅ curl error 7 |
| PF firewall isolation | `pfctl -f` | ❌ Blocked (managed device) |
| Backup DNS failover | Remote port 53 test | ❌ Blocked (university firewall) |

---

## 12. Limitations

| Limitation | Reason | Impact |
|---|---|---|
| Extension A not completed | University firewall blocks inbound port 53 | Backup DNS failover cannot be validated |
| Extension B partial | macOS DNS cache behaviour | Client TTL retention not demonstrable |
| Extension C partial | Managed device restrictions prevent PF rules | OS-level firewall not tested |
| Extension E partial | Standby proxies to primary | Standby is not an independent failover edge |
| Primary nginx SPOF | Architecture design | Mac 2 failure takes down all services |
| Client TTL retention | macOS DNS tooling | Old-IP retention observation not achieved |

---

## 13. Team Contributions

| Team Member | Contributions |
|---|---|
| **Farhana Pervin** (Mac 1) | dnsmasq configuration, Backend A, TLS setup, standby nginx, Ext B/C/E Mac 1 testing, Wireshark evidence |
| **Anshu Yadav** (Mac 2) | Backend B, primary nginx, HTTPS termination, Ext C/D/E/F Mac 2 testing, GitHub organisation |

---

## 14. Conclusion

Phase 2 extended WireTitan beyond its original DNS and web-service baseline. The project demonstrated:

- DNS TTL management with configurable 30-second TTL (Extension B, partial)
- Application-level and bind-address service isolation (Extension C, partial)
- Automatic backend failover and recovery through nginx upstream configuration (Extension D, complete)
- DNS-based edge migration between two nginx instances (Extension E, partial)
- Systematic failure testing covering HTTP 502, backend recovery, and wrong-port connection failure (Extension F, complete)

Certain network-level validations were restricted by the managed university environment (Extension A, PF firewall in Extension C). These restrictions and their impact on completeness have been documented accurately and honestly.

WireTitan now provides a documented, tested two-machine private network service platform with verified traffic management, service isolation, and failure recovery capabilities.

---

*Report prepared November 2026. See `docs/phase-2/WireTitan_Phase_2_Final_Report.pdf` for the official submitted version.*
