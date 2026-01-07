import React, { useEffect, useState } from "react";
import {
  login,
  register,
  fetchCourses,
  createCourse,
  deleteCourse,
  toggleToday,
  saveTodayNote,
  toggleArchive,
  updateCourse,
} from "./api";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import CourseForm from "./components/CourseForm";
import CourseList from "./components/CourseList";
import TodayPanel from "./components/TodayPanel";
import ReminderSettings from "./components/ReminderSettings";
import AboutApp from "./components/AboutApp";
import StatsPanel from "./components/StatsPanel";

function App() {
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("email");
    return email ? { email } : null;
  });
  const [view, setView] = useState("login");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAbout, setShowAbout] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("theme-dark");
    } else {
      document.body.classList.remove("theme-dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      setView("app");
      loadCourses();
    }
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await fetchCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(email, password) {
    try {
      setError("");
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.user.email);
      setUser({ email: data.user.email });
      setView("app");
      await loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRegister(email, password) {
    try {
      setError("");
      const data = await register(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.user.email);
      setUser({ email: data.user.email });
      setView("app");
      await loadCourses();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateCourse(course) {
    try {
      setError("");
      const created = await createCourse(course);
      setCourses((prev) => [created, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCourse(id) {
    try {
      setError("");
      await deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleToday(course) {
    try {
      setError("");
      const res = await toggleToday(course._id);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, todayTaken: res.todayTaken } : c
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveTodayNote(course, note) {
    try {
      setError("");
      const res = await saveTodayNote(course._id, note);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, todayNote: res.note } : c
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleArchiveCourse(course) {
    try {
      setError("");
      const res = await toggleArchive(course._id);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === course._id ? { ...c, archived: res.archived } : c
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateCourse(course, data) {
    try {
      setError("");
      const updated = await updateCourse(course._id, data);
      setCourses((prev) =>
        prev.map((c) => (c._id === course._id ? updated : c))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    setCourses([]);
    setView("login");
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const reminderTime = localStorage.getItem("reminderTime");
      if (!reminderTime) return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const current = `${hh}:${mm}`;

      const today = now.toISOString().slice(0, 10);
      const lastDate = localStorage.getItem("lastReminderDate");

      if (current === reminderTime && lastDate !== today) {
        new Notification("Med Cycle Tracker", {
          body: "Час перевірити сьогоднішні ліки 🌙",
        });
        localStorage.setItem("lastReminderDate", today);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="app-root">
      <div className="app-card">
        <header className="app-header">
          <h1>Med Cycle Tracker</h1>
          <p className="subtitle">Bubu pharmacist</p>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        {!user && (
          <>
            <div className="tabs">
              <button
                className={view === "login" ? "tab active" : "tab"}
                onClick={() => setView("login")}
              >
                Вхід
              </button>
              <button
                className={view === "register" ? "tab active" : "tab"}
                onClick={() => setView("register")}
              >
                Реєстрація
              </button>
            </div>

            {view === "login" && <LoginForm onSubmit={handleLogin} />}
            {view === "register" && <RegisterForm onSubmit={handleRegister} />}
          </>
        )}

        {user && (
          <>
            <div className="top-bar">
              <span className="user-email">{user.email}</span>
              <div className="top-bar-buttons">
                <button
                  className="btn-outline btn-small"
                  onClick={toggleTheme}
                >
                  {theme === "light" ? "Темна тема" : "Світла тема"}
                </button>
                <button
                  className="btn-outline btn-small"
                  onClick={() => setShowAbout((v) => !v)}
                >
                  {showAbout ? "Сховати опис" : "Про застосунок"}
                </button>
                <button className="btn-outline" onClick={handleLogout}>
                  Вийти
                </button>
              </div>
            </div>

            {showAbout && <AboutApp />}

            <ReminderSettings />
            <TodayPanel courses={courses} />
            <StatsPanel courses={courses} />

            <CourseForm onSubmit={handleCreateCourse} />

            {loading ? (
              <p>Завантаження курсів...</p>
            ) : (
              <CourseList
                courses={courses}
                onDelete={handleDeleteCourse}
                onToggleToday={handleToggleToday}
                onSaveNote={handleSaveTodayNote}
                onToggleArchive={handleToggleArchiveCourse}
                onUpdate={handleUpdateCourse}
              />
            )}
          </>
        )}

        <footer className="footer">
          <small>
            ⚕️ Нагадування, а не лікар. Завжди консультуйся з фахівцем.
          </small>
        </footer>
      </div>
    </div>
  );
}

export default App;
