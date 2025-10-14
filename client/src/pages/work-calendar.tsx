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

// Ant Design
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
  Popconfirm,
} from "antd";
import { BellOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

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
  id: string; // client id
  serverId?: string | number;
  title: string;
  notes?: string;
  start: string; // ISO
  end?: string; // ISO
  allDay?: boolean;
  color?: string;
  reminderMinutes?: number;
  notifiedAt?: string | null;
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
 * UI constants
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

  // form state (AntD Form)
  const [form] = Form.useForm<{
    title: string;
    notes?: string;
    range?: [Dayjs, Dayjs];
    allDay?: boolean;
    color?: string;
    reminder?: number | "none";
  }>();

  const defaultStart = dayjs();
  const defaultEnd = dayjs().add(1, "hour");

  // modal xem nhanh
  const [viewing, setViewing] = useState<EventItem | null>(null);

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
          const pendingCreates = prev.filter((e) => !e.serverId);
          return [...merged, ...pendingCreates];
        });
      } catch {}
    },
    [events]
  );

  const flushQueue = useCallback(async () => {
    if (!navigator.onLine) return;
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
        rest.push(job);
      }
    }
    setQueue(rest);
  }, [queue]);

  useEffect(() => {
    const onOnline = () => flushQueue();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushQueue]);

  /** ============ CRUD local + enqueue ============ */
  const addEvent = useCallback(
    async (values: {
      title: string;
      notes?: string;
      range?: [Dayjs, Dayjs];
      allDay?: boolean;
      color?: string;
      reminder?: number | "none";
    }) => {
      const { title, notes, range, allDay, color, reminder } = values;
      if (!title?.trim() || !range) return;

      const [startD, endD] = range;
      const clientId = crypto.randomUUID();

      const startISO = allDay
        ? startD.startOf("day").utc().toISOString()
        : startD.utc().toISOString();
      const endISO = endD ? endD.utc().toISOString() : undefined;

      const newItem: EventItem = {
        id: clientId,
        title: title.trim(),
        notes: notes?.trim() || undefined,
        start: startISO,
        end: endISO,
        allDay,
        color: color || COLORS[0].value,
        reminderMinutes: reminder === "none" ? undefined : (reminder as number),
        notifiedAt: null,
      };
      setEvents((prev) => [...prev, newItem]);

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

      form.resetFields();
      form.setFieldsValue({
        color: COLORS[0].value,
        allDay: false,
        reminder: 15,
        range: [defaultStart, defaultEnd],
      });

      if (navigator.onLine) flushQueue();
      message.success("Đã thêm lịch");
    },
    [flushQueue, form]
  );

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
      message.success("Đã xóa");
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

  // Khi drag chọn trên lịch => set ngay khoảng thời gian vào Form (chọn ngày kết thúc ngay trên lịch)
  const handleSelect = useCallback(
    (selInfo: any) => {
      const start = dayjs(selInfo.start);
      // FullCalendar exclusive end => lùi 1 phút nếu cùng ngày để trực quan hơn
      const end = dayjs(selInfo.end);
      form.setFieldsValue({
        range: [start, end],
        allDay: selInfo.allDay,
      });
      message.info("Đã lấy mốc thời gian từ lịch vào form.");
    },
    [form]
  );

  const [initialFormSet, setInitialFormSet] = useState(false);
  useEffect(() => {
    if (!initialFormSet) {
      form.setFieldsValue({
        title: "",
        notes: "",
        range: [defaultStart, defaultEnd],
        allDay: false,
        color: COLORS[0].value,
        reminder: 15,
      });
      setInitialFormSet(true);
    }
  }, [form, initialFormSet]);

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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 16,
            }}
          >
            {/* Calendar */}
            <Card
              style={{ borderRadius: 12 }}
              bodyStyle={{ padding: 12 }}
              title={
                <Title level={5} style={{ margin: 0 }}>
                  Lịch công việc
                </Title>
              }
            >
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
                selectMirror
                longPressDelay={200}
                events={fcEvents}
                select={handleSelect}
                datesSet={(arg) => {
                  if (navigator.onLine) {
                    const fromISO = arg.start.toISOString();
                    const toISO = arg.end.toISOString();
                    syncFromServer(fromISO, toISO);
                  }
                }}
                eventClick={(info) => {
                  const ev = events.find((e) => e.id === info.event.id);
                  if (!ev) return;
                  setViewing(ev);
                }}
                dateClick={(info) => {
                  // single click => set start nhanh + end = +1h
                  const start = dayjs(info.date);
                  const end = start.add(1, "hour");
                  form.setFieldsValue({ range: [start, end], allDay: false });
                }}
              />
            </Card>

            {/* Sidebar Form + Upcoming */}
            <div style={{ display: "grid", gap: 16 }}>
              <Card
                style={{ borderRadius: 12 }}
                title={
                  <Space align="center">
                    <PlusOutlined />
                    <span>Thêm lịch / nhắc việc</span>
                  </Space>
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={addEvent}
                  requiredMark={false}
                >
                  <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[{ required: true, message: "Nhập tiêu đề" }]}
                  >
                    <Input placeholder="Ví dụ: Họp team" />
                  </Form.Item>

                  <Form.Item label="Ghi chú" name="notes">
                    <Input.TextArea
                      rows={3}
                      placeholder="Nội dung, link họp…"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Thời gian (chọn trực tiếp trên lịch để điền nhanh)"
                    name="range"
                    rules={[{ required: true, message: "Chọn thời gian" }]}
                  >
                    <RangePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Space size="middle" style={{ width: "100%" }} wrap>
                    <Form.Item
                      name="allDay"
                      label="Cả ngày"
                      valuePropName="checked"
                    >
                      <Select
                        options={[
                          { label: "Không", value: false },
                          { label: "Có", value: true },
                        ]}
                        style={{ width: 120 }}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Màu"
                      name="color"
                      initialValue={COLORS[0].value}
                    >
                      <Select
                        style={{ width: 160 }}
                        options={COLORS.map((c) => ({
                          label: (
                            <Space>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 12,
                                  height: 12,
                                  borderRadius: 12,
                                  background: c.value,
                                }}
                              />
                              {c.label}
                            </Space>
                          ),
                          value: c.value,
                        }))}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Nhắc trước"
                      name="reminder"
                      initialValue={15}
                    >
                      <Select
                        style={{ width: 140 }}
                        options={[
                          { label: "Không nhắc", value: "none" },
                          { label: "5 phút", value: 5 },
                          { label: "10 phút", value: 10 },
                          { label: "15 phút", value: 15 },
                          { label: "30 phút", value: 30 },
                          { label: "1 giờ", value: 60 },
                          { label: "2 giờ", value: 120 },
                          { label: "1 ngày", value: 1440 },
                        ]}
                      />
                    </Form.Item>
                  </Space>

                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<PlusOutlined />}
                    >
                      Thêm
                    </Button>
                    <Button
                      icon={<BellOutlined />}
                      onClick={() => {
                        if ("Notification" in window)
                          Notification.requestPermission();
                      }}
                    >
                      Bật thông báo
                    </Button>
                    {/* <Button
                      onClick={() => {
                        setEvents(loadEvents());
                        setQueue(loadQueue());
                        message.success("Đã tải lại dữ liệu offline");
                      }}
                    >
                      Tải dữ liệu offline
                    </Button> */}
                  </Space>
                </Form>
              </Card>

              <Card
                style={{ borderRadius: 12 }}
                title="Sự kiện sắp tới"
                extra={<Text type="secondary">Sắp xếp theo thời gian</Text>}
              >
                <List
                  dataSource={[...events].sort(
                    (a, b) =>
                      new Date(a.start).getTime() - new Date(b.start).getTime()
                  )}
                  renderItem={(ev) => (
                    <List.Item
                      actions={[
                        <Popconfirm
                          title="Xóa sự kiện?"
                          okText="Xóa"
                          cancelText="Hủy"
                          onConfirm={() => deleteEvent(ev.id)}
                          key="del"
                        >
                          <Button size="small" danger icon={<DeleteOutlined />}>
                            Xóa
                          </Button>
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <span style={{ fontWeight: 600, color: ev.color }}>
                              {ev.title}
                            </span>
                            {ev.reminderMinutes ? (
                              <Tag icon={<BellOutlined />}>
                                {ev.reminderMinutes}’
                              </Tag>
                            ) : null}
                          </Space>
                        }
                        description={
                          <div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              {dayjs(ev.start).format("DD/MM/YYYY HH:mm")}
                              {ev.end
                                ? ` → ${dayjs(ev.end).format(
                                    "DD/MM/YYYY HH:mm"
                                  )}`
                                : ""}
                              {ev.allDay ? " (Cả ngày)" : ""}
                            </div>
                            {ev.notes ? (
                              <div style={{ fontSize: 12 }}>{ev.notes}</div>
                            ) : null}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Modal xem nhanh sự kiện */}
      <Modal
        open={!!viewing}
        onCancel={() => setViewing(null)}
        title="Chi tiết sự kiện"
        footer={
          <Space>
            {viewing?.serverId ? (
              <Text type="secondary">
                Server ID: {String(viewing?.serverId)}
              </Text>
            ) : (
              <Tag color="blue">Pending Sync</Tag>
            )}
            <Button onClick={() => setViewing(null)}>Đóng</Button>
            <Popconfirm
              title="Xóa sự kiện?"
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => {
                if (viewing) deleteEvent(viewing.id);
                setViewing(null);
              }}
            >
              <Button danger>Xóa</Button>
            </Popconfirm>
          </Space>
        }
      >
        {viewing && (
          <div>
            <Title level={5} style={{ marginTop: 0 }}>
              {viewing.title}
            </Title>
            <Divider style={{ margin: "8px 0" }} />
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <Text>
                <b>Thời gian:</b>{" "}
                {dayjs(viewing.start).format("DD/MM/YYYY HH:mm")}
                {viewing.end
                  ? ` → ${dayjs(viewing.end).format("DD/MM/YYYY HH:mm")}`
                  : ""}
                {viewing.allDay ? " (Cả ngày)" : ""}
              </Text>
              {viewing.notes && (
                <Text>
                  <b>Ghi chú:</b> {viewing.notes}
                </Text>
              )}
              <Space align="center">
                <Text>
                  <b>Màu:</b>
                </Text>
                <span
                  style={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    borderRadius: 12,
                    background: viewing.color,
                  }}
                />
              </Space>
              <Text>
                <b>Nhắc trước:</b>{" "}
                {viewing.reminderMinutes
                  ? `${viewing.reminderMinutes} phút`
                  : "Không"}
              </Text>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
