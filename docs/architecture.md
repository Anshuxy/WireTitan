# WireTitan Architecture

## Topology

Client
↓
Mac 1 - DNS Server (dnsmasq)
↓
Mac 2 - nginx (Reverse Proxy + Load Balancer + HTTPS)
↓
Backend A / Backend B

## Machine Roles

| Machine | Role | Service | Port |
|---|---|---|---|
| Mac 1 | DNS Server | dnsmasq | 53 |
| Mac 2 | Edge / Load Balancer | nginx | 8443 |
| Mac 3 | Backend A | Node.js | 3001 |
| Mac 4 | Backend B | Node.js | 3002 |

## IP / Port Table

| Machine | IP Address | Service | Port |
|---|---|---|---|
| Mac 1 | YOUR_IP | dnsmasq | 53 |
| Mac 2 | YOUR_IP | nginx | 8443 |
| Mac 3 | 10.7.6.126 | Backend A | 3001 |
| Mac 4 | YOUR_IP | Backend B | 3002 |

## Request Flow

1. Client requests app.wiretitan.test.
2. DNS query goes to Mac 1.
3. Mac 1 resolves app.wiretitan.test to Mac 2.
4. Client connects to nginx on Mac 2 using HTTPS.
5. nginx receives the HTTPS request.
6. nginx forwards the request to Backend A or Backend B.
7. Backend sends the response to nginx.
8. nginx sends the response back to the client.
