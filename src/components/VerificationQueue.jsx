import { useState } from "react";
import {
  Briefcase,
  Check,
  CheckCheck,
  CircleAlert,
  CircleCheck,
  Clock,
  FileCheck,
  MapPin,
  Navigation,
  PenLine,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";

const TRIP_PURPOSES = [
  "Client Meeting",
  "Site Visit",
  "Sales Call",
  "Supplies / Parts",
  "Commute",
  "Errand",
  "Customer Delivery",
];

export const VerificationQueue = ({
  isOpen,
  onClose,
  unverifiedTrips,
  vehicles,
  distanceUnit = "km",
  onCommitTrip,
  onCommitAll,
  onUpdateTrip,
  onDeleteTrip,
  onViewMap,
  onOpenFullEditor,
  showNotification,
}) => {
  const [g, setG] = useState({});
  const [z, setZ] = useState(null);
  if (!isOpen) {
    return null;
  }
  const G = (H) =>
    g[H.id] || {
      tripType: H.tripType || "work",
      notes: H.notes || "",
      clientName: H.clientName || "",
      registrationNumber: H.registrationNumber || vehicles[0] || "",
    };
  const j = (H, U, q) => {
    setG((S) => {
      const K = S[H] || {
        tripType: unverifiedTrips.find((O) => O.id === H)?.tripType || "work",
        notes: unverifiedTrips.find((O) => O.id === H)?.notes || "",
        clientName: unverifiedTrips.find((O) => O.id === H)?.clientName || "",
        registrationNumber:
          unverifiedTrips.find((O) => O.id === H)?.registrationNumber || vehicles[0] || "",
      };
      return {
        ...S,
        [H]: {
          ...K,
          [U]: q,
        },
      };
    });
  };
  const _ = (H) => {
    const U = G(H);
    const q = {
      ...H,
      tripType: U.tripType,
      notes: U.notes.trim() || undefined,
      clientName: U.clientName.trim() || undefined,
      registrationNumber: U.registrationNumber.trim() || H.registrationNumber,
      verificationStatus: "verified",
    };
    onCommitTrip(q);
    showNotification(`Trip (${q.distance} ${distanceUnit}) committed to logbook!`, "success");
  };
  const v = () => {
    if (unverifiedTrips.length !== 0) {
      unverifiedTrips.forEach((H) => {
        if (g[H.id]) {
          const U = g[H.id];
          onUpdateTrip({
            ...H,
            tripType: U.tripType,
            notes: U.notes.trim() || undefined,
            clientName: U.clientName.trim() || undefined,
            registrationNumber: U.registrationNumber.trim() || H.registrationNumber,
            verificationStatus: "verified",
          });
        }
      });
      onCommitAll();
      showNotification(
        `All ${unverifiedTrips.length} trips verified and committed to official logbook!`,
        "success",
      );
      onClose();
    }
  };
  const T = (H) => {
    onDeleteTrip(H);
    setZ(null);
    showNotification("Unverified trip discarded", "success");
  };
  const F = unverifiedTrips.reduce(
    (acc, unverifiedTrip) => acc + (unverifiedTrip.distance || 0),
    0,
  );
  const length = unverifiedTrips.filter(
    (H) => (g[H.id]?.tripType || H.tripType || "work") === "work",
  ).length;
  const W = unverifiedTrips.length - length;
  const Z = typeof navigator !== "undefined" ? navigator.language : undefined;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col border border-gray-100">
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-xs">
              <FileCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight flex items-center gap-1.5">
                <span>Trip Verification Queue</span>
                <span className="bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {unverifiedTrips.length} Pending
                </span>
              </h2>
              <p className="text-[11px] text-amber-100 flex items-center">
                <ShieldCheck size={12} className="mr-1 text-white" />
                Review trip types and reasons before committing to logbook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
            aria-label="Close verification modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-amber-950">
              Total Pending:{" "}
              <strong className="font-mono text-amber-900">
                {F.toLocaleString()} {distanceUnit}
              </strong>
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-amber-800 text-[11px]">
              {length} Work, {W} Personal
            </span>
          </div>
          {unverifiedTrips.length > 0 && (
            <button
              type="button"
              onClick={v}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 active:scale-95"
            >
              <CheckCheck size={14} />
              <span>Commit All ({unverifiedTrips.length})</span>
            </button>
          )}
        </div>
        <div className="p-4 space-y-4 overflow-y-auto text-xs text-gray-700">
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3 text-[11px] text-blue-900 flex items-start space-x-2.5">
            <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold">Live calculations enabled:</strong> These pending
              trips are <strong>already included in your summary totals</strong> and business
              percentage calculations so your totals stay live while you drive. Review details at
              your convenience and commit them when ready.
            </div>
          </div>
          {unverifiedTrips.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <Check size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">All Trips Verified & Committed!</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                There are no pending trips waiting for review. All recorded trips have been
                committed to your official logbook.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
              >
                Close Queue
              </button>
            </div>
          ) : (
            unverifiedTrips.map((H, U) => {
              const q = G(H);
              const S = new Date(H.start.timestamp);
              const K = H.end ? new Date(H.end.timestamp) : null;
              const ue = z === H.id;
              return (
                <div
                  key={H.id}
                  className="bg-white border-2 border-amber-200/90 rounded-2xl p-4 shadow-sm space-y-3 hover:border-amber-300 transition relative overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center">
                        <Clock size={10} className="mr-1 text-amber-700" />
                        Requires Verification #{U + 1}
                      </span>
                      {H.triggerSource === "bluetooth" && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          🚗 Bluetooth Auto-End
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {H.registrationNumber || vehicles[0] || "CAR"}
                      </span>
                      <span className="text-sm font-bold text-indigo-700 font-mono">
                        {H.distance} {distanceUnit}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Departed
                      </span>
                      <div className="font-semibold text-gray-800">
                        {S.toLocaleDateString(Z, {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {S.toLocaleTimeString(Z, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate flex items-center mt-0.5">
                        <MapPin size={10} className="mr-1 text-indigo-500 shrink-0" />
                        <span className="truncate">
                          {H.startLocation?.address || `Odometer: ${H.start.value}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        Arrived
                      </span>
                      <div className="font-semibold text-gray-800">
                        {K
                          ? `${K.toLocaleDateString(Z, {
                              month: "short",
                              day: "numeric",
                            })} at ${K.toLocaleTimeString(Z, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "Trip End"}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate flex items-center mt-0.5">
                        <MapPin size={10} className="mr-1 text-rose-500 shrink-0" />
                        <span className="truncate">
                          {H.endLocation?.address ||
                            (H.end ? `Odometer: ${H.end.value}` : "Destination")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-700 flex items-center justify-between">
                      <span>Trip Classification</span>
                      <span className="text-[10px] font-normal text-gray-500">Tap to toggle</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => j(H.id, "tripType", "work")}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${q.tripType === "work" ? "bg-indigo-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"}`}
                      >
                        <Briefcase size={13} />
                        <span>Business / Work</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => j(H.id, "tripType", "personal")}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${q.tripType === "personal" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"}`}
                      >
                        <User size={13} />
                        <span>Personal</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-700 block">
                      Purpose / Reason of Trip
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {TRIP_PURPOSES.map((xe) => (
                        <button
                          key={xe}
                          type="button"
                          onClick={() => j(H.id, "notes", xe)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition ${q.notes === xe ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"}`}
                        >
                          {xe}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Client consultation at office, site inspection"
                      value={q.notes}
                      onChange={(xe) => j(H.id, "notes", xe.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-gray-600 block mb-1">
                        Client / Destination (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp, Sydney Branch"
                        value={q.clientName}
                        onChange={(xe) => j(H.id, "clientName", xe.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-gray-600 block mb-1">
                        Vehicle Registration
                      </label>
                      <select
                        value={q.registrationNumber}
                        onChange={(xe) => j(H.id, "registrationNumber", xe.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold uppercase focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        {vehicles.map((xe) => (
                          <option key={xe} value={xe}>
                            {xe}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {ue && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2 animate-fade-in">
                      <div className="text-xs text-red-900 font-semibold flex items-center">
                        <CircleAlert size={14} className="mr-1.5 text-red-600 shrink-0" />
                        Are you sure you want to discard this trip?
                      </div>
                      <p className="text-[11px] text-red-700">
                        This cannot be undone. Useful for accidental short movements or test drives.
                      </p>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setZ(null)}
                          className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => T(H.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                        >
                          Yes, Discard Trip
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1.5">
                      {onViewMap && (
                        <button
                          type="button"
                          onClick={() => onViewMap(H)}
                          className="px-2.5 py-1 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                          title="View route map"
                        >
                          <Navigation size={12} className="text-emerald-600" />
                          <span>Map</span>
                        </button>
                      )}
                      {onOpenFullEditor && (
                        <button
                          type="button"
                          onClick={() => onOpenFullEditor(H)}
                          className="px-2.5 py-1 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                          title="Edit full odometer readings and timestamps"
                        >
                          <PenLine size={12} />
                          <span>Full Edit</span>
                        </button>
                      )}
                      {!ue && (
                        <button
                          type="button"
                          onClick={() => setZ(H.id)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg transition"
                          title="Discard false trip"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => _(H)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 active:scale-95"
                    >
                      <Check size={14} />
                      <span>Verify & Commit</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500">
            {unverifiedTrips.length > 0 ? (
              <span>
                {unverifiedTrips.length} unverified trip
                {unverifiedTrips.length === 1 ? "" : "s"} remaining
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center">
                <CircleCheck size={13} className="mr-1" /> Logbook up to date
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-gray-700 hover:bg-gray-200 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
            {unverifiedTrips.length > 0 && (
              <button
                type="button"
                onClick={v}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
              >
                <CheckCheck size={13} />
                <span>Commit All</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
