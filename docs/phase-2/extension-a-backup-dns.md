
# Extension A – Backup DNS

## 1. Objective

The objective of this extension is to investigate backup DNS functionality and provide an alternative DNS resolution path if the primary DNS service becomes unavailable.

Backup DNS improves service availability by providing an alternative resolver.

## 2. Existing DNS Infrastructure

The WireTitan platform uses dnsmasq for private DNS resolution.

The application hostname is:

app.wiretitan.test

The DNS service is hosted within the two-Mac private network environment.

## 3. Intended Implementation

The intended design uses an alternative DNS resolver that clients can use when the primary DNS service is unavailable.

The backup resolver should provide the required application hostname resolution.

## 4. Testing and Validation

Backup DNS communication and remote resolver validation were investigated.

However, the university-managed network firewall restricted the required connectivity.

The restriction prevented successful completion of the remote backup DNS validation.

## 5. Actual Result

The existing private DNS service remained functional.

The remote backup DNS validation could not be completed because of the external firewall restriction.

## 6. Limitation

The firewall restriction is imposed by the managed network environment and is outside the control of the project team.

The project therefore records the intended backup DNS design separately from the functionality that was successfully verified.

## 7. Conclusion

The backup DNS extension was investigated, but complete remote backup DNS validation remains blocked by the university-managed firewall.

This limitation is documented rather than presenting an unverified backup DNS test as successful.
