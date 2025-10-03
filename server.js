// server.js (backend)
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

// License validation API
app.get("/validate-key", (req, res) => {
    const key = req.query.key;
    if (key === "9529561113@Dkc") {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
