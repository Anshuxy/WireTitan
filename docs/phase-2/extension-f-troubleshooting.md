
# Extension F – Troubleshooting and Failure Testing

## 1. Objective

The objective of this extension is to test WireTitan under different failure conditions and verify how the application responds when backend services or network destinations become unavailable.

## 2. Testing Environment

The testing environment consists of:

- Nginx reverse proxy.
- Backend A.
- Backend B.
- HTTPS application endpoint.
- Application hostname: app.wiretitan.test.
- HTTPS port: 8443.

The curl command was used to inspect HTTP responses and connection failures.

## 3. Test 1 – Both Backends Unavailable

### Procedure

Both backend services were stopped while nginx remained available.

A request was sent to the application endpoint.

### Command

```bash
curl -k -i --connect-timeout 5 \
https://app.wiretitan.test:8443/api/status
```

### Expected Result

The reverse proxy should return an error because neither backend can process the request.

### Actual Result

The application returned:

HTTP/1.1 502 Bad Gateway

This confirmed that the reverse proxy could not reach an available backend.

## 4. Test 2 – Backend Recovery

### Procedure

The backend services were restored.

The application endpoint was tested again.

### Actual Result

The application returned:

HTTP/1.1 200 OK

The backend response was successfully restored.

## 5. Test 3 – Incorrect Destination Port

### Procedure

A request was sent to an incorrect destination port.

### Command

```bash
curl -k -i --connect-timeout 3 \
https://127.0.0.1:8444/api/status
```

### Expected Result

The connection should fail because the requested destination port does not have the intended HTTPS service listening on it.

### Actual Result

The connection failed.

This demonstrated the difference between a working service port and an incorrect destination port.

## 6. Test Summary

| Test | Actual result |
|---|---|
| Both backends unavailable | HTTP 502 |
| Backend recovery | HTTP 200 |
| Incorrect destination port | Connection failure |

## 7. Limitations

The above tests demonstrate backend unavailability, application recovery and incorrect destination port handling.

A separate wrong-DNS configuration test was not demonstrated as part of the completed testing.

The results are therefore limited to the scenarios that were actually verified.

## 8. Conclusion

The troubleshooting extension successfully demonstrated the application's behaviour under backend failure and incorrect-port conditions.

The recovery test confirmed that the application returned to HTTP 200 after the backend services were restored.

These tests provide evidence of basic failure detection and service recovery in the WireTitan environment.
