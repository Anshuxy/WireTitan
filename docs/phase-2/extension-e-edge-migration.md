
# Extension E – Edge Migration

## 1. Objective

The objective of this extension is to demonstrate migration of the application entry point between two edge nginx services hosted on separate Mac computers.

The application should remain accessible through its hostname after the DNS record is updated.

## 2. Existing Architecture

The deployment uses two Mac computers.

### Mac 1
- dnsmasq DNS service.
- Backend A.
- Standby nginx edge service.

### Mac 2
- Backend B.
- Primary nginx edge service.
- HTTPS termination.
- Load balancing.

The application hostname is:

app.wiretitan.test

The HTTPS service uses port 8443.

## 3. Primary Edge Configuration

The primary nginx service receives HTTPS requests and distributes application traffic between the configured backend services.

The primary edge was tested using the application hostname.

## 4. Standby Edge Configuration

A standby nginx service was configured on the other Mac computer.

The standby edge was tested using its network address and HTTPS endpoint.

The standby configuration provides an alternative edge entry point for DNS migration.

## 5. DNS Migration

The DNS A record for the application hostname was changed to point to the alternative edge address.

The updated DNS record was verified using dig.

The application hostname was then tested over HTTPS.

Example command:

```bash
curl -k -i --connect-timeout 5 \
https://app.wiretitan.test:8443/api/status
```

The application returned HTTP 200 OK during the successful verification.

## 6. Cross-Machine Verification

DNS and HTTPS access were tested across the two Mac computers.

The hostname resolution and application response were inspected.

The X-Backend response header was used to identify the backend serving the request.

## 7. Actual Result

The following were verified:

- Primary nginx HTTPS access.
- Standby nginx service.
- DNS A-record migration.
- Cross-machine DNS verification.
- HTTPS access through the application hostname.
- Backend response through the migrated edge path.

## 8. Important Limitation

The standby nginx service currently depends on the primary nginx service as its upstream.

This means the standby edge is not fully independent.

If the primary nginx upstream becomes unavailable, the standby edge may also fail to serve application traffic.

Therefore, the extension demonstrates edge migration and alternative entry-point testing, but not complete independent edge redundancy.

## 9. Conclusion

The edge migration extension demonstrated DNS-based movement of the application hostname between edge services.

HTTPS access was verified after migration.

The remaining upstream dependency is documented as an architectural limitation that should be addressed in a future improvement.
