import React, { useState } from "react";
import { getCurrentPhase } from "../courseLogic";

function CourseCard({ course, onDelete, onToggleToday, onSaveNote, onToggleArchive, onUpdate }) {
  const info = getCurrentPhase(course);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(course.name);
  const [startDate, setStartDate] = useState(course.startDate.slice(0, 10));
  const [phasesText, setPhasesText] = useState(
    course.phases.map((p) => `${p.days}: ${p.label}`).join("\n")
  );
  const [note, setNote] = useState(course.todayNote || "");

  async function handleSave() {
    const phases = phasesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [daysPart, ...labelParts] = line.split(":");
        return {
          days: Number(daysPart.trim()),
          label: labelParts.join(":").trim(),
        };
      });

    await onUpdate(course, {
      name,
      startDate,
      phases,
    });
    setEditMode(false);
  }

  async function handleNoteBlur() {
    await onSaveNote(course, note);
  }

  return (
    <div className={`course-card ${course.archived ? "archived" : ""}`}>
      <div className="course-header">
        <div>
          {!editMode ? (
            <>
              <h3>{course.name}</h3>
              <p className="muted">Старт: {course.startDate.slice(0, 10)}</p>
            </>
          ) : (
            <>
              <input
                className="inline-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="inline-input"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </>
          )}
        </div>
        <div className="course-actions">
          <button
            className="btn-icon"
            title={course.archived ? "Повернути з архіву" : "Архівувати"}
            onClick={() => onToggleArchive(course)}
          >
            {course.archived ? "↩" : "📦"}
          </button>
          <button
            className="btn-icon"
            title="Редагувати"
            onClick={() => setEditMode((v) => !v)}
          >
            ✎
          </button>
          <button
            className="btn-icon"
            title="Видалити курс"
            onClick={() => onDelete(course._id)}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="course-body">
        {!editMode && (
          <>
            {info.status === "not_started" && (
              <p>
                Курс ще не почався. До старту залишилось{" "}
                <strong>{info.startsIn}</strong> дн.
              </p>
            )}

            {info.status === "in_progress" && (
              <>
                <p>
                  Поточна фаза: <strong>{info.phase.label}</strong>
                </p>
                <p>
                  День у фазі: <strong>{info.dayInPhase}</strong>
                  {" · "}
                  Залишилось днів у фазі:{" "}
                  <strong>{info.daysLeft}</strong>
                </p>

                {!course.archived && (
                  <button
                    className={
                      course.todayTaken
                        ? "btn-outline btn-small active-pill"
                        : "btn-outline btn-small"
                    }
                    type="button"
                    onClick={() => onToggleToday(course)}
                  >
                    {course.todayTaken
                      ? "Сьогодні вже прийнято ✔"
                      : "Відмітити прийом за сьогодні"}
                  </button>
                )}
              </>
            )}

            {info.status === "finished" && (
              <p>
                <strong>Курс завершено ✅</strong>
              </p>
            )}

            {!course.archived && (
              <div className="note-block">
                <label className="field">
                  <span>Нотатка за сьогодні (самопочуття, побічки):</span>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onBlur={handleNoteBlur}
                    placeholder="Наприклад: важко заснув, трохи головний біль..."
                  />
                </label>
              </div>
            )}

            <details>
              <summary>Показати всі етапи</summary>
              <ol>
                {course.phases.map((p, idx) => (
                  <li key={idx}>
                    {p.days} дн. — {p.label}
                  </li>
                ))}
              </ol>
            </details>
          </>
        )}

        {editMode && (
          <div className="edit-block">
            <label className="field">
              <span>Етапи (дні: опис)</span>
              <textarea
                rows={4}
                value={phasesText}
                onChange={(e) => setPhasesText(e.target.value)}
              />
            </label>
            <button className="btn-primary btn-small" type="button" onClick={handleSave}>
              Зберегти зміни
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseList({ courses, onDelete, onToggleToday, onSaveNote, onToggleArchive, onUpdate }) {
  if (courses.length === 0) {
    return <p>Наразі курсів немає. Додай перший вище 👆</p>;
  }

  const active = courses.filter((c) => !c.archived);
  const archived = courses.filter((c) => c.archived);

  return (
    <>
      {active.length > 0 && (
        <>
          <h2 style={{ fontSize: "0.95rem", marginBottom: 4 }}>Активні курси</h2>
          <div className="course-list">
            {active.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={onDelete}
                onToggleToday={onToggleToday}
                onSaveNote={onSaveNote}
                onToggleArchive={onToggleArchive}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </>
      )}

      {archived.length > 0 && (
        <>
          <h2 style={{ fontSize: "0.95rem", marginTop: 16, marginBottom: 4 }}>
            Архівовані курси
          </h2>
          <div className="course-list">
            {archived.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onDelete={onDelete}
                onToggleToday={onToggleToday}
                onSaveNote={onSaveNote}
                onToggleArchive={onToggleArchive}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default CourseList;
