
import React, { useState } from "react";

function RegisterForm({ onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(email, password);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Реєстрація</h2>
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span>Пароль</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
      </label>
      <button className="btn-primary" type="submit">
        Створити акаунт
      </button>
    </form>
  );
}

export default RegisterForm;
