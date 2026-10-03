# TCP Handshake Evidence

Wireshark capture showing the TCP three-way handshake between the client and the nginx edge for HTTPS on port 8443.

The capture shows:

- SYN
- SYN-ACK
- ACK

Filter used:

`tcp.port == 8443 && tcp.flags.syn == 1`

The final ACK was also verified using:

`tcp.port == 8443 && tcp.flags.ack == 1 && tcp.flags.syn == 0`

This confirms the TCP connection was successfully established before HTTPS communication.
