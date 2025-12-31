const express = require("express");
const router = express.Router();
const CallDetails = require("../models/call_Details");
const axios = require("axios");
// Base URL for FastAPI
const FASTAPI_BASE_URL = "https://40.192.44.34/api/v1";

// Endpoints
const FASTAPI_LOGIN_URL = `${FASTAPI_BASE_URL}/auth/login`;
const FASTAPI_CALLS_URL = `${FASTAPI_BASE_URL}/calls/optimized`;
const FASTAPI_RECORDING_URL = `${FASTAPI_BASE_URL}/calls/recordings`;

// --- LOGIN API ---
router.post("/login", async (req, res) => {
  try {
    const response = await performLogin();
    console.log("Login successful, tokens received.");

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    });
  } catch (err) {
    console.error("Error fetching token:", err.response?.data || err.message);
    res.status(401).json({ error: "Unable to fetch token" });
  }
});

async function getToken() {
  // You can take these from req.body, or hardcode for testing
  const loginPayload = {
    client_type: "console",
    client_key: "your_console_key_here", // 🔑 replace with real key
    device_id: "b40f9ffaa4808016", // could come from frontend
    device_rom: "unknown",
    phone_number: "9895095713",
    otp_jwt: "", // empty or actual OTP JWT
    password: "Test@123",
  };

  const response = await axios.post(
    FASTAPI_LOGIN_URL,
    new URLSearchParams(loginPayload), // 🔑 must send as form-data (x-www-form-urlencoded)
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  console.log("Login successful:", response.data);
  return response.data.access_token;
}
// --- CALLS API ---
router.get("/Search_Call_Aether_History", async (req, res) => {
  try {
    // Take token from client request header
    // const token = req.headers.authorization?.replace("Bearer ", "") ;
    // const token = await getToken();
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OGEwMzY2ZC1jNzJhLTRiOTItOWIxMS01OTg1MTZmZGEwYWUiLCJwaG9uZV9udW1iZXIiOiI5ODk1MDk1NzEzIiwiY2xpZW50X3R5cGUiOiJjb25zb2xlIiwiZGV2aWNlX2lkIjoiYjQwZjlmZmFhNDgwODAxNiIsImRldmljZV9yb20iOiJ1bmtub3duIiwic2NvcGVzIjpbImNvbnNvbGU6YWxsIl0sImV4cCI6MTc4NzY1NDk4NiwiaWF0IjoxNzU2MTE4OTg2LCJ0eXBlIjoiYWNjZXNzIn0.kFGQT3BZrpcqeFZkhK7S2QE8-uC6xDsEd6nk469AipQ";

    if (!token) {
        const response = await performLogin();
     token = response.data.access_token;
      console.log("Performed login, new token:", token);
    }

    // Build filters
    const fromDate = req.query.startDate
      ? `${req.query.startDate}T00:00:00+05:30`
      : null;
    const toDate = req.query.endDate
      ? `${req.query.endDate}T23:59:59.999999+05:30`
      : null;

    let callTypes;
    if (!req.query.direction || req.query.direction === "All") {
      // default to all call types
      callTypes = ["incoming", "outgoing", "missed", "not_connected"];
    } else {
      callTypes = [req.query.direction];
    }

    const queryParams = {
      offset: req.query.offset || 0,
      limit: req.query.limit || 1000,
      filter_min_start_datetime: fromDate,
      filter_max_start_datetime: toDate,
      filter_frontend_call_types: callTypes,
      filter_other_numbers:
        req.query.callerIdNumber && req.query.callerIdNumber !== "null"
          ? req.query.callerIdNumber
          : null,
      filter_agent_name:
        req.query.agentName && req.query.agentName !== "null"
          ? req.query.agentName
          : null,
      filter_student_name:
        req.query.studentName && req.query.studentName !== "undefined"
          ? req.query.studentName
          : null,
    };

    // Remove null values
    Object.keys(queryParams).forEach(
      (k) => queryParams[k] === null && delete queryParams[k]
    );

    // ✅ Call FastAPI with proper serializer
    const response = await axios.get(FASTAPI_CALLS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: queryParams,
      paramsSerializer: (params) => {
  return Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(
            (v) => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`
          )
          .join("&");
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");
},
    });
    console.log("Calls fetched:", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("Error fetching calls:", err.response?.data || err.message);
    res.status(500).json({ error: "Unable to fetch calls" });
  }
});

// --- GET RECORDING API ---
router.get("/Get_Recording_URL/:id", async (req, res) => {
  try {
    // Extract recording_id from params
    const recordingId = req.params.id;

    // Extract token from headers
    // const token = req.headers.authorization?.replace("Bearer ", "");
    // const token = await getToken();
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0OGEwMzY2ZC1jNzJhLTRiOTItOWIxMS01OTg1MTZmZGEwYWUiLCJwaG9uZV9udW1iZXIiOiI5ODk1MDk1NzEzIiwiY2xpZW50X3R5cGUiOiJjb25zb2xlIiwiZGV2aWNlX2lkIjoiYjQwZjlmZmFhNDgwODAxNiIsImRldmljZV9yb20iOiJ1bmtub3duIiwic2NvcGVzIjpbImNvbnNvbGU6YWxsIl0sImV4cCI6MTc4NzY1NDk4NiwiaWF0IjoxNzU2MTE4OTg2LCJ0eXBlIjoiYWNjZXNzIn0.kFGQT3BZrpcqeFZkhK7S2QE8-uC6xDsEd6nk469AipQ";

    if (!token) {
      return res.status(401).json({ error: "Missing access token" });
    }

    if (!recordingId) {
      return res.status(404).json({ error: "Missing recording ID" });
    }

    // Call FastAPI with Bearer token
    const response = await axios.get(
      `${FASTAPI_RECORDING_URL}/${recordingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    // Return the recording info (usually has download_url)
    res.json(response.data.download_url);
  } catch (err) {
    console.error(
      "Error fetching recording:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Unable to fetch recording" });
  }
});


async function performLogin() {
const loginPayload = {
      client_type: "console",
      client_key: "your_console_key_here", // 🔑 replace with real key
      device_id: "b40f9ffaa4808016",       // could come from frontend
      device_rom: "unknown",
      phone_number: "9895095713",
      otp_jwt: "",                         // empty or actual OTP JWT
      password: "Test@123"
    };

  const response = await axios.post(
    FASTAPI_LOGIN_URL,
    new URLSearchParams(loginPayload), // 🔑 must send as form-data (x-www-form-urlencoded)
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return response.data;
}

module.exports = router;
