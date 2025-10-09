import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

/** ==============================
 * Config API
 * ============================== */
const API_BASE = ""; // ví dụ: "http://localhost:3000"
const API = {
  list: (fromISO?: string, toISO?: string) =>
    `${API_BASE}/api/lich` +
    (fromISO && toISO
      ? `?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`
      : ""),
  create: () => `${API_BASE}/api/lich`,
  update: (id: string | number) => `${API_BASE}/api/lich/${id}`,
  remove: (id: string | number) => `${API_BASE}/api/lich/${id}`,
};

/** ==============================
 * Types
 * ============================== */
type EventItem = {
  id: string; // client id (uuid) – map với server id qua serverId
  serverId?: string | number; // id trên BE
  title: string;
  notes?: string;
  start: string; // ISO
  end?: string; // ISO
  allDay?: boolean;
  color?: string;
  reminderMinutes?: number;
  notifiedAt?: string | null; // ISO
};

type ServerEvent = {
  id: string | number;
  title: string;
  notes?: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  reminderMinutes?: number | null;
};

const LS_EVENTS = "work_calendar_events_v1";
const LS_QUEUE = "work_calendar_sync_queue_v1";

/** ==============================
 * Local persistence + Sync Queue
 * ============================== */
function loadEvents(): EventItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_EVENTS) || "[]");
  } catch {
    return [];
  }
}
function saveEvents(list: EventItem[]) {
  try {
    localStorage.setItem(LS_EVENTS, JSON.stringify(list));
  } catch {}
}

type QueueItem =
  | { type: "create"; payload: Omit<ServerEvent, "id">; clientId: string }
  | { type: "delete"; serverId: string | number }
  | {
      type: "update";
      serverId: string | number;
      payload: Partial<Omit<ServerEvent, "id">>;
    };

function loadQueue(): QueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_QUEUE) || "[]");
  } catch {
    return [];
  }
}
function saveQueue(q: QueueItem[]) {
  try {
    localStorage.setItem(LS_QUEUE, JSON.stringify(q));
  } catch {}
}

/** ==============================
 * Reminder engine (Web Notifications)
 * ============================== */
function useReminders(events: EventItem[]) {
  const ref = useRef<EventItem[]>(events);
  useEffect(() => {
    ref.current = events;
  }, [events]);

  useEffect(() => {
    let t: any;
    const tick = () => {
      const now = Date.now();
      const copy = ref.current.map((e) => ({ ...e }));
      let changed = false;
      for (const ev of copy) {
        if (!ev.reminderMinutes) continue;
        const startMs = new Date(ev.start).getTime();
        if (isNaN(startMs)) continue;
        const remindAt = startMs - ev.reminderMinutes * 60 * 1000;
        const notified = ev.notifiedAt
          ? new Date(ev.notifiedAt).getTime()
          : null;
        if (now >= remindAt && now <= startMs && !notified) {
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(ev.title || "Nhắc việc", {
              body: ev.notes || new Date(startMs).toLocaleString(),
              tag: ev.id,
            });
          }
          ev.notifiedAt = new Date().toISOString();
          changed = true;
        }
      }
      if (changed) saveEvents(copy);
      t = setTimeout(tick, 30000);
    };
    tick();
    return () => clearTimeout(t);
  }, []);
}

/** ==============================
 * UI
 * ============================== */
const COLORS = [
  { label: "Xanh dương", value: "#3b82f6" },
  { label: "Xanh lá", value: "#22c55e" },
  { label: "Cam", value: "#f97316" },
  { label: "Đỏ", value: "#ef4444" },
  { label: "Tím", value: "#a855f7" },
  { label: "Xám", value: "#64748b" },
];

/** ==============================
 * Component
 * ============================== */
export default function WorkCalendar() {
  const [events, setEvents] = useState<EventItem[]>(() => loadEvents());
  const [queue, setQueue] = useState<QueueItem[]>(() => loadQueue());

  // form state
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [start, setStart] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [end, setEnd] = useState<string>("");
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState(COLORS[0].value);
  const [reminder, setReminder] = useState<number | undefined>(15);

  // persist
  useEffect(() => {
    saveEvents(events);
  }, [events]);
  useEffect(() => {
    saveQueue(queue);
  }, [queue]);

  // reminders
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);
  useReminders(events);

  /** ============ Sync ============ */
  const syncFromServer = useCallback(
    async (viewStart?: string, viewEnd?: string) => {
      try {
        const res = await fetch(API.list(viewStart, viewEnd));
        if (!res.ok) return;
        const data: ServerEvent[] = await res.json();

        // hợp nhất: giữ client fields (notifiedAt) bằng cách map theo serverId
        const byServerId = new Map<string | number, EventItem>();
        for (const ev of events)
          if (ev.serverId) byServerId.set(ev.serverId, ev);

        const merged: EventItem[] = data.map((sv) => {
          const exist = byServerId.get(sv.id);
          return {
            id: exist?.id || crypto.randomUUID(),
            serverId: sv.id,
            title: sv.title,
            notes: sv.notes,
            start: sv.start,
            end: sv.end,
            allDay: !!sv.allDay,
            color: sv.color || COLORS[0].value,
            reminderMinutes: sv.reminderMinutes ?? undefined,
            notifiedAt: exist?.notifiedAt ?? null,
          };
        });

        setEvents((prev) => {
          // bỏ các event đang không thuộc server (nhưng còn pending create)
          const pendingCreates = prev.filter((e) => !e.serverId);
          return [...merged, ...pendingCreates];
        });
      } catch {}
    },
    [events]
  );

  const flushQueue = useCallback(async () => {
    if (!navigator.onLine) return; // chỉ sync khi online
    if (queue.length === 0) return;

    const rest: QueueItem[] = [];
    for (const job of queue) {
      try {
        if (job.type === "create") {
          const res = await fetch(API.create(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(job.payload),
          });
          if (!res.ok) throw new Error("create failed");
          const created: ServerEvent = await res.json();
          // gắn serverId vào event client
          setEvents((prev) =>
            prev.map((e) =>
              e.id === job.clientId ? { ...e, serverId: created.id } : e
            )
          );
        } else if (job.type === "delete") {
          const res = await fetch(API.remove(job.serverId), {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("delete failed");
        } else if (job.type === "update") {
          const res = await fetch(API.update(job.serverId), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(job.payload),
          });
          if (!res.ok) throw new Error("update failed");
        }
      } catch {
        // giữ lại job chưa xong
        rest.push(job);
      }
    }
    setQueue(rest);
  }, [queue]);

  useEffect(() => {
    const onOnline = () => flushQueue();
    window.addEventListener("online", onOnline);
    // flushQueue();
    return () => window.removeEventListener("online", onOnline);
  }, [flushQueue]);

  /** ============ CRUD local + enqueue ============ */
  const addEvent = useCallback(async () => {
    if (!title.trim() || !start) return;

    const clientId = crypto.randomUUID();
    const newItem: EventItem = {
      id: clientId,
      title: title.trim(),
      notes: notes.trim() || undefined,
      start: allDay
        ? new Date(start).toISOString().slice(0, 10) + "T00:00:00.000Z"
        : new Date(start).toISOString(),
      end: end ? new Date(end).toISOString() : undefined,
      allDay,
      color,
      reminderMinutes: reminder,
      notifiedAt: null,
    };
    setEvents((prev) => [...prev, newItem]);

    // ✅ Sửa ở đây
    const payload: Omit<ServerEvent, "id"> = {
      title: newItem.title,
      notes: newItem.notes,
      start: newItem.start,
      end: newItem.end,
      allDay: newItem.allDay,
      color: newItem.color,
      reminderMinutes: newItem.reminderMinutes ?? null,
    };
    setQueue((prev) => [...prev, { type: "create", payload, clientId }]);

    setTitle("");
    setNotes("");
    setEnd("");

    if (navigator.onLine) flushQueue();
  }, [title, notes, start, end, allDay, color, reminder, flushQueue]);

  const deleteEvent = useCallback(
    (id: string) => {
      const ev = events.find((e) => e.id === id);
      if (!ev) return;
      setEvents((prev) => prev.filter((e) => e.id !== id));
      if (ev.serverId)
        setQueue((prev) => [
          ...prev,
          { type: "delete", serverId: ev.serverId! },
        ]);
      if (navigator.onLine) flushQueue();
    },
    [events, flushQueue]
  );

  /** ============ FullCalendar bindings ============ */
  const fcEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: !!e.allDay,
        backgroundColor: e.color,
        borderColor: e.color,
      })),
    [events]
  );

  const headerToolbar = {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  } as any;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý lịch làm việc"
          subtitle="Quản lý lịch làm việc và nhắc việc"
          onCreateContract={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <FullCalendar
                  plugins={[
                    dayGridPlugin,
                    timeGridPlugin,
                    interactionPlugin,
                    listPlugin,
                  ]}
                  initialView="dayGridMonth"
                  headerToolbar={headerToolbar}
                  height={720}
                  locale="vi"
                  nowIndicator
                  selectable
                  events={fcEvents}
                  datesSet={(arg) => {
                    // mỗi khi chuyển view/tháng, nếu online thì kéo dữ liệu từ BE trong khoảng hiển thị
                    if (navigator.onLine) {
                      const fromISO = arg.start.toISOString();
                      const toISO = arg.end.toISOString();
                      syncFromServer(fromISO, toISO);
                    }
                  }}
                  eventClick={(info) => {
                    const ev = events.find((e) => e.id === info.event.id);
                    if (!ev) return;
                    const when = new Date(ev.start).toLocaleString();
                    alert(
                      `${ev.title}\n${when}${ev.notes ? `\n${ev.notes}` : ""}`
                    );
                  }}
                  dateClick={(info) => {
                    // đặt nhanh thời gian bắt đầu theo ô click
                    const d = info.date as Date;
                    const isoLocal = new Date(
                      d.getTime() - d.getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16);
                    setStart(isoLocal);
                  }}
                />
              </div>

              <div>
                <fieldset
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <legend style={{ padding: "0 6px" }}>
                    Thêm lịch/nhắc việc
                  </legend>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label>Tiêu đề</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ví dụ: Họp team"
                    />

                    <label>Ghi chú</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nội dung, link họp…"
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      <div>
                        <label>Bắt đầu</label>
                        <input
                          type="datetime-local"
                          value={start}
                          onChange={(e) => setStart(e.target.value)}
                        />
                      </div>
                      <div>
                        <label>Kết thúc (tuỳ chọn)</label>
                        <input
                          type="datetime-local"
                          value={end}
                          onChange={(e) => setEnd(e.target.value)}
                        />
                      </div>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allDay}
                        onChange={(e) => setAllDay(e.target.checked)}
                      />
                      Cả ngày
                    </label>

                    <div>
                      <label>Màu</label>
                      <select
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                      >
                        {COLORS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Nhắc trước</label>
                      <select
                        value={String(reminder ?? "none")}
                        onChange={(e) =>
                          setReminder(
                            e.target.value === "none"
                              ? undefined
                              : Number(e.target.value)
                          )
                        }
                      >
                        <option value="none">Không nhắc</option>
                        <option value="5">5 phút</option>
                        <option value="10">10 phút</option>
                        <option value="15">15 phút</option>
                        <option value="30">30 phút</option>
                        <option value="60">1 giờ</option>
                        <option value="120">2 giờ</option>
                        <option value="1440">1 ngày</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={addEvent}>Thêm</button>
                      <button
                        onClick={() => {
                          if ("Notification" in window)
                            Notification.requestPermission();
                        }}
                      >
                        Bật thông báo
                      </button>
                      <button
                        onClick={() => {
                          setEvents(loadEvents());
                          setQueue(loadQueue());
                        }}
                      >
                        Tải lại dữ liệu offline
                      </button>
                    </div>
                  </div>
                </fieldset>

                <fieldset
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <legend style={{ padding: "0 6px" }}>Sự kiện sắp tới</legend>
                  <div
                    style={{
                      maxHeight: 260,
                      overflow: "auto",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    {events
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(a.start).getTime() -
                          new Date(b.start).getTime()
                      )
                      .map((ev) => (
                        <div
                          key={ev.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            gap: 8,
                            borderBottom: "1px dashed #e5e7eb",
                            paddingBottom: 8,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: ev.color }}>
                              {ev.title}
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              {new Date(ev.start).toLocaleString()}
                            </div>
                            {ev.reminderMinutes ? (
                              <div style={{ fontSize: 12, color: "#6b7280" }}>
                                Nhắc trước: {ev.reminderMinutes} phút
                              </div>
                            ) : null}
                            {ev.notes ? (
                              <div style={{ fontSize: 12 }}>{ev.notes}</div>
                            ) : null}
                          </div>
                          <button onClick={() => deleteEvent(ev.id)}>
                            Xóa
                          </button>
                        </div>
                      ))}
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
