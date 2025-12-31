const express = require("express");
const router = express.Router();
const Tata_Tele = require("../models/Tata_Tele.js");

const VALID_TOKEN = process.env.TATA_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2NDkyNTEiLCJjciI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vY2xvdWRwaG9uZS50YXRhdGVsZXNlcnZpY2VzLmNvbS90b2tlbi9nZW5lcmF0ZSIsImlhdCI6MTc1MjI5MTY4MSwiZXhwIjoyMDUyMjkxNjgxLCJuYmYiOjE3NTIyOTE2ODEsImp0aSI6IkhNZDcwZm45OGk5d3YyMWIifQ.uncSXCB6rpWhb_08IHPP37DOAN0ZRgFWOmogGLo9QPI';

// Tata Tele webhook handler Inbound
router.post("/Inbound", async (req, res) => {
  const token = req.headers["x-pbx-token"] || req.headers["authorization"];

  if (token !== VALID_TOKEN) {
    console.log("Unauthorized webhook attempt.");
    return res.status(403).send("Invalid token");
  }

  const event = req.body;
  console.log("📞 Tata Tele Event Received:", event);

  try {
    await Tata_Tele.insertCallHistory(event);
    console.log("✅ Call data inserted into Call_History");
    return res.status(200).send("Call event processed and stored.");
  } catch (error) {
    console.error("❌ Error inserting call data:", error);
    return res.status(500).send("Error storing call data.");
  }
});
// Tata Tele webhook handler Outbound
router.post("/Outbound", async (req, res) => {
  const token = req.headers["x-pbx-token"] || req.headers["authorization"];

  if (token !== VALID_TOKEN) {
    console.log("Unauthorized webhook attempt.");
    return res.status(403).send("Invalid token");
  }

  const event = req.body;
  console.log("📞 Tata Tele Event Received:", event);

  try {
    await Tata_Tele.insertCallHistory(event);
    console.log("✅ Call data inserted into Call_History");
    return res.status(200).send("Call event processed and stored.");
  } catch (error) {
    console.error("❌ Error inserting call data:", error);
    return res.status(500).send("Error storing call data.");
  }
});
// Get_call_history
router.get(
  "/Search_Call_History/",
  function (req, res) {
    try {
      console.log("Received request to search call history", req.query);

      Tata_Tele.Search_Call_History(
        req.query.startDate,
        req.query.endDate,
        req.query.direction,
        req.query.callerIdNumber,
        req.query.agentName,
        req.query.studentName,
        function (err, rows) {
          if (err) {
            console.error("Error fetching call history:", err);
            return res.status(500).json({ error: err });
          }
          res.json(rows[0]); // first result set from CALL
        }
      );
    } catch (e) {
      console.error("Unexpected error:", e);
      res.status(500).json({ error: "Unexpected error occurred" });
    }
  }
);

module.exports = router;
