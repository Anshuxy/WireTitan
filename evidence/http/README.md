# HTTP Headers Evidence

The HTTPS response from the WireTitan nginx edge was inspected to verify the HTTP response headers.

The response returned:

- HTTP/1.1 200 OK
- X-Backend
- Cache-Control
- ETag
- Content-Type
- Server

The `X-Backend` header identifies which backend handled the request.
