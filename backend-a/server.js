const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.set("X-Backend", "A");
    res.set("Cache-Control", "max-age=60");
    res.json({
        backend: "A",
        status: "ok",
        message: "Backend A is running"
    });
});

app.get("/api/status", (req, res) => {
    res.set("X-Backend", "A");
    res.set("Cache-Control", "max-age=60");
    res.json({
        backend: "A",
        status: "ok"
    });
});

app.listen(3001, "0.0.0.0", () => {
    console.log("Backend A running on http://0.0.0.0:3001");
})
