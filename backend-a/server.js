const express = require("express");

const app = express();

// Extension C: Application-level source filtering (NOT PF firewall enforcement).
// PF packet-filter rules could not be enforced on university-managed Macs, so
// Backend A validates the actual TCP connection source IP from
// req.socket.remoteAddress rather than trusting client-supplied HTTP headers
// such as X-Forwarded-For or X-Real-IP, which can be spoofed by clients.
//
// Deployed on Mac 1 (10.7.10.202:3001). Only connections arriving from the
// primary nginx edge on Mac 2 (10.7.3.20) are permitted; requests from any
// other source IP (including direct requests from Mac 1) return HTTP 403.
const allowedEdges = ["10.7.3.20"];

function normalizeRemoteAddress(address) {
    if (!address) {
        return "";
    }
    return address.replace(/^::ffff:/i, "");
}

function allowEdgeOnly(req, res, next) {
    const remoteAddress = req.socket ? req.socket.remoteAddress : "";
    const clientIP = normalizeRemoteAddress(remoteAddress);

    if (!allowedEdges.includes(clientIP)) {
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

// Listen on all interfaces on Mac 1 (10.7.10.202:3001) so Mac 2 nginx can
// reach this backend while direct non-edge requests are rejected with 403.
app.listen(3001, "0.0.0.0", () => {
    console.log("Backend A running on http://0.0.0.0:3001");
});
