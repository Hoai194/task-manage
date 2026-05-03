import { useEffect, useState } from "react";

function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
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

export default function CalendarView({ projects, onFetchByDateRange, onNavigateToProject, onError }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects]);

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
            <h2 className="section-title mb-0">Tasks by date range</h2>
          </div>
          <select
            className="form-select"
            style={{ maxWidth: 220 }}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
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
                    const cls = [
                      "cal-bar",
                      `priority-bar-${task.priority}`,
                      isStart ? "bar-start" : "bar-mid",
                      isEnd   ? "bar-end"   : "",
                    ].filter(Boolean).join(" ");

                    return (
                      <button
                        key={task._id + "-" + day}
                        className={cls}
                        title={task.title + (span > 1 ? " \u00b7 " + span + " days" : "")}
                        onClick={() => onNavigateToProject(task.project_id)}
                      >
                        {isStart ? task.title : "\u00a0"}
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
