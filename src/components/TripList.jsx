import { useMemo } from "react";
import {
  Bluetooth,
  Briefcase,
  Calculator,
  Calendar,
  Car,
  CircleX,
  Clock,
  Download,
  FileCheck,
  FileText,
  Funnel,
  Gauge,
  MapPin,
  Navigation,
  Pencil,
  Plus,
  User,
} from "lucide-react";

export const TripList = ({
  trips,
  activeTrip,
  onExport,
  onEdit,
  onAddManual,
  filterType,
  onFilterTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  vehicles,
  filterRego,
  onFilterRegoChange,
  distanceUnit = "km",
  onViewMap,
  onViewAllMap,
  onOpenVerificationQueue,
}) => {
  const _ = useMemo(() => {
    const S = trips.map((K) => K.registrationNumber).filter((K) => !!K && K.trim() !== "");
    return Array.from(new Set([...vehicles, ...S])).sort();
  }, [trips, vehicles]);
  const v = useMemo(
    () =>
      trips.filter((S) => {
        if (filterRego && S.registrationNumber !== filterRego) {
          return false;
        }
        if (!startDate && !endDate) {
          return true;
        }
        const K = new Date(S.start.timestamp);
        if (startDate) {
          const ue = new Date(startDate);
          ue.setHours(0, 0, 0, 0);
          if (K < ue) {
            return false;
          }
        }
        if (endDate) {
          const ue = new Date(endDate);
          ue.setHours(23, 59, 59, 999);
          if (K > ue) {
            return false;
          }
        }
        return true;
      }),
    [trips, filterRego, startDate, endDate],
  );
  const T = useMemo(() => {
    const totalDist = v.reduce((acc, item) => acc + (item.distance || 0), 0);
    const workDist = v
      .filter((I) => (I.tripType || "work") === "work")
      .reduce((acc, item) => acc + (item.distance || 0), 0);
    const businessPercent = totalDist > 0 ? (workDist / totalDist) * 100 : 0;
    const v_length = v.length;
    const length = v.filter((I) => I.verificationStatus === "pending").length;
    const pendingDist = v
      .filter((I) => I.verificationStatus === "pending")
      .reduce((acc, item) => acc + (item.distance || 0), 0);
    const length_1 = v.filter(
      (I) => I.trackingMode === "gps" || I.triggerSource === "bluetooth",
    ).length;
    const length_2 = trips.filter(
      (I) => I.trackingMode === "gps" || I.triggerSource === "bluetooth",
    ).length;
    const tripsInOtherVehicles = filterRego
      ? trips.filter((I) => I.registrationNumber && I.registrationNumber !== filterRego).length
      : 0;
    return {
      totalDist,
      workDist,
      businessPercent,
      totalTrips: v_length,
      pendingCount: length,
      pendingDist,
      gpsCount: length_1,
      totalGpsInHistory: length_2,
      tripsInOtherVehicles,
    };
  }, [v, trips, filterRego]);
  const F = v.filter((S) => {
    switch (filterType) {
      case "unverified":
        return S.verificationStatus === "pending";
      case "gps":
        return S.trackingMode === "gps" || S.triggerSource === "bluetooth";
      default:
        return filterType === "all" || (S.tripType || "work") === filterType;
    }
  });
  const R = [...F].sort(
    (S, K) => new Date(K.start.timestamp).getTime() - new Date(S.start.timestamp).getTime(),
  );
  const W = () => {
    onStartDateChange("");
    onEndDateChange("");
  };
  const Z = () => {
    onFilterTypeChange("all");
    onFilterRegoChange("");
    W();
  };
  const H = distanceUnit === "km" ? "Km" : "Mi";
  const U = typeof navigator !== "undefined" ? navigator.language : undefined;
  const q = (S) => {
    if (!S) {
      return "";
    }
    const [K, ue, Le] = S.split("-").map(Number);
    return new Date(K, ue - 1, Le).toLocaleDateString(U);
  };
  return (
    <div className="space-y-4">
      {activeTrip && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-300 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs animate-fade-in">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600" />
            </span>
            <div>
              <div className="text-xs font-bold text-emerald-950 flex flex-wrap items-center gap-1.5">
                <Navigation size={13} className="text-emerald-700" />
                <span>Active GPS Drive Currently Tracking</span>
                {activeTrip.registrationNumber && (
                  <span className="font-mono text-[10.5px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                    {activeTrip.registrationNumber}
                  </span>
                )}
                {activeTrip.triggerSource === "bluetooth" && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                    <Bluetooth size={10} />
                    Car BT Auto
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Your drive is live in the HUD above! When you reach your destination or disconnect
                Bluetooth, it automatically finalizes and appears in this history list.
              </p>
            </div>
          </div>
          {onViewMap && (
            <button
              type="button"
              onClick={() => onViewMap(activeTrip)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <Navigation size={12} />
              <span>View Live Route</span>
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800">Trip History</h3>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {F.length} {F.length === 1 ? "trip" : "trips"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {onOpenVerificationQueue && (
              <button
                type="button"
                onClick={onOpenVerificationQueue}
                className={`flex items-center text-sm font-medium transition-colors px-3 py-1.5 rounded-lg border shadow-xs ${T.pendingCount > 0 ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 font-bold" : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"}`}
                title="Review uncommitted trips before final logbook commit"
              >
                <FileCheck size={14} className="mr-1.5" />
                <span>Verification ({T.pendingCount})</span>
              </button>
            )}
            {onViewAllMap && (
              <button
                type="button"
                onClick={onViewAllMap}
                disabled={trips.length === 0}
                className="flex items-center text-sm text-emerald-700 hover:text-emerald-800 font-medium transition-colors bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs"
              >
                <Navigation size={14} className="mr-1.5 text-emerald-600" />
                Map View
              </button>
            )}
            <button
              onClick={onAddManual}
              className="flex items-center text-sm text-gray-700 hover:text-indigo-600 font-medium transition-colors bg-white border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <Plus size={14} className="mr-1.5" />
              Add Trip
            </button>
            <button
              onClick={onExport}
              disabled={F.length === 0}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg"
            >
              <Download size={14} className="mr-1.5" />
              Export CSV
            </button>
          </div>
        </div>
        {startDate && endDate && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 text-white shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
              <div className="flex items-center text-sm font-semibold text-gray-300">
                <Calculator size={16} className="mr-2 text-green-400" />
                Logbook Summary
              </div>
              <div className="flex items-center space-x-2">
                {T.pendingCount > 0 && onOpenVerificationQueue && (
                  <button
                    type="button"
                    onClick={onOpenVerificationQueue}
                    className="text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded-full font-bold transition flex items-center"
                    title="Trips requiring verification"
                  >
                    ● {T.pendingCount} unverified
                  </button>
                )}
                <div className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                  {q(startDate)} - {q(endDate)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center divide-x divide-gray-700">
              <div>
                <div className="text-xl font-bold">{T.totalTrips}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Trips</div>
              </div>
              <div>
                <div className="text-xl font-bold">{T.totalDist.toLocaleString()}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">
                  Total {H}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-indigo-400">
                  {T.workDist.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">
                  Work {H}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">
                  {T.businessPercent.toFixed(0)}%
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">
                  Biz Use
                </div>
              </div>
            </div>
            {T.pendingCount > 0 && (
              <div className="mt-3 pt-2.5 border-t border-gray-700/80 flex items-center justify-between text-[11px] text-amber-300/95">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span>
                    Live total includes{" "}
                    <strong>
                      {T.pendingCount} unverified trip
                      {T.pendingCount === 1 ? "" : "s"}
                    </strong>{" "}
                    ({T.pendingDist.toLocaleString()} {H})
                  </span>
                </div>
                {onOpenVerificationQueue && (
                  <button
                    type="button"
                    onClick={onOpenVerificationQueue}
                    className="font-bold underline text-amber-200 hover:text-white transition shrink-0 ml-2"
                  >
                    Review Queue →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="flex items-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            <Funnel size={12} className="mr-1.5" />
            Filters
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex p-1 bg-gray-100 rounded-lg shrink-0 overflow-x-auto gap-0.5">
              <button
                onClick={() => onFilterTypeChange("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterType === "all" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                All
              </button>
              {T.pendingCount > 0 && (
                <button
                  onClick={() => onFilterTypeChange("unverified")}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center space-x-1 ${filterType === "unverified" ? "bg-amber-500 text-white shadow-sm" : "text-amber-800 bg-amber-100 hover:bg-amber-200"}`}
                  title="View trips requiring verification"
                >
                  <Clock size={11} />
                  <span>Needs Review ({T.pendingCount})</span>
                </button>
              )}
              <button
                onClick={() => onFilterTypeChange("gps")}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center space-x-1 ${filterType === "gps" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100"}`}
                title="Show auto-saved GPS and car Bluetooth drives"
              >
                <Navigation size={11} />
                <span>Auto & GPS ({T.gpsCount})</span>
              </button>
              <button
                onClick={() => onFilterTypeChange("work")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${filterType === "work" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Briefcase size={12} className="mr-1.5" />
                Work
              </button>
              <button
                onClick={() => onFilterTypeChange("personal")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center ${filterType === "personal" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <User size={12} className="mr-1.5" />
                Personal
              </button>
            </div>
            <div className="relative shrink-0 md:min-w-[140px]">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Car size={14} />
              </div>
              <select
                value={filterRego}
                onChange={(S) => onFilterRegoChange(S.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none h-full appearance-none font-medium"
              >
                <option value="">All Vehicles</option>
                {_.map((S) => (
                  <option key={S} value={S}>
                    {S}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 grow overflow-x-auto">
              <input
                type="date"
                value={startDate}
                onChange={(S) => onStartDateChange(S.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none w-full sm:w-auto"
                placeholder="Start Date"
              />
              <span className="text-gray-400 font-light">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(S) => onEndDateChange(S.target.value)}
                className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-1 focus:ring-indigo-500 outline-none w-full sm:w-auto"
                placeholder="End Date"
              />
              {(startDate || endDate || filterType !== "all" || filterRego) && (
                <button
                  onClick={Z}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Clear All Filters"
                >
                  <CircleX size={16} />
                </button>
              )}
            </div>
          </div>
          {filterRego && (
            <div className="bg-blue-50/70 border border-blue-100 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-blue-900">
              <div className="flex items-center space-x-1.5">
                <Car size={13} className="text-blue-600 shrink-0" />
                <span>
                  Filtered to vehicle <strong>{filterRego}</strong> ({F.length} matching).
                  {T.tripsInOtherVehicles > 0 && (
                    <span className="text-blue-700 ml-1">
                      ({T.tripsInOtherVehicles} trip
                      {T.tripsInOtherVehicles === 1 ? "" : "s"} recorded under other vehicle
                      registrations).
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onFilterRegoChange("")}
                className="font-bold underline text-blue-700 hover:text-blue-900 self-start sm:self-auto"
              >
                Show All Vehicles
              </button>
            </div>
          )}
          {T.pendingCount > 0 && filterType !== "unverified" && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-amber-900">
              <div className="flex items-center space-x-1.5">
                <Clock size={13} className="text-amber-600 shrink-0" />
                <span>
                  <strong>
                    {T.pendingCount} auto-saved trip
                    {T.pendingCount === 1 ? "" : "s"}
                  </strong>{" "}
                  in the Verification Queue awaiting ATO review.
                </span>
              </div>
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => onFilterTypeChange("unverified")}
                  className="font-bold underline text-amber-800 hover:text-amber-950 text-[11px]"
                >
                  View in List
                </button>
                {onOpenVerificationQueue && (
                  <button
                    type="button"
                    onClick={onOpenVerificationQueue}
                    className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10.5px] font-bold shadow-2xs"
                  >
                    Review Queue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText size={48} className="mb-4 opacity-20" />
          <p className="font-semibold text-gray-600">No completed trips in logbook yet.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
            {activeTrip
              ? 'A GPS trip is currently running above. Tap "End Trip" in the HUD to finalize it.'
              : 'Start a drive with "Start GPS Trip" or connect to your car Bluetooth to automatically log trips.'}
          </p>
          <button
            onClick={onAddManual}
            className="mt-4 text-indigo-600 text-sm font-semibold hover:underline"
          >
            Add a trip manually
          </button>
        </div>
      )}
      {trips.length > 0 && F.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300 text-center space-y-2">
          <Funnel size={32} className="opacity-25 mx-auto" />
          <p className="text-sm font-bold text-gray-700">No trips match your current filters.</p>
          <div className="text-xs text-gray-500 max-w-md space-y-1">
            {filterRego && (
              <p>
                • You are currently filtering for vehicle <strong>{filterRego}</strong>. Trips may
                be logged under another vehicle or without a registration.
              </p>
            )}
            {(startDate || endDate) && (
              <p>
                • A date range filter is active ({q(startDate)} to {q(endDate)}
                ).
              </p>
            )}
            {filterType !== "all" && (
              <p>
                • Category filter is set to <strong>{filterType}</strong>.
              </p>
            )}
            {activeTrip && (
              <p className="text-emerald-700 font-medium">
                • A trip is currently active in the HUD above and has not been ended yet.
              </p>
            )}
            {T.pendingCount > 0 && (
              <p className="text-amber-700 font-medium">
                • You have <strong>{T.pendingCount}</strong> trip(s) in the Verification Queue.
              </p>
            )}
          </div>
          <div className="pt-2 flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={Z}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              Clear All Filters & Show All {trips.length} Trips
            </button>
            {onOpenVerificationQueue && T.pendingCount > 0 && (
              <button
                type="button"
                onClick={onOpenVerificationQueue}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Open Verification Queue ({T.pendingCount})
              </button>
            )}
          </div>
        </div>
      )}
      {R.map((S) => {
        const K = S.verificationStatus === "pending";
        return (
          <div
            key={S.id}
            className={`bg-white rounded-xl shadow-sm border overflow-hidden group transition ${K ? "border-amber-300 border-l-4 border-l-amber-500 bg-amber-50/15" : "border-gray-100"}`}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {K && (
                      <button
                        type="button"
                        onClick={() => onOpenVerificationQueue?.()}
                        className="flex items-center text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300 transition shadow-2xs"
                        title="Requires verification before final logbook commit"
                      >
                        <Clock size={10} className="mr-1 text-amber-700" />
                        Awaiting Verification
                      </button>
                    )}
                    {S.isCalibration && (
                      <span
                        className="flex items-center text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 shadow-2xs"
                        title="ATO Odometer Calibration & Baseline Sync"
                      >
                        <Gauge size={10} className="mr-1 text-amber-700" />
                        ATO Calibration Sync
                      </span>
                    )}
                    <span
                      className={`flex items-center text-xs font-semibold px-2 py-1 rounded ${S.tripType === "personal" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}`}
                    >
                      {S.tripType === "personal" ? (
                        <User size={12} className="mr-1" />
                      ) : (
                        <Briefcase size={12} className="mr-1" />
                      )}
                      {S.tripType === "personal" ? "Personal" : "Work"}
                    </span>
                    {S.trackingMode === "gps" && (
                      <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <Navigation size={10} className="mr-1 text-emerald-600" />
                        GPS
                      </span>
                    )}
                    {S.triggerSource === "bluetooth" && (
                      <span className="flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        <Bluetooth size={10} className="mr-1 text-blue-600" />
                        Car BT
                      </span>
                    )}
                    {S.registrationNumber && (
                      <span className="flex items-center text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                        {S.registrationNumber}
                      </span>
                    )}
                    <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded w-fit">
                      <Calendar size={12} className="mr-1" />
                      {new Date(S.start.timestamp).toLocaleDateString(U)}
                    </div>
                  </div>
                  {S.clientName && (
                    <div className="flex items-center text-xs font-semibold text-gray-700 mt-1 ml-1">
                      <Briefcase size={12} className="mr-1.5 text-gray-400" />
                      {S.clientName}
                    </div>
                  )}
                  {(S.startLocation?.address || S.endLocation?.address) && (
                    <button
                      type="button"
                      onClick={() => onViewMap?.(S)}
                      className="flex items-center text-xs text-gray-500 hover:text-indigo-600 mt-1 ml-1 max-w-[260px] truncate text-left transition"
                      title="View Route Map"
                    >
                      <MapPin size={11} className="mr-1 text-indigo-500 shrink-0" />
                      <span className="truncate hover:underline">
                        {S.startLocation?.address || "Start"} → {S.endLocation?.address || "End"}
                      </span>
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex flex-col items-end">
                    <div className="text-xl font-bold text-indigo-600">
                      {S.distance?.toLocaleString()}{" "}
                      <span className="text-sm font-normal text-gray-500">{distanceUnit}</span>
                    </div>
                    <div
                      className={`flex gap-1 mt-1 ${K ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
                    >
                      {K && onOpenVerificationQueue && (
                        <button
                          type="button"
                          onClick={onOpenVerificationQueue}
                          className="px-2 py-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition shadow-2xs flex items-center space-x-1"
                          title="Review and verify this trip"
                        >
                          <Clock size={11} />
                          <span>Verify</span>
                        </button>
                      )}
                      {onViewMap && (
                        <button
                          onClick={() => onViewMap(S)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                          title="View Route Map & AI Tags"
                        >
                          <Navigation size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(S)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                        title="Edit Trip"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    Start
                  </div>
                  <div className="font-medium text-gray-800">{S.start.value.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(S.start.timestamp).toLocaleTimeString(U, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="space-y-1 text-right border-l pl-4 border-gray-100">
                  <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    Finish
                  </div>
                  <div className="font-medium text-gray-800">
                    {S.end?.value.toLocaleString() || "-"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {S.end
                      ? new Date(S.end.timestamp).toLocaleTimeString(U, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
            {S.notes && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-600 flex items-start">
                <FileText size={14} className="mr-2 mt-0.5 text-gray-400 shrink-0" />
                <p>{S.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
