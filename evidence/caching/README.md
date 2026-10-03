# Caching Evidence

Nginx caching was tested using repeated HTTPS requests.

The first request returned:

X-Cache-Status: MISS

A subsequent request returned:

X-Cache-Status: HIT

This demonstrates that nginx successfully cached the response and served the cached response on the subsequent request.
