# WireTitan TLS Setup

## Overview

WireTitan uses HTTPS on port 8443 with a locally generated Certificate Authority (CA).

HTTPS endpoint:

`https://app.wiretitan.test:8443`

## Certificate Setup

A local CA was created using OpenSSL.

The CA was used to create a certificate for app.wiretitan.test.

The certificate and CA were used to establish a trusted HTTPS connection between the client and the nginx edge.

## Security

Private TLS keys are not included in this repository.

## HTTPS Testing

HTTPS was tested from Mac 1 using curl with the local CA:

`curl --resolve app.wiretitan.test:8443:10.7.12.247 --cacert ~/cn-project/certs/wiretitan-ca.crt https://app.wiretitan.test:8443/`

## Wireshark Evidence

Wireshark was used to capture:

- TLS Client Hello
- TLS Server Hello
- Certificate exchange
- Change Cipher Spec
- Encrypted Application Data

After the TLS handshake, application traffic is encrypted.
