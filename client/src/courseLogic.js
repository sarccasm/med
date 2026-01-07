export function getCurrentPhase(course) {
  const startDate = new Date(course.startDate);
  const today = new Date();

  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const now = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: "not_started",
      startsIn: Math.abs(diffDays),
    };
  }

  let passed = 0;
  for (const phase of course.phases) {
    if (diffDays < passed + phase.days) {
      const dayInPhase = diffDays - passed + 1;
      const daysLeft = phase.days - dayInPhase;
      return {
        status: "in_progress",
        phase,
        dayInPhase,
        daysLeft,
      };
    }
    passed += phase.days;
  }

  return { status: "finished" };
}
