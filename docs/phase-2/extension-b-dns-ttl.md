
# Extension B – DNS TTL Management

## 1. Objective

The objective of this extension is to configure and verify DNS Time To Live (TTL) and understand how DNS records can be updated during service migration.

## 2. DNS Configuration

The WireTitan DNS service uses dnsmasq.

The application hostname is:

app.wiretitan.test

The configured TTL is 30 seconds.

The relevant dnsmasq configuration is:

```conf
address=/app.wiretitan.test/10.7.3.20
local-ttl=30
```

The address record was changed during the migration process.

The DNS configuration was also tested with the alternative edge address.

## 3. DNS Verification

The DNS record was inspected using dig.

Example command:

```bash
dig @127.0.0.1 app.wiretitan.test
```

The DNS response showed:

- Query status: NOERROR
- Answer record: app.wiretitan.test
- TTL: 30 seconds
- A record: 10.7.10.202 during the earlier configuration

The DNS record was subsequently changed to the alternative edge address.

The updated record was also verified using DNS queries.

## 4. TTL Verification

The dnsmasq configuration was inspected to verify the TTL setting.

The local TTL was configured as 30 seconds.

DNS queries confirmed that the resolver returned the configured TTL.

## 5. DNS Migration

The application hostname was migrated from the original edge address to the alternative edge address.

The updated DNS response was verified.

HTTPS access was tested after the migration.

## 6. Actual Result

The following were successfully verified:

- dnsmasq configuration.
- TTL value of 30 seconds.
- DNS A-record changes.
- DNS resolution of the application hostname.
- Application access after DNS migration.

## 7. Limitation

The experiment did not demonstrate a client retaining an old cached DNS answer until its TTL expired.

Therefore, the project confirms TTL configuration and DNS record migration, but does not claim that client-side cache-expiry behaviour was fully tested.

## 8. Conclusion

The DNS TTL extension successfully demonstrated configuration and DNS record verification.

It also supported the edge migration process by allowing the application hostname to resolve to the alternative edge address.
