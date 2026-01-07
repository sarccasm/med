import React, { useState } from "react";

function CourseForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [phasesText, setPhasesText] = useState(
    "7: Сильні снодійні\n5: Легкі снодійні\n3: Без ліків"
  );
  const [error, setError] = useState("");

  function parsePhases(text) {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      throw new Error("Додай хоча б один етап.");
    }

    const phases = lines.map((line, idx) => {
      const [daysPart, ...labelParts] = line.split(":");
      if (!daysPart || labelParts.length === 0) {
        throw new Error(
          `Рядок ${idx + 1}: використовуй формат "дні: опис", напр. "7: Сильні снодійні".`
        );
      }

      const days = Number(daysPart.trim());
      const label = labelParts.join(":").trim();

      if (Number.isNaN(days) || days <= 0) {
        throw new Error(
          `Рядок ${idx + 1}: кількість днів має бути додатнім числом.`
        );
      }
      if (!label) {
        throw new Error(`Рядок ${idx + 1}: опиши етап (наприклад "Легкі снодійні").`);
      }

      return { days, label };
    });

    return phases;
  }

  function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");

      if (!name.trim()) {
        throw new Error("Введи назву курсу.");
      }
      if (!startDate) {
        throw new Error("Обери дату початку курсу.");
      }

      const phases = parsePhases(phasesText);

      onSubmit({ name: name.trim(), startDate, phases });
      setName("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Новий курс</h2>

      <label className="field">
        <span>Назва курсу</span>
        <input
          type="text"
          placeholder="Курс від інсомнії"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Дата початку</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Етапи (дні: опис)</span>
        <textarea
          rows={4}
          value={phasesText}
          onChange={(e) => setPhasesText(e.target.value)}
        />
      </label>

      {error && <div className="alert alert-error small-alert">{error}</div>}

      <button className="btn-primary" type="submit">
        Зберегти курс
      </button>
    </form>
  );
}

export default CourseForm;
