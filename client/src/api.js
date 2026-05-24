const API_URL = process.env.API_URL || "https://med-di21.onrender.com/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request error");
  }

  return data;
}

export function register(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function fetchCourses() {
  return request("/courses");
}

export function createCourse(course) {
  return request("/courses", {
    method: "POST",
    body: JSON.stringify(course),
  });
}

export function deleteCourse(id) {
  return request(`/courses/${id}`, { method: "DELETE" });
}

export function toggleToday(courseId) {
  return request(`/courses/${courseId}/toggle-today`, {
    method: "POST",
  });
}

export function saveTodayNote(courseId, note) {
  const today = new Date().toISOString().slice(0, 10);
  return request(`/courses/${courseId}/note`, {
    method: "POST",
    body: JSON.stringify({ date: today, note }),
  });
}

export function toggleArchive(courseId) {
  return request(`/courses/${courseId}/archive`, {
    method: "POST",
  });
}

export function updateCourse(courseId, data) {
  return request(`/courses/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
