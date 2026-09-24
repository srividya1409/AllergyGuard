const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const scanRoutes = require("./routes/scan");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/scan", scanRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Allergy Guard API listening on port ${PORT}`));

module.exports = app;
