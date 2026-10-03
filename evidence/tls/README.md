# TLS Evidence

Wireshark capture showing the TLS handshake for the WireTitan HTTPS connection.

Filter used:

`tcp.port == 8443 && tls.handshake`

The capture shows TLS handshake packets including:

- Client Hello
- Server Hello
- Certificate
- Change Cipher Spec
- Application Data

The Client Hello includes the SNI `app.wiretitan.test`.

After the TLS handshake, application traffic is encrypted.
