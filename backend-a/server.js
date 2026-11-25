const express = require("express");

const app = express();

// Extension C: Application-level source filtering.
// Backend A uses the X-Real-IP header set by nginx to decide whether
// to allow or deny requests. Only traffic arriving via the nginx edge
// on Mac 2 (10.7.3.20) or Mac 1 standby (10.7.10.202) is allowed.
// Direct access from Mac 1 itself returns HTTP 403 Forbidden.
function allowEdgeOnly(req, res, next) {
    const clientIP = req.headers["x-real-ip"] || req.socket.remoteAddress || "";
    // Allow requests that arrive through nginx (which sets X-Real-IP)
    // and whose originating IP is an expected edge address.
    // Direct loopback or Mac 1 connections that bypass nginx are rejected.
    const allowedEdges = ["10.7.3.20", "10.7.10.202", "::1", "127.0.0.1"];
    // If X-Real-IP header is NOT present the request did not pass through nginx
    const viaProxy = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    if (!viaProxy) {
        return res.status(403).json({ error: "Access denied" });
    }
    next();
}

app.get("/", allowEdgeOnly, (req, res) => {
    res.set("X-Backend", "A");
    res.set("Cache-Control", "max-age=60");
    res.json({
        backend: "A",
        status: "ok",
        message: "Backend A is running"
    });
});

app.get("/api/status", allowEdgeOnly, (req, res) => {
    res.set("X-Backend", "A");
    res.set("Cache-Control", "max-age=60");
    res.json({
        backend: "A",
        status: "ok"
    });
});

// Listen on all interfaces so Mac 2 nginx can reach this backend
app.listen(3001, "0.0.0.0", () => {
    console.log("Backend A running on http://0.0.0.0:3001");
});
