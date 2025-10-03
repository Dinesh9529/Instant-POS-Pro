// server.js (backend)
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
// This allows your frontend (HTML file) to make requests to this server
app.use(cors());

// Root endpoint to check if the server is running
app.get("/", (req, res) => {
    res.send("Instant POS Pro License Server is running!");
});

// License validation API endpoint
app.get("/validate-key", (req, res) => {
    // Get the key from the query parameters (e.g., /validate-key?key=YOUR_KEY)
    const key = req.query.key;
    
    // Check if the provided key is the correct one
    if (key === "9529561113@Dkc") {
        // If correct, send a JSON response with valid: true
        res.json({ valid: true });
    } else {
        // If incorrect, send a JSON response with valid: false
        res.json({ valid: false });
    }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
