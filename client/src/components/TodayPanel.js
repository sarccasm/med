import React from "react";
import { getCurrentPhase } from "../courseLogic";

function TodayPanel({ courses }) {
  const items = courses
    .filter((c) => !c.archived)
    .map((course) => ({ course, info: getCurrentPhase(course) }))
    .filter(({ info }) => info.status === "in_progress");

  if (items.length === 0) return null;

  return (
    <section className="today-panel">
      <h2>Сьогодні</h2>
      {items.map(({ course, info }) => (
        <div key={course._id} className="today-item">
          <div>
            <strong>{course.name}</strong>
            <div className="muted">
              {info.phase.label} — день {info.dayInPhase}, лишилось {info.daysLeft} дн.
            </div>
            {course.todayNote && (
              <div className="muted" style={{ fontSize: "0.78rem", marginTop: 2 }}>
                Нотатка: {course.todayNote}
              </div>
            )}
          </div>
          {course.todayTaken ? (
            <span className="today-pill done">✔ Уже відмічено</span>
          ) : (
            <span className="today-pill">Потрібно прийняти</span>
          )}
        </div>
      ))}
    </section>
  );
}

export default TodayPanel;
