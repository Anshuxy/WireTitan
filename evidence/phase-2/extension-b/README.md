# Evidence – Extension B: DNS TTL Management

## What This Folder Demonstrates

Extension B configured `dnsmasq` with `local-ttl=30` and verified that:

1. The DNS TTL of 30 seconds is correctly returned in dig responses.
2. The DNS A record for `app.wiretitan.test` can be changed and the new value is immediately visible.

## Screenshots

| File | Machine | What It Shows |
|---|---|---|
| `extension-b-ttl-30.png` | Mac 1 (white terminal) | `dig @127.0.0.1 app.wiretitan.test` returning TTL=30 and A record 10.7.10.202 (during Extension E migration) |
| `extension-b-record-change.png` | Mac 2 (dark terminal) | DNS record change: `dscacheutil` showing 10.7.10.202 then 10.7.3.20; also shows DNS resolver set to 10.7.10.202 via `networksetup`; Extension F 502 and recovery also visible in this screenshot |

## Status

⚠️ **Partial** — TTL=30 and DNS record changes verified. Client-side cache retention until TTL expiry was not demonstrated.

## Commands Used

```bash
# Mac 1 – verify TTL
dig @127.0.0.1 app.wiretitan.test

# Mac 2 – set DNS resolver to Mac 1
sudo networksetup -setdnsservers Wi-Fi 10.7.10.202

# Mac 2 – check DNS cache entry
dscacheutil -q host -a name app.wiretitan.test
```
