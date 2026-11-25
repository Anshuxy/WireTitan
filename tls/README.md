# WireTitan TLS Setup

## Overview

WireTitan uses HTTPS on port 8443 with a locally generated Certificate Authority (CA).

HTTPS endpoint:

`https://app.wiretitan.test:8443`

## Certificate Setup

A local CA was created using OpenSSL.

The CA was used to create a certificate for `app.wiretitan.test`.

The certificate and CA were used to establish a trusted HTTPS connection between the client and the nginx edge.

## Security

Private TLS keys are not included in this repository. Never commit `wiretitan-ca.key`, `app.wiretitan.test.key`, or any other private key material.

## HTTPS Testing

HTTPS was tested from Mac 1 using curl with the local CA (targeting the primary nginx edge on Mac 2 at `10.7.3.20`):

`curl --resolve app.wiretitan.test:8443:10.7.3.20 --cacert ~/cn-project/certs/wiretitan-ca.crt https://app.wiretitan.test:8443/`

*(Adjust `--cacert` to match the local path of `wiretitan-ca.crt` on the client machine.)*

### `curl -k` vs. `curl --cacert`

- **`curl --cacert <path-to-wiretitan-ca.crt>`** (or trusting `wiretitan-ca.crt` in the macOS Keychain) verifies the server certificate against the local CA and is required to demonstrate certificate trust.
- **`curl -k` (`--insecure`)** verifies HTTPS connectivity and encrypted transport only by skipping certificate validation.
- **Never** claim certificate verification succeeded solely because a `curl -k` request returned `HTTP 200`.

## Wireshark Evidence

Wireshark was used to capture:

- TLS Client Hello
- TLS Server Hello
- Certificate exchange
- Change Cipher Spec
- Encrypted Application Data

After the TLS handshake, application traffic is encrypted.
