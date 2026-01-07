import React, { useEffect, useState } from "react";

function ReminderSettings() {
  const [time, setTime] = useState(
    () => localStorage.getItem("reminderTime") || ""
  );

  useEffect(() => {
    if (time) {
      localStorage.setItem("reminderTime", time);
    } else {
      localStorage.removeItem("reminderTime");
    }
  }, [time]);

  function askPermission() {
    if (!("Notification" in window)) return;
    Notification.requestPermission();
  }

  return (
    <div className="reminder-settings">
      <span className="muted small">Нагадування щодня о:</span>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button
        type="button"
        className="btn-outline btn-small"
        onClick={askPermission}
      >
        Дозволити сповіщення
      </button>
    </div>
  );
}

export default ReminderSettings;
