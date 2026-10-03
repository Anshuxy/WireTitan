# DNS Evidence

Wireshark capture showing the DNS query and response for `app.wiretitan.test`.

The client sends a DNS query to the WireTitan DNS server, and the DNS server responds with the nginx edge IP address.

Filter used:

`dns.qry.name == "app.wiretitan.test"`
