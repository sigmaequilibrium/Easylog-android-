import { classifyHomeWorkTrip } from "./homeWork";

const PLACE_RULES_KEY = "easylog_place_rules";

const LEGACY_PLACE_RULES_KEY = "snaplog_place_rules";

function loadPlaceRules() {
  try {
    const e = localStorage.getItem(PLACE_RULES_KEY) || localStorage.getItem(LEGACY_PLACE_RULES_KEY);
    if (e) {
      return JSON.parse(e);
    }
  } catch (error) {
    console.error("Failed to load place rules", error);
  }
  return [
    {
      id: "1",
      name: "Home",
      addressSnippet: "home",
      tripType: "personal",
      category: "Personal",
    },
    {
      id: "2",
      name: "Office / HQ",
      addressSnippet: "office",
      tripType: "work",
      category: "General Business",
    },
    {
      id: "3",
      name: "Hardware & Supplies",
      addressSnippet: "bunnings",
      tripType: "work",
      category: "Supplies",
    },
  ];
}

export async function predictTripTag(e, t = []) {
  const {
    startAddress = "",
    endAddress = "",
    distance = 0,
    startTime = new Date().toISOString(),
    vehicle = "",
    notes = "",
  } = e;
  const m =
    e.startLocation ||
    (startAddress
      ? {
          latitude: 0,
          longitude: 0,
          address: startAddress,
        }
      : undefined);
  const x =
    e.endLocation ||
    (endAddress
      ? {
          latitude: 0,
          longitude: 0,
          address: endAddress,
        }
      : undefined);
  const b = classifyHomeWorkTrip(m, x);
  if (b.recommendedType) {
    return {
      predictedTripType: b.recommendedType,
      confidence: b.isHomeTrip ? 99 : 95,
      predictedClient: "",
      predictedCategory:
        b.recommendedType === "personal" ? "Personal / Commute" : "General Business",
      predictedReason:
        b.reason || (b.recommendedType === "personal" ? "Commute (Home travel)" : "Work travel"),
      tags: [
        b.recommendedType === "personal" ? "Personal" : "Work",
        b.isCommute ? "ATO Commute" : b.isHomeTrip ? "Home" : "Office",
      ],
      explanation: b.ruleExplanation || "Classified based on configured Home/Work location rules.",
    };
  }
  const y = loadPlaceRules();
  const g = `${startAddress} ${endAddress} ${notes}`.toLowerCase();
  for (const v of y) {
    if (v.addressSnippet && g.includes(v.addressSnippet.toLowerCase())) {
      return {
        predictedTripType: v.tripType,
        confidence: 96,
        predictedClient: v.clientName || "",
        predictedCategory: v.category || (v.tripType === "work" ? "Client / Business" : "Personal"),
        predictedReason: `Auto-matched known place: ${v.name}`,
        tags: [v.tripType === "work" ? "Work" : "Personal", v.name],
        explanation: `Matches your saved rule for "${v.name}".`,
      };
    }
  }
  try {
    const v = new AbortController();
    const T = setTimeout(() => v.abort(), 4500);
    const F = await fetch("/api/predict-trip-tag", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startAddress,
        endAddress,
        distance,
        startTime,
        vehicle,
        notes,
        recentTrips: t.map((R) => ({
          startAddress: R.startLocation?.address,
          endAddress: R.endLocation?.address,
          tripType: R.tripType,
          clientName: R.clientName,
          notes: R.notes,
        })),
      }),
      signal: v.signal,
    });
    clearTimeout(T);
    if (F.ok) {
      const R = await F.json();
      if (R.prediction) {
        return R.prediction;
      }
    }
  } catch {}
  const M = new Date(startTime).getHours();
  const z = new Date(startTime).getDay();
  const G = !(z === 0 || z === 6) && M >= 8 && M <= 18;
  if (endAddress) {
    const v = endAddress.split(",")[0].trim().toLowerCase();
    const T = t.find(
      (F) => F.endLocation?.address && F.endLocation.address.toLowerCase().includes(v),
    );
    if (T) {
      return {
        predictedTripType: T.tripType || "work",
        confidence: 90,
        predictedClient: T.clientName || "",
        predictedCategory: T.tripType === "personal" ? "Personal" : "Repeat Client",
        predictedReason: T.notes || "Trip to recurring destination",
        tags: [T.tripType === "personal" ? "Personal" : "Work", "Repeat Visit"],
        explanation: `Destination matches previous trip to ${T.clientName || v}.`,
      };
    }
  }
  const j = /home|gym|supermarket|woolworths|coles|cinema|cafe|beach|mall|park/i.test(g);
  const predictedTripType = j ? "personal" : G ? "work" : "personal";
  return {
    predictedTripType,
    confidence: G ? 84 : 76,
    predictedClient: "",
    predictedCategory: predictedTripType === "work" ? "Client Visit" : "Personal",
    predictedReason:
      predictedTripType === "work" ? "Business meeting / site travel" : "Personal errand",
    tags: [predictedTripType === "work" ? "Work" : "Personal"],
    explanation: j
      ? "Detected personal location keywords."
      : G
        ? "Standard business hours weekday travel."
        : "After-hours / weekend travel.",
  };
}
