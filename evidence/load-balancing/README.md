# Load Balancing Evidence

Repeated HTTPS requests to `app.wiretitan.test` were used to verify nginx round-robin load balancing.

The `X-Backend` response header showed responses from both backends:

- Backend A
- Backend B

Repeated requests alternated between the two backend servers.
