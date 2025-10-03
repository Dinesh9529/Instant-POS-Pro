const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());

const VALID_KEYS = ["9529561113@Dkc", "DemoKey123"];

app.get("/validate-key", (req, res) => {
  const key = req.query.key;
  if (VALID_KEYS.includes(key)) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});




const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Optional: serve static frontend files
app.use(express.static('public')); // अगर index.html, style.css, script.js 'public' folder में हैं

// ====== License Validation Route ======
app.get('/validate-key', (req, res) => {
    const key = req.query.key;
    if(key === "9529561113@Dkc") {
        res.json({valid:true});
    } else {
        res.json({valid:false});
    }
});

// ====== Start Server ======
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`License server running on port ${PORT}`));

