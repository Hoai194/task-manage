import { useEffect, useState } from "react";

function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function toLocalDay(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Premium project colors
const PROJECT_PALETTE = [
  { bg: "rgba(45, 110, 159, 0.18)", text: "#1b4361", border: "rgba(45, 110, 159, 0.4)" }, // Blue
  { bg: "rgba(47, 141, 108, 0.18)", text: "#114633", border: "rgba(47, 141, 108, 0.4)" }, // Green
  { bg: "rgba(223, 112, 71, 0.18)", text: "#8b2a13", border: "rgba(223, 112, 71, 0.4)" }, // Orange
  { bg: "rgba(242, 184, 66, 0.22)", text: "#725100", border: "rgba(242, 184, 66, 0.4)" }, // Gold
  { bg: "rgba(123, 104, 238, 0.18)", text: "#3c2e8c", border: "rgba(123, 104, 238, 0.4)" }, // Purple
  { bg: "rgba(255, 105, 180, 0.18)", text: "#8b1c4e", border: "rgba(255, 105, 180, 0.4)" }, // Pink
];

function getTaskColor(taskId) {
  if (!taskId) return PROJECT_PALETTE[0];
  const hash = taskId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PROJECT_PALETTE[hash % PROJECT_PALETTE.length];
}

export default function CalendarView({ projects, onFetchByDateRange, onNavigateToProject, onNavigateToTask, onError }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedProjectId) return;
    const { start, end } = getMonthRange(year, month);
    setLoading(true);
    onFetchByDateRange(selectedProjectId, start, end)
      .then(setTasks)
      .catch((err) => onError(err.message))
      .finally(() => setLoading(false));
  }, [year, month, selectedProjectId]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStart  = new Date(year, month, 1);
  const monthEnd    = new Date(year, month, daysInMonth);

  const taskSpans = tasks.map((task) => {
    const rawStart = toLocalDay(task.start_date) || toLocalDay(task.due_date);
    const rawEnd   = toLocalDay(task.due_date)   || rawStart;
    if (!rawStart || !rawEnd) return null;

    const clampedStart = rawStart < monthStart ? monthStart : rawStart;
    const clampedEnd   = rawEnd   > monthEnd   ? monthEnd   : rawEnd;
    if (clampedStart > clampedEnd) return null;

    return {
      task,
      startDay: clampedStart.getDate(),
      endDay:   clampedEnd.getDate(),
    };
  }).filter(Boolean);

  const tasksByDay = {};
  taskSpans.forEach(({ task, startDay, endDay }) => {
    for (let d = startDay; d <= endDay; d++) {
      if (!tasksByDay[d]) tasksByDay[d] = [];
      tasksByDay[d].push({ task, startDay, endDay, isStart: d === startDay, isEnd: d === endDay });
    }
  });

  const days = buildCalendarDays(year, month);

  return (
    <section className="calendar-section">
      <div className="composer-card mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <p className="eyebrow mb-1">Calendar</p>
            <h2 className="section-title mb-0">Monthly Schedule</h2>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 mb-3">
          <button className="btn btn-outline-dark btn-sm" onClick={prevMonth}>&#8249;</button>
          <span className="fw-bold fs-5">{MONTH_NAMES[month]} {year}</span>
          <button className="btn btn-outline-dark btn-sm" onClick={nextMonth}>&#8250;</button>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <div className="cal-grid">
            {DAY_NAMES.map((d) => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
            {days.map((day, i) => {
              const entries = day ? (tasksByDay[day] || []) : [];
              const isToday =
                day &&
                year  === today.getFullYear() &&
                month === today.getMonth() &&
                day   === today.getDate();

              return (
                <div
                  key={i}
                  className={["cal-cell", !day && "cal-empty", isToday && "cal-today"].filter(Boolean).join(" ")}
                >
                  {day && <span className="cal-day-num">{day}</span>}
                  {entries.map(({ task, startDay, endDay, isStart, isEnd }) => {
                    const span = endDay - startDay + 1;
                    const tColor = getTaskColor(task._id);
                    const cls = [
                      "cal-bar",
                      isStart ? "bar-start" : "bar-mid",
                      isEnd   ? "bar-end"   : "",
                    ].filter(Boolean).join(" ");

                    return (
                      <button
                        key={task._id + "-" + day}
                        className={cls}
                        style={{
                          backgroundColor: tColor.bg,
                          color: tColor.text,
                          borderLeft: isStart ? `3px solid ${tColor.border}` : "none",
                        }}
                        title={task.title + (span > 1 ? " \u00b7 " + span + " days" : "")}
                        onClick={() => onNavigateToTask(task)}
                      >
                        {isStart || isEnd ? (
                          <span className="d-flex align-items-center gap-1">
                            {task.title}
                            {isEnd && !isStart && " (End)"}
                          </span>
                        ) : (
                          "\u00a0"
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
