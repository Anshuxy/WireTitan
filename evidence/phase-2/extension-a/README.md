# Evidence – Extension A: Backup DNS

## What This Folder Demonstrates

Extension A investigated backup DNS configuration to provide a redundant DNS resolution path for `app.wiretitan.test`.

## Status

> **⚠️ Blocked — No screenshots available for this extension.**

The university-managed macOS firewall blocked inbound DNS traffic on UDP/TCP port 53 on the student Mac intended to host the backup DNS server. Remote DNS failover testing could not be completed.

## Intended Test Procedure

1. Configure a secondary dnsmasq instance on Mac 2 (`10.7.3.20`) resolving `app.wiretitan.test → 10.7.3.20`.
2. Stop primary dnsmasq on Mac 1 (`10.7.10.202`).
3. Verify that Mac 2 (or another client) can still resolve `app.wiretitan.test` using the backup DNS.

## Why It Was Blocked

The university IT policy enforces firewall rules on managed Macs that prevent binding to or accepting connections on privileged ports (including port 53). This restriction is outside project control.

## Documentation

See `docs/phase-2/extension-a-backup-dns.md` for the full design and restriction explanation.
