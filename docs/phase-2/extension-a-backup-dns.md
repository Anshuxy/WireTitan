# Extension A – Backup DNS

## Objective

Configure a secondary DNS resolver so that if the primary dnsmasq on Mac 1 (`10.7.10.202`) becomes unavailable, another machine can continue resolving `app.wiretitan.test` for clients.

## Intended Design

1. Run a secondary dnsmasq instance on Mac 2 (`10.7.3.20`) with the same `app.wiretitan.test` records.
2. Configure clients to use `10.7.10.202` as primary DNS and `10.7.3.20` as secondary DNS.
3. Test by stopping dnsmasq on Mac 1 and verifying continued DNS resolution.

## Restriction Encountered

The university-managed macOS firewall enforces rules that block inbound connections on privileged ports, including UDP/TCP port 53. This prevents any service on the student Mac from accepting DNS queries from other machines on the network.

The restriction is applied by the university IT administration at the macOS System Policy layer. It cannot be overridden or reconfigured by student users.

## Impact

Remote backup DNS failover testing could not be completed. The backup DNS server design is documented here but no screenshot evidence exists for this extension.

## Status

⚠️ **Blocked** — University-managed device firewall prevented testing. No evidence screenshots.

## Honest Summary

Extension A was not completed. The team attempted to configure backup DNS but was blocked by a managed-device firewall restriction that is outside project control. This limitation is documented accurately to distinguish the intended design from what was actually tested.
