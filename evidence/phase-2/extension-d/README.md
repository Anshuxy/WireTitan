# Evidence – Extension D: High Availability and Backend Failover

## What This Folder Demonstrates

Extension D verified that the nginx upstream configuration provides:

1. **Normal round-robin load balancing** between Backend A and Backend B.
2. **Automatic failover** to Backend B when Backend A is stopped.
3. **Recovery** to A/B distribution when Backend A is restarted.

## Screenshots

| File | Machine | What It Shows |
|---|---|---|
| `extension-d-normal-load-balancing.png` | Mac 2 (dark terminal) | 6 requests returning `A B A B A B` — confirmed round-robin |
| `extension-d-backend-failover.png` | Mac 2 (dark terminal) | 6 requests after Backend A stopped: `B B B B B B` — failover to B |
| `extension-d-backend-recovery.png` | Mac 2 (dark terminal) | 6 requests after Backend A restarted: `B B A B A B` — recovery to A/B |

## Status

✅ **Complete** — All three scenarios demonstrated successfully.

## Commands Used

```bash
# Mac 2 – run 6 requests and print backend name
for i in {1..6}; do
  curl -ks "https://127.0.0.1:8443/api/status?lb=$i" | python3 -c 'import sys,json; print(json.load(sys.stdin)["backend"])'
done
```

## Limitation

The primary nginx on Mac 2 remains a single point of failure. If Mac 2 fails, neither backend can be reached through the edge.
