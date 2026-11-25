# Extension D – High Availability and Backend Failover

## Objective

Demonstrate that nginx distributes load across two backends, automatically fails over to the remaining backend when one becomes unavailable, and restores normal distribution when the failed backend recovers.

## Implementation

Primary nginx on Mac 2 (`nginx/phase-2/primary.conf`) uses round-robin upstream:

```nginx
upstream backends {
    server 10.7.10.202:3001;   # Backend A (Mac 1)
    server 127.0.0.1:3002;     # Backend B (Mac 2 local)
}
```

## Test Results

### Normal Load Balancing

6 sequential requests to `https://127.0.0.1:8443/api/status`:

```
A, B, A, B, A, B
```

Confirmed true round-robin distribution.

Evidence: `evidence/phase-2/extension-d/extension-d-normal-load-balancing.png`

### Backend A Stopped – Failover to B

Backend A process stopped on Mac 1. 6 requests:

```
B, B, B, B, B, B
```

nginx automatically failed over. No `502` errors during failover.

Evidence: `evidence/phase-2/extension-d/extension-d-backend-failover.png`

### Backend A Restarted – Recovery to A/B

Backend A restarted on Mac 1. 6 requests:

```
B, B, A, B, A, B
```

After Backend A was restarted, A/B distribution resumed across repeated requests.

Evidence: `evidence/phase-2/extension-d/extension-d-backend-recovery.png`

## Limitation

The primary nginx on Mac 2 itself remains a single point of failure. If Mac 2 fails, all services become unavailable.

## Status

✅ **Complete** — Load balancing, failover, and recovery all successfully demonstrated.
