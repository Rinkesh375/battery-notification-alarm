import { useEffect, useState } from "react";

export default function App() {
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isCharging, setIsCharging] = useState(null);
  const [alertPlayed, setAlertPlayed] = useState(false);
  const [permissionGiven, setPermissionGiven] = useState(false);

  const handlePermission = () => {
    setPermissionGiven(true);
  };

  useEffect(() => {
    if (!permissionGiven) return;

    let battery = null;

    const updateBattery = () => {
      if (!battery) return;

      const level = Math.round(battery.level * 100);
      setBatteryLevel(level);
      setIsCharging(battery.charging);

      if (level > 70 && !alertPlayed) {
        const audio = new Audio("/battery-alert.mp3");
        audio.play();
        setAlertPlayed(true);
      }

      if (level <= 70 && alertPlayed) {
        setAlertPlayed(false);
      }
    };

    async function getBatteryInfo() {
      if (!navigator.getBattery) {
        console.warn("Battery API not supported in this browser.");
        return;
      }

      battery = await navigator.getBattery();
      updateBattery();

      battery.addEventListener("levelchange", updateBattery);
      battery.addEventListener("chargingchange", updateBattery);
    }

    getBatteryInfo();

    return () => {
      if (battery) {
        battery.removeEventListener("levelchange", updateBattery);
        battery.removeEventListener("chargingchange", updateBattery);
      }
    };
  }, [alertPlayed, permissionGiven]);

  const fill = `${Math.max(0, Math.min(100, batteryLevel ?? 0))}%`;

  return (
    <div className="mx-auto my-8 w-64 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">🔋 Battery Status</h3>

      {!permissionGiven ? (
        <button
          onClick={handlePermission}
          className="rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
        >
          Enable Sound Alert
        </button>
      ) : batteryLevel !== null ? (
        <>
          <div className="mb-2 text-sm font-medium text-gray-700">
            {batteryLevel}% · {isCharging ? "Charging ⚡" : "Not charging"}
          </div>

          <div className="mx-auto w-40">
            <div className="relative h-5 w-full overflow-hidden rounded-md border border-gray-200">
              <div
                className={`h-full transition-all duration-300 ${
                  batteryLevel !== null && batteryLevel > 20
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
                style={{ width: fill }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/90">
                {fill}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500">Battery info not available</div>
      )}
    </div>
  );
}
