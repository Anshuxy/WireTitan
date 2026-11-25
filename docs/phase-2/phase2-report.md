
# WireTitan – Phase 2 Project Report

## 1. Introduction

WireTitan is a private network service platform developed as part of a Computer Networks course project.

Phase 1 established the basic network infrastructure, DNS resolution, backend services, HTTPS communication and nginx-based traffic management.

Phase 2 extends the existing platform by introducing DNS TTL management, service isolation, high availability, edge migration and fault troubleshooting.

The implementation uses two Mac computers connected through a private network.

## 2. Phase 2 Objectives

The main objectives of Phase 2 are:

- Investigate backup DNS configuration.
- Configure and verify DNS TTL.
- Improve backend service isolation.
- Implement high availability through backend failover.
- Demonstrate edge migration between two machines.
- Test failure scenarios and recovery mechanisms.

## 3. System Architecture

The deployment consists of two Mac computers.

### Mac 1
- dnsmasq DNS service.
- Backend A using Node.js and Express.
- Standby nginx edge service.

### Mac 2
- Backend B using Node.js and Express.
- Primary nginx edge service.
- HTTPS termination.
- Load balancing and caching.

The application hostname used is:

app.wiretitan.test

The HTTPS service uses port 8443.

The primary nginx configuration distributes requests between Backend A and Backend B.

The standby edge configuration provides an alternative entry point during DNS migration. Its current upstream dependency on the primary nginx service is documented as a limitation.

## 4. Technologies Used

- Node.js
- Express.js
- Nginx
- dnsmasq
- OpenSSL
- DNS
- HTTPS/TLS
- curl
- dig
- Wireshark
- Git and GitHub

## 5. Extension A – Backup DNS

The objective was to investigate backup DNS functionality and provide an alternative DNS resolution path.

The backup DNS validation was restricted by the university-managed network firewall.

The limitation was outside the control of the project team.

The restriction and intended backup DNS design are documented separately.

## 6. Extension B – DNS TTL Management

The DNS configuration was updated to use a TTL of 30 seconds.

The dnsmasq configuration was verified.

The application DNS record was changed during the edge migration process.

DNS responses were checked using dig.

The configured TTL and DNS record changes were verified. However, client-side persistence of an old cached DNS answer until TTL expiry was not demonstrated.

## 7. Extension C – Service Isolation

Service isolation was investigated through application-level restrictions and network binding configuration.

The backend services were configured and tested with their intended access restrictions.

Full PF packet-filter firewall enforcement could not be demonstrated because of restrictions on the managed Mac environment.

The distinction between application-level access control and operating-system firewall enforcement is documented in the extension report.

## 8. Extension D – High Availability and Failover

The primary nginx service was tested with Backend A and Backend B.

Requests were distributed between the two backends.

Backend failure was simulated to verify that traffic could continue through the available backend.

Backend recovery was also tested.

The service returned to normal operation after the failed backend was restored.

This demonstrated the core backend failover and recovery behaviour.

## 9. Extension E – Edge Migration

Edge migration was tested using the two Mac computers.

The primary nginx edge service was hosted on Mac 2 and the standby nginx service was hosted on Mac 1.

The application DNS record was changed to point to the alternative edge address.

HTTPS access through the application hostname was verified after the DNS change.

A limitation remains: the standby nginx configuration currently depends on the primary nginx service as its upstream. Therefore, the standby edge is not fully independent if the primary edge becomes unavailable.

## 10. Extension F – Troubleshooting

The following failure scenarios were tested:

### Both Backends Unavailable

Both backend services were stopped.

The application returned an HTTP 502 Bad Gateway response.

### Backend Recovery

The backend services were restored.

The application returned HTTP 200 OK.

### Incorrect Destination Port

A request was sent to an incorrect destination port.

The connection failed as expected.

These tests demonstrate basic service failure detection and recovery behaviour.

## 11. Testing and Validation

Testing was performed using curl, dig, nginx response headers and terminal output.

The following behaviours were verified:

- DNS resolution.
- DNS TTL configuration.
- DNS record migration.
- HTTP and HTTPS access.
- Backend A/B load balancing.
- Backend failure and recovery.
- Edge migration.
- HTTP 502 during backend unavailability.
- Connection failure on an incorrect port.

## 12. Limitations

The following limitations were encountered:

1. Remote backup DNS validation was restricted by the university-managed firewall.
2. Client-side DNS cache persistence until TTL expiry was not demonstrated.
3. PF firewall enforcement was unavailable in the managed Mac environment.
4. The standby nginx service currently depends on the primary nginx upstream.

These limitations are recorded to distinguish verified functionality from incomplete validation.

## 13. Team Contributions

The project was developed collaboratively using two Mac computers.

Both team members contributed to deployment, configuration, testing, troubleshooting and documentation.

The GitHub repository maintains the source code, configurations and project evidence.

## 14. Conclusion

Phase 2 extended the WireTitan platform beyond its original DNS and web-service implementation.

The project demonstrated backend load balancing, failover, recovery, DNS record migration, HTTPS access through an alternative edge and multiple troubleshooting scenarios.

Although certain network-level validations were restricted by the managed environment, the completed implementation and limitations have been documented.

WireTitan now provides a documented two-machine private network service platform with tested traffic management and failure recovery capabilities.

