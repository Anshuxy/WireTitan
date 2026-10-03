const express = require("express");

const app = express();

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

app.listen(3002, "0.0.0.0", () => {
    console.log("Backend B running on http://0.0.0.0:3002");
});
