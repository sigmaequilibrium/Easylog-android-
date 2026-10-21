// EasyLogAuto backend
// ---------------------------------------------------------------------------
// The Android APK (v1.8.5) only contained the front end. Its code calls four
// server endpoints, so this file recreates them from what the front end sends
// and expects back:
//
//   POST /api/analyze-odometer   { image: dataUrl }          -> { mileage }
//   POST /api/predict-trip-tag   { startAddress, ... }       -> { prediction }
//   GET  /api/geocode?q=...                                    -> { results: [...] }
//   GET  /api/reverse-geocode?lat=..&lon=..                    -> { address }
//
// The Gemini key is read from GEMINI_API_KEY (AI Studio sets this as a
// server-side secret) and is never sent to the browser.
//
// Every endpoint is optional from the app's point of view: if one fails, the
// app falls back to its own on-device logic (keyword rules for trip tags,
// public map services for addresses). Only odometer photo scanning on the web
// depends on the server.
// ---------------------------------------------------------------------------
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === "production";
const MODELS = ["gemini-flash-latest", "gemini-2.5-flash"]; // same order as the app
const USER_AGENT = "EasyLogAuto/1.8.5 (mileage logbook)";

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

// Same prompt the app uses when it calls Gemini directly (see src/services/odometerAi.js)
const ODOMETER_PROMPT = `You are an expert vehicle odometer and instrument cluster reader.
Analyze this photo of a car/vehicle dashboard or instrument cluster.
Locate the primary odometer display that shows the total cumulative distance/mileage of the vehicle.
Rules:
1. Distinguish between the total odometer (often marked 'ODO', 'km', 'mi') and trip odometers ('TRIP A', 'TRIP B'). Always prioritize the main total odometer.
2. Return ONLY the numeric value as an integer in 'mileage'. Disregard or round decimal tenths.
3. If no odometer or numbers can be identified, set 'mileage' to 0.`;

async function generateJson(contents, responseSchema) {
  if (!ai)
    throw Object.assign(new Error("GEMINI_API_KEY is not set on the server."), { status: 503 });
  let lastError;
  for (const model of MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents,
        config: { responseMimeType: "application/json", responseSchema },
      });
      return JSON.parse(res.text || "{}");
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

const app = express();
app.use(express.json({ limit: "15mb" }));

app.post("/api/analyze-odometer", async (req, res) => {
  try {
    const image = String(req.body?.image || "");
    const match = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
    if (!match) return res.status(400).json({ error: "Expected an image data URL." });
    const data = image.slice(match[0].length);
    const result = await generateJson(
      [{ inlineData: { mimeType: match[1], data } }, { text: ODOMETER_PROMPT }],
      { type: Type.OBJECT, properties: { mileage: { type: Type.INTEGER } }, required: ["mileage"] },
    );
    res.json({ mileage: Number(result.mileage) || 0 });
  } catch (err) {
    console.error("analyze-odometer failed:", err);
    res
      .status(err.status || 500)
      .json({ error: "Could not read the odometer. Enter the reading manually." });
  }
});

// Note: this prompt was written for the rebuild — the original server's prompt
// was not part of the APK. The response shape matches what the app expects.
app.post("/api/predict-trip-tag", async (req, res) => {
  try {
    const {
      startAddress = "",
      endAddress = "",
      distance = 0,
      startTime = "",
      vehicle = "",
      notes = "",
      recentTrips = [],
    } = req.body || {};
    const history = recentTrips
      .slice(0, 25)
      .map(
        (t) =>
          `- ${t.startAddress || "?"} -> ${t.endAddress || "?"} | ${t.tripType || "?"}${t.clientName ? ` | client: ${t.clientName}` : ""}${t.notes ? ` | ${t.notes}` : ""}`,
      )
      .join("\n");
    const prompt = `You classify vehicle trips for an Australian (ATO) mileage logbook as "work" or "personal".
Trip:
- From: ${startAddress}
- To: ${endAddress}
- Distance: ${distance}
- Start time: ${startTime}
- Vehicle: ${vehicle}
- Notes: ${notes}

The driver's recent trips (use them to spot repeat clients and destinations):
${history || "(none)"}

Return your best prediction. "confidence" is 0-100. "predictedReason" is a short logbook purpose (e.g. "Client meeting", "Site visit"). "tags" has 1-3 short labels. "explanation" is one sentence saying why.`;
    const prediction = await generateJson([{ text: prompt }], {
      type: Type.OBJECT,
      properties: {
        predictedTripType: { type: Type.STRING, enum: ["work", "personal"] },
        confidence: { type: Type.INTEGER },
        predictedClient: { type: Type.STRING },
        predictedCategory: { type: Type.STRING },
        predictedReason: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        explanation: { type: Type.STRING },
      },
      required: ["predictedTripType", "confidence", "predictedReason", "tags", "explanation"],
    });
    res.json({ prediction: { predictedClient: "", predictedCategory: "", ...prediction } });
  } catch (err) {
    console.error("predict-trip-tag failed:", err);
    res.status(err.status || 500).json({ error: "Prediction unavailable." });
  }
});

app.get("/api/geocode", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 3) return res.json({ results: [] });
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`;
    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    });
    if (!r.ok) throw new Error(`Nominatim ${r.status}`);
    const list = await r.json();
    res.json({
      results: list.map((u) => ({
        displayName: u.display_name.split(",").slice(0, 3).join(",").trim(),
        fullAddress: u.display_name,
        lat: parseFloat(u.lat),
        lon: parseFloat(u.lon),
      })),
    });
  } catch (err) {
    console.error("geocode failed:", err);
    res.status(502).json({ results: [] });
  }
});

app.get("/api/reverse-geocode", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon))
      return res.status(400).json({ error: "lat and lon are required" });
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=16`;
    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    });
    if (!r.ok) throw new Error(`Nominatim ${r.status}`);
    const b = await r.json();
    // Same formatting the app uses for its own Nominatim fallback
    const a = b.address || {};
    const road = a.road || a.street || a.pedestrian || a.suburb || "";
    const town = a.city || a.town || a.village || a.city_district || a.county || "";
    const state = a.state ? a.state.substring(0, 3).toUpperCase() : "";
    let address =
      road && town
        ? `${road}, ${town}`
        : road || (town ? (state ? `${town}, ${state}` : town) : "");
    if (!address && b.display_name)
      address = b.display_name.split(",").slice(0, 2).join(",").trim();
    if (!address) return res.status(404).json({ error: "No address found" });
    res.json({ address });
  } catch (err) {
    console.error("reverse-geocode failed:", err);
    res.status(502).json({ error: "Reverse geocoding unavailable" });
  }
});

// Front end: Vite dev server in development, built files in production
if (isProd) {
  const dist = path.join(__dirname, "dist");
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `EasyLogAuto running on http://localhost:${PORT}${ai ? "" : "  (GEMINI_API_KEY not set — AI features will fall back)"}`,
  );
});
