# Extension B – DNS TTL Management

## Objective

Configure dnsmasq with a short DNS TTL to allow rapid DNS record propagation. Verify the configured TTL and demonstrate that changing the DNS A record is reflected quickly in client queries.

## Implementation

Updated `dns/dnsmasq.conf`:

```
local-ttl=30
address=/app.wiretitan.test/10.7.3.20
address=/api.wiretitan.test/10.7.3.20
```

## Tests Performed

### TTL Verification

Ran `dig @127.0.0.1 app.wiretitan.test` on Mac 1 during the Extension E edge migration test when the record temporarily pointed to `10.7.10.202`.

Result: TTL=30 confirmed in the ANSWER SECTION.

Evidence: `evidence/phase-2/extension-b/extension-b-ttl-30.png`

### DNS Record Change

Changed `address=/app.wiretitan.test/` from `10.7.3.20` to `10.7.10.202` during Extension E.

Verified on Mac 2 using `dscacheutil -q host -a name app.wiretitan.test`:
- Before: `ip_address: 10.7.10.202`
- After restore: `ip_address: 10.7.3.20`

Evidence: `evidence/phase-2/extension-b/extension-b-record-change.png`

## What Was NOT Demonstrated

- A client retaining an old cached DNS answer for the full 30-second TTL period before accepting the new address.
- Manual DNS cache flushing using `dscacheutil -flushcache`.

## Status

⚠️ **Partial** — TTL=30 configured and verified. DNS record changes verified. Client-side cache expiry was not observed.
