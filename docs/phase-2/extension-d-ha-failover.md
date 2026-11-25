
# Extension D – High Availability and Failover

## 1. Objective

The objective of this extension is to improve service availability by distributing application requests between multiple backend services.

The system should continue providing responses when one backend becomes unavailable.

## 2. Existing Architecture

WireTitan uses two backend applications:

- Backend A – Node.js and Express.
- Backend B – Node.js and Express.

Nginx operates as the frontend reverse proxy and load balancer.

The backend identity is exposed through the X-Backend response header.

## 3. Load Balancing Implementation

The primary nginx service distributes incoming application requests between Backend A and Backend B.

The application endpoint used for verification is:

/api/status

Example test command:

```bash
curl -k -i https://app.wiretitan.test:8443/api/status
```

The response headers were inspected to identify the backend serving each request.

The X-Backend header identifies whether Backend A or Backend B handled the request.

## 4. Failover Testing

Backend failure was simulated by stopping one backend service.

Requests were then sent to the application through nginx.

The application continued responding through the available backend.

This demonstrated backend failover behaviour.

## 5. Backend Recovery

The stopped backend service was restarted.

The application was tested again.

The service returned to normal operation, and both backend identities were observed after recovery.

## 6. Actual Result

The following were verified:

- Requests distributed between Backend A and Backend B.
- Backend identity visible in response headers.
- Application availability when one backend was stopped.
- Recovery after restarting the failed backend.

## 7. Conclusion

The high availability extension successfully demonstrated load balancing, backend failure handling and recovery.

The tests confirmed that the application could continue responding through the available backend during a single-backend failure.
