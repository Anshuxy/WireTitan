
# Extension C – Service Isolation

## 1. Objective

The objective of this extension is to improve service isolation by restricting unnecessary access to backend services.

The aim is to ensure that backend applications are accessed through the intended network path rather than being unnecessarily exposed to other network clients.

## 2. Existing Infrastructure

WireTitan uses two Node.js and Express backend services:

- Backend A
- Backend B

Nginx acts as the frontend service and communicates with the backend applications.

The backend services are intended to receive application traffic through the configured service architecture.

## 3. Isolation Approach

The project investigated service isolation through:

- Application-level access restrictions.
- Network interface binding.
- Restricting backend access to intended communication paths.
- Separating frontend and backend responsibilities.

The application-level restrictions and bind-address behaviour were tested.

## 4. Firewall Investigation

The project also investigated using macOS Packet Filter (PF) to enforce network-level restrictions.

However, PF firewall enforcement could not be completed in the managed Mac environment.

This was an environmental limitation rather than a verified PF implementation.

## 5. Testing and Validation

The application and network binding behaviour were inspected.

The tests were used to check whether the backend services followed their intended access restrictions.

The available application-level and bind-address controls were verified.

## 6. Actual Result

The following were verified:

- Backend application services.
- Application-level access restrictions.
- Bind-address configuration.
- Communication through the intended service architecture.

Full operating-system firewall enforcement was not demonstrated.

## 7. Limitations

PF firewall enforcement was unavailable in the managed Mac environment.

Therefore, the project does not claim that complete packet-filter-based isolation was implemented.

Application-level restrictions and PF firewall enforcement are treated as separate security mechanisms.

## 8. Conclusion

The service isolation extension demonstrated application-level and bind-address controls.

The PF firewall component remains an incomplete part of the extension because of the restrictions in the managed environment.
