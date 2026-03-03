import { useState, useEffect } from "react";

// Reminder categories with icons, descriptions, and form fields
const REMINDER_CATEGORIES = [
    {
        id: "study",
        icon: "📚",
        label: "Study Reminders",
        color: "#4f46e5",
        description: "Set reminders for study sessions, exams, and assignments",
        fields: [{ key: "subject", label: "Subject / Topic", placeholder: "e.g. Maths Paper 1" }, { key: "time", label: "Reminder Time", type: "datetime-local" }, { key: "note", label: "Note (optional)", placeholder: "e.g. Focus on trigonometry" }],
    },
    {
        id: "pills",
        icon: "💊",
        label: "Pill / Medication",
        color: "#dc2626",
        description: "Never miss a dose — set daily pill reminders",
        fields: [{ key: "medication", label: "Medication name", placeholder: "e.g. PrEP, contraceptive" }, { key: "time", label: "Daily time", type: "time" }, { key: "note", label: "Notes", placeholder: "e.g. Take with food" }],
    },
    {
        id: "doctor",
        icon: "🏥",
        label: "Doctor Appointment",
        color: "#0891b2",
        description: "Track your upcoming medical appointments",
        fields: [{ key: "doctor", label: "Doctor / Clinic", placeholder: "e.g. Dr Mokoena at Bara Clinic" }, { key: "time", label: "Appointment date & time", type: "datetime-local" }, { key: "note", label: "Reason for visit", placeholder: "e.g. Annual check-up" }],
    },
    {
        id: "period",
        icon: "🌸",
        label: "Period Tracker",
        color: "#db2777",
        description: "Track your cycle and predict your next period",
        fields: [{ key: "lastPeriod", label: "Last period start date", type: "date" }, { key: "cycleLength", label: "Avg cycle length (days)", placeholder: "e.g. 28" }, { key: "note", label: "Notes", placeholder: "e.g. Irregular cycle" }],
    },
    {
        id: "pregnancy",
        icon: "🤱",
        label: "Pregnancy Tracker",
        color: "#7c3aed",
        description: "Track trimesters, milestones, and prenatal appointments",
        fields: [{ key: "dueDate", label: "Expected due date", type: "date" }, { key: "note", label: "Notes", placeholder: "e.g. Next scan at 20 weeks" }],
    },
    {
        id: "events",
        icon: "📅",
        label: "Educational Events",
        color: "#059669",
        description: "Events, workshops, and opportunities near you",
        fields: [{ key: "event", label: "Event name", placeholder: "e.g. NSFAS Info Day" }, { key: "time", label: "Event date & time", type: "datetime-local" }, { key: "location", label: "Location", placeholder: "e.g. Wits University, Johannesburg" }],
    },
    {
        id: "learnerships",
        icon: "🎓",
        label: "Learnerships & Internships",
        color: "#d97706",
        description: "Track applications and deadlines for learnerships",
        fields: [{ key: "company", label: "Company / Organisation", placeholder: "e.g. SETA Learnership" }, { key: "deadline", label: "Application deadline", type: "date" }, { key: "note", label: "Notes", placeholder: "e.g. Requires Grade 12 certificate" }],
    },
];

function getReminderKey(id) {
    return `threvia_reminders_${id}`;
}

function loadReminders(id) {
    try {
        return JSON.parse(localStorage.getItem(getReminderKey(id))) || [];
    } catch {
        return [];
    }
}

function saveReminders(id, reminders) {
    localStorage.setItem(getReminderKey(id), JSON.stringify(reminders));
}

// Calculate next period date
function getNextPeriod(lastPeriodStr, cycleLength) {
    if (!lastPeriodStr || !cycleLength) return null;
    const last = new Date(lastPeriodStr);
    const next = new Date(last.getTime() + Number(cycleLength) * 24 * 60 * 60 * 1000);
    return next.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

// Calculate pregnancy trimester
function getTrimester(dueDateStr) {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();
    const totalDays = 280; // ~40 weeks
    const daysLeft = Math.round((due - today) / (1000 * 60 * 60 * 24));
    const daysPregnant = totalDays - daysLeft;
    if (daysPregnant < 0) return { label: "Due date has passed", weeks: 0 };
    const weeks = Math.floor(daysPregnant / 7);
    const trimester = weeks < 13 ? "1st Trimester" : weeks < 27 ? "2nd Trimester" : "3rd Trimester";
    return { label: trimester, weeks, daysLeft: Math.max(0, daysLeft) };
}

function CategoryCard({ cat, onOpen }) {
    const reminders = loadReminders(cat.id);
    return (
        <div style={{ ...RC.card, borderColor: `${cat.color}33` }} onClick={() => onOpen(cat)}>
            <div style={{ ...RC.cardHeader, background: `${cat.color}18` }}>
                <span style={{ fontSize: 26 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                    <div style={RC.cardTitle}>{cat.label}</div>
                    <div style={RC.cardDesc}>{cat.description}</div>
                </div>
                <div style={{ ...RC.countBadge, background: `${cat.color}22`, color: cat.color }}>
                    {reminders.length}
                </div>
            </div>
        </div>
    );
}

function ReminderForm({ cat, onBack }) {
    const [reminders, setReminders] = useState(() => loadReminders(cat.id));
    const [form, setForm] = useState({});
    const [saved, setSaved] = useState(false);

    const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSave = () => {
        if (!Object.values(form).some((v) => v)) return;
        const updated = [...reminders, { ...form, id: Date.now(), createdAt: new Date().toISOString() }];
        setReminders(updated);
        saveReminders(cat.id, updated);
        setForm({});
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleDelete = (id) => {
        const updated = reminders.filter((r) => r.id !== id);
        setReminders(updated);
        saveReminders(cat.id, updated);
    };

    // Special: period tracker insight
    const periodInsight =
        cat.id === "period" && form.lastPeriod && form.cycleLength
            ? getNextPeriod(form.lastPeriod, form.cycleLength)
            : null;

    // Special: pregnancy trimester
    const trimesterInfo =
        cat.id === "pregnancy" && form.dueDate ? getTrimester(form.dueDate) : null;

    return (
        <div style={RC.formWrap}>
            <button style={RC.backBtn} onClick={onBack}>← Back</button>
            <div style={RC.formHeader}>
                <span style={{ fontSize: 28 }}>{cat.icon}</span>
                <div style={RC.formTitle}>{cat.label}</div>
            </div>

            {/* Form fields */}
            <div style={RC.form}>
                {cat.fields.map((f) => (
                    <div key={f.key} style={RC.fieldWrap}>
                        <label style={RC.label}>{f.label}</label>
                        <input
                            style={RC.input}
                            type={f.type || "text"}
                            placeholder={f.placeholder || ""}
                            value={form[f.key] || ""}
                            onChange={(e) => handleChange(f.key, e.target.value)}
                        />
                    </div>
                ))}

                {/* Smart insights */}
                {periodInsight && (
                    <div style={RC.insight}>
                        🌸 Next predicted period: <strong>{periodInsight}</strong>
                    </div>
                )}
                {trimesterInfo && (
                    <div style={RC.insight}>
                        🤱 {trimesterInfo.label} · Week {trimesterInfo.weeks} · {trimesterInfo.daysLeft} days until due date
                    </div>
                )}

                <button style={RC.saveBtn} onClick={handleSave}>
                    {saved ? "✅ Saved!" : "Save Reminder"}
                </button>
            </div>

            {/* Saved reminders list */}
            {reminders.length > 0 && (
                <div style={RC.list}>
                    <div style={RC.listTitle}>Saved Reminders</div>
                    {reminders.map((r) => (
                        <div key={r.id} style={RC.listItem}>
                            <div style={RC.listItemText}>
                                {Object.entries(r)
                                    .filter(([k]) => !["id", "createdAt"].includes(k))
                                    .map(([k, v]) => (
                                        <div key={k} style={RC.listField}><span style={RC.listKey}>{k}:</span> {v}</div>
                                    ))}
                            </div>
                            <button style={RC.deleteBtn} onClick={() => handleDelete(r.id)}>🗑️</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function RemindersModule() {
    const [activeCategory, setActiveCategory] = useState(null);
    const [showBotInfo, setShowBotInfo] = useState(false);

    if (activeCategory) {
        return <ReminderForm cat={activeCategory} onBack={() => setActiveCategory(null)} />;
    }

    return (
        <div style={RC.wrap}>
            {/* Header */}
            <div style={RC.pageHeader}>
                <div style={RC.pageTitle}>🔔 Reminders</div>
                <div style={RC.pageSubtitle}>Set local reminders & connect to our AI bot for phone notifications</div>
            </div>

            {/* Bot Connect Banner */}
            <div style={RC.botBanner} onClick={() => setShowBotInfo(!showBotInfo)}>
                <div style={RC.botLeft}>
                    <span style={{ fontSize: 26 }}>🤖</span>
                    <div>
                        <div style={RC.botTitle}>Connect Threvia AI Bot</div>
                        <div style={RC.botSub}>Get reminders on WhatsApp or Telegram</div>
                    </div>
                </div>
                <span style={{ color: "#00f5a0", fontSize: 16 }}>{showBotInfo ? "▲" : "▼"}</span>
            </div>

            {showBotInfo && (
                <div style={RC.botExpanded}>
                    <div style={RC.botFeatures}>
                        {["📚 Study & exam reminders", "💊 Daily pill & medication alerts", "🏥 Doctor appointment reminders", "🌸 Period & cycle tracking", "🤱 Pregnancy milestone updates", "📅 Educational events near you", "🎓 Learnership & internship deadlines"].map((f) => (
                            <div key={f} style={RC.botFeatureItem}>{f}</div>
                        ))}
                    </div>
                    <div style={RC.botBtns}>
                        <a
                            href="https://wa.me/27600000000?text=Hi+Threvia+Bot!+I+want+to+set+up+my+reminders"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...RC.botBtn, background: "#25D366" }}
                        >
                            📱 WhatsApp Bot
                        </a>
                        <a
                            href="https://t.me/ThreviaBot"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...RC.botBtn, background: "#2AABEE" }}
                        >
                            ✈️ Telegram Bot
                        </a>
                    </div>
                    <div style={RC.botNote}>
                        ⚠️ Demo: Bot integration coming soon. Numbers above are placeholders.
                    </div>
                </div>
            )}

            {/* Category Grid */}
            <div style={RC.grid}>
                {REMINDER_CATEGORIES.map((cat) => (
                    <CategoryCard key={cat.id} cat={cat} onOpen={setActiveCategory} />
                ))}
            </div>
        </div>
    );
}

const RC = {
    wrap: { flex: 1, overflowY: "auto", padding: "0 0 20px", scrollbarWidth: "thin", scrollbarColor: "rgba(0,245,160,0.12) transparent" },
    pageHeader: { padding: "14px 16px 6px" },
    pageTitle: { fontSize: 18, fontWeight: 700, color: "#e8f0fe", fontFamily: "'Space Mono',monospace" },
    pageSubtitle: { fontSize: 11, color: "rgba(232,240,254,0.38)", marginTop: 4, fontFamily: "'Sora',sans-serif" },

    botBanner: {
        margin: "10px 14px", padding: "14px 16px",
        background: "rgba(0,245,160,0.07)", border: "1px solid rgba(0,245,160,0.2)",
        borderRadius: 14, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    botLeft: { display: "flex", alignItems: "center", gap: 12 },
    botTitle: { fontSize: 13.5, fontWeight: 700, color: "#00f5a0", fontFamily: "'Sora',sans-serif" },
    botSub: { fontSize: 10.5, color: "rgba(232,240,254,0.4)", fontFamily: "'Sora',sans-serif" },
    botExpanded: {
        margin: "0 14px 10px", padding: "14px 16px",
        background: "rgba(0,245,160,0.04)", border: "1px solid rgba(0,245,160,0.12)",
        borderRadius: "0 0 14px 14px", borderTop: "none",
    },
    botFeatures: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 },
    botFeatureItem: { fontSize: 12, color: "rgba(232,240,254,0.6)", fontFamily: "'Sora',sans-serif" },
    botBtns: { display: "flex", gap: 10, marginBottom: 10 },
    botBtn: {
        flex: 1, padding: "10px", borderRadius: 10, border: "none",
        color: "#fff", fontWeight: 700, fontSize: 12.5, textAlign: "center",
        cursor: "pointer", textDecoration: "none", fontFamily: "'Sora',sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    },
    botNote: { fontSize: 9.5, color: "rgba(232,240,254,0.25)", textAlign: "center", fontFamily: "'Sora',sans-serif" },

    grid: { padding: "6px 14px", display: "flex", flexDirection: "column", gap: 10 },
    card: {
        borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.03)", overflow: "hidden", cursor: "pointer",
        transition: "all 0.2s",
    },
    cardHeader: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" },
    cardTitle: { fontSize: 13.5, fontWeight: 700, color: "#e8f0fe", fontFamily: "'Sora',sans-serif" },
    cardDesc: { fontSize: 10.5, color: "rgba(232,240,254,0.4)", marginTop: 2, fontFamily: "'Sora',sans-serif" },
    countBadge: { borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono',monospace" },

    formWrap: { flex: 1, overflowY: "auto", padding: "4px 0 20px", scrollbarWidth: "thin" },
    backBtn: {
        background: "none", border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(232,240,254,0.5)", padding: "7px 14px", borderRadius: 8,
        cursor: "pointer", fontSize: 12, margin: "10px 14px 6px",
        fontFamily: "'Sora',sans-serif",
    },
    formHeader: { display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 12px" },
    formTitle: { fontSize: 17, fontWeight: 700, color: "#e8f0fe", fontFamily: "'Space Mono',monospace" },
    form: { padding: "0 14px" },
    fieldWrap: { marginBottom: 12 },
    label: { display: "block", fontSize: 10.5, color: "rgba(232,240,254,0.5)", marginBottom: 5, letterSpacing: 0.5, fontFamily: "'Sora',sans-serif" },
    input: {
        width: "100%", background: "rgba(255,255,255,0.046)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "10px 12px", color: "#e8f0fe", fontSize: 13, outline: "none",
        fontFamily: "'Sora',sans-serif", boxSizing: "border-box",
        colorScheme: "dark",
    },
    insight: {
        background: "rgba(219,39,119,0.08)", border: "1px solid rgba(219,39,119,0.2)",
        borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#f9a8d4",
        marginBottom: 12, fontFamily: "'Sora',sans-serif",
    },
    saveBtn: {
        width: "100%", padding: "12px", borderRadius: 12,
        background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
        border: "none", color: "#06080f", fontWeight: 700, fontSize: 13.5,
        cursor: "pointer", fontFamily: "'Sora',sans-serif", marginTop: 4,
    },
    list: { margin: "16px 14px 0" },
    listTitle: { fontSize: 10, color: "rgba(232,240,254,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "'Sora',sans-serif" },
    listItem: {
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10, padding: "10px 12px", marginBottom: 8,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    },
    listItemText: { flex: 1 },
    listField: { fontSize: 11.5, color: "rgba(232,240,254,0.55)", marginBottom: 3, fontFamily: "'Sora',sans-serif" },
    listKey: { color: "rgba(232,240,254,0.28)", fontSize: 10, textTransform: "capitalize" },
    deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, marginLeft: 8, padding: "0 2px" },
};
