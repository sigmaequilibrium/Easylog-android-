import { isNativePlatform } from "./platform";

const ODOMETER_PROMPT = `You are an expert vehicle odometer and instrument cluster reader.
Analyze this photo of a car/vehicle dashboard or instrument cluster.
Locate the primary odometer display that shows the total cumulative distance/mileage of the vehicle.
Rules:
1. Distinguish between the total odometer (often marked 'ODO', 'km', 'mi') and trip odometers ('TRIP A', 'TRIP B'). Always prioritize the main total odometer.
2. Return ONLY the numeric value as an integer in 'mileage'. Disregard or round decimal tenths.
3. If no odometer or numbers can be identified, set 'mileage' to 0.`;

const getGeminiApiKey = () =>
  localStorage.getItem("easylog_gemini_key") || import.meta.env?.VITE_GEMINI_API_KEY || "";

async function readOdometerWithGemini(image) {
  const t = getGeminiApiKey();
  if (!t) {
    throw new Error(
      "Odometer scanning needs a Gemini API key. Enter the reading manually instead.",
    );
  }
  const s = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
  const mimeType = s ? s[1] : "image/jpeg";
  const data = image.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, "");
  let d = null;
  for (const y of ["gemini-flash-latest", "gemini-2.5-flash"]) {
    try {
      const g = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${y}:generateContent?key=${t}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data,
                    },
                  },
                  {
                    text: ODOMETER_PROMPT,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  mileage: {
                    type: "INTEGER",
                  },
                },
                required: ["mileage"],
              },
            },
          }),
        },
      );
      if (!g.ok) {
        throw new Error(`Gemini error (${g.status})`);
      }
      const M = await g.json();
      const z = M?.candidates?.[0]?.content?.parts?.[0]?.text;
      const A = JSON.parse(z || "{}").mileage;
      if (typeof A === "number" && A > 0) {
        return A;
      }
      return null;
    } catch (error) {
      d = error;
    }
  }
  throw d || new Error("AI service unavailable. Enter the reading manually.");
}

export const analyzeOdometerImage = async (image) => {
  try {
    if (isNativePlatform()) {
      return await readOdometerWithGemini(image);
    }
    const t = await fetch("/api/analyze-odometer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image,
      }),
    });
    if (!t.ok) {
      const o = await t.json().catch(() => ({}));
      throw new Error(o.error || `Server error (${t.status})`);
    }
    const s = await t.json();
    if (s.mileage && typeof s.mileage === "number" && s.mileage > 0) {
      return s.mileage;
    }
    return null;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
