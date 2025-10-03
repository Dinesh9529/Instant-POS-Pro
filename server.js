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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`License server running on port ${PORT}`));


