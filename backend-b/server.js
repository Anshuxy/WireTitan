const express = require("express");

const app = express();

// Extension C: Backend B binds to 127.0.0.1 only.
// This means it is accessible only via localhost on Mac 2 (through nginx).
// Remote machines (e.g. Mac 1) cannot reach Backend B directly because
// the listening address is not exposed on the LAN interface.

app.get("/", (req, res) => {
    res.set("X-Backend", "B");
    res.set("Cache-Control", "max-age=60");

    res.json({
        backend: "B",
        status: "ok",
        message: "Backend B is running"
    });
});

app.get("/api/status", (req, res) => {
    res.set("X-Backend", "B");
    res.set("Cache-Control", "max-age=60");

    res.json({
        backend: "B",
        status: "ok"
    });
});

// Bind to loopback only – not reachable from other machines on the LAN.
app.listen(3002, "127.0.0.1", () => {
    console.log("Backend B running on http://127.0.0.1:3002");
});
