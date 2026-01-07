import React from "react";
import { getCurrentPhase } from "../courseLogic";

function StatsPanel({ courses }) {
  if (!courses || courses.length === 0) return null;

  const active = courses.filter((c) => !c.archived);
  const archived = courses.filter((c) => c.archived);

  let inProgressCount = 0;
  let finishedCount = 0;

  active.forEach((course) => {
    const info = getCurrentPhase(course);
    if (info.status === "in_progress") inProgressCount += 1;
    if (info.status === "finished") finishedCount += 1;
  });

  return (
    <section className="stats-panel">
      <div className="stat-item">
        <span className="stat-label">Активні курси</span>
        <span className="stat-value">{active.length}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">В процесі</span>
        <span className="stat-value">{inProgressCount}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Завершені (активні)</span>
        <span className="stat-value">{finishedCount}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">В архіві</span>
        <span className="stat-value">{archived.length}</span>
      </div>
    </section>
  );
}

export default StatsPanel;
