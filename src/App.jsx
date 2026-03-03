import { useEffect, useRef, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { LoginForm } from "./Login";
import { RegisterForm } from "./Register";
import { AdminDashboard } from "./AdminDashboard";
import { DataPurchase } from "./DataPurchase";
import DocumentStorage from "./DocumentStorage";

const SESSION_DURATION = 25 * 60;
const INITIAL_AD_DURATION = 30;
const AD_BREAK_DURATION = 30;
const AD_BREAK_INTERVAL = 5 * 60;
const AD_BREAK_POINTS = 40;
const POINTS_PER_BUCK = 10;
const PREMIUM_MODULE_UNLOCK_BUCKS = 30;
const FULL_BROWSER_UNLOCK_BUCKS = 25;

const SPONSORS = [
  {
    id: "vodacom",
    name: "Vodacom",
    tagline: "Connecting South Africa",
    color: "#E60000",
    logo: "📡",
    category: "Telecom",
    adText:
      "Demo sponsor video: Vodacom-powered learning and health access for youth.",
    cta: "Learn More",
    videos: ["M7lc1UVf-VE", "ysz5S6PUM-U"],
  },
  {
    id: "capitec",
    name: "Capitec Bank",
    tagline: "Banking made simple",
    color: "#004A96",
    logo: "🏦",
    category: "Finance",
    adText:
      "Demo sponsor video: Capitec supports safer digital access and growth.",
    cta: "Explore",
    videos: ["aqz-KE-bpKQ", "ScMzIvxBSi4"],
  },
  {
    id: "nsfas",
    name: "NSFAS",
    tagline: "Funding your future",
    color: "#2D8A4E",
    logo: "🎓",
    category: "Education",
    adText:
      "Demo sponsor video: NSFAS helps students unlock education opportunities.",
    cta: "Apply",
    videos: ["jNQXAC9IVRw", "M7lc1UVf-VE"],
  },
  {
    id: "doh",
    name: "Dept of Health",
    tagline: "Your health, our priority",
    color: "#8B2020",
    logo: "❤️",
    category: "Health",
    adText:
      "Demo sponsor video: National health support and youth-friendly services.",
    cta: "Find Care",
    videos: ["ScMzIvxBSi4", "aqz-KE-bpKQ"],
  },
  {
    id: "mtn",
    name: "MTN",
    tagline: "Everywhere you go",
    color: "#CC9900",
    logo: "📶",
    category: "Telecom",
    adText:
      "Demo sponsor video: MTN-backed connectivity for essential digital access.",
    cta: "Get Started",
    videos: ["ysz5S6PUM-U", "jNQXAC9IVRw"],
  },
];

const FREE_MODE_ALLOWED_DOMAINS = [
  "who.int",
  "unicef.org",
  "health.gov.za",
  "nsfas.org.za",
  "sayouth.mobi",
  "khanacademy.org",
  "coursera.org",
  "wikipedia.org",
  "scholar.google.com",
  "openstreetmap.org",
  "maps.google.com",
  "google.com/maps",
];

const FREE_MODE_MODULES = new Set([
  "chat",
  "sexual",
  "mental",
  "skills",
  "map",
  "browser",
  "data",
  "agent",
]);

const PREMIUM_MODULES = new Set(["documents", "support"]);

const SYSTEM_PROMPT = `You are the Threvia Intelligence Engine.
Keep responses short, warm, practical, and youth-safe.
Allowed free-mode focus: education, health, research, maps.
Do not provide explicit adult content. Provide crisis resources when needed.
Crisis (South Africa): Lifeline 0861 322 322, SMS 31393.`;

const MODULES = [
  { id: "chat", icon: "💬", label: "Threvia" },
  { id: "sexual", icon: "🌿", label: "Sexual Health" },
  { id: "mental", icon: "🧠", label: "Mind & Mood" },
  { id: "skills", icon: "🎓", label: "Skills Hub" },
  { id: "map", icon: "📍", label: "Help Map" },
  { id: "browser", icon: "🌐", label: "Browser" },
  { id: "agent", icon: "🤖", label: "AI Agent" },
  { id: "documents", icon: "📚", label: "My Docs" },
  { id: "data", icon: "📊", label: "Buy Data" },
  { id: "support", icon: "💳", label: "Support" },
];

const QUICK_PROMPTS = {
  sexual: [
    "How do I track my period?",
    "What is PrEP?",
    "Where can I get free condoms?",
    "Signs of an STI?",
  ],
  mental: [
    "I'm really stressed out",
    "Give me a daily motivation",
    "How do I handle exam anxiety?",
    "I need to talk to someone",
  ],
  skills: [
    "Help me write a CV",
    "What bursaries exist in SA?",
    "Study tips for matric",
    "Job interview prep",
  ],
  map: [
    "Find a clinic near me",
    "Nearest youth center?",
    "Free HIV testing",
    "Mental health services nearby",
  ],
};

const BOOKMARKS = [
  { label: "WHO Health", url: "https://www.who.int", icon: "🏥" },
  { label: "UNICEF SA", url: "https://www.unicef.org/southafrica", icon: "🌍" },
  { label: "NSFAS", url: "https://www.nsfas.org.za", icon: "🎓" },
  { label: "SA Youth", url: "https://www.sayouth.mobi", icon: "💼" },
  { label: "Health ZA", url: "https://www.health.gov.za", icon: "💊" },
  { label: "OpenStreetMap", url: "https://www.openstreetmap.org", icon: "🗺️" },
];

const AGENT_TEMPLATES = [
  "Study reminder",
  "Take pills",
  "Next doctor appointment",
  "Period tracking check-in",
  "Pregnancy trimester check",
  "Educational events near me",
  "Learnership and internship check",
];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickRandomSponsor(excludeId) {
  const pool = excludeId
    ? SPONSORS.filter((s) => s.id !== excludeId)
    : SPONSORS;
  const sponsor = randomFrom(pool.length ? pool : SPONSORS);
  return {
    ...sponsor,
    videoId: randomFrom(sponsor.videos),
  };
}

function toYoutubeEmbed(videoId) {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`;
}

function normalizeUrl(raw) {
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isAllowedFreeModeUrl(raw) {
  try {
    const value = normalizeUrl(raw);
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    return FREE_MODE_ALLOWED_DOMAINS.some((domain) => {
      if (domain.includes("/")) {
        return value.includes(domain);
      }
      return host === domain || host.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
}

function RandomAdGate({ onContinue }) {
  const [selectedAd, setSelectedAd] = useState(() => pickRandomSponsor());

  return (
    <div style={S.screen}>
      <div style={S.wifiBadge}>📶 THREVIA FREE MODE</div>
      <div style={S.heroTitle}>
        First ad is <span style={{ color: "#00f5a0" }}>randomized</span> after login.
      </div>
      <div style={S.heroSub}>
        You must watch the full ad to unlock your free 25-minute browsing session.
      </div>

      <div style={{ ...S.card, border: `2px solid ${selectedAd.color}` }}>
        <div style={S.cardLogo}>{selectedAd.logo}</div>
        <div style={S.cardName}>{selectedAd.name}</div>
        <div style={S.cardCat}>{selectedAd.category}</div>
        <div style={{ ...S.timePill, background: selectedAd.color }}>
          {INITIAL_AD_DURATION}s
        </div>
      </div>

      <button
        style={S.ctaBtn}
        onClick={() => {
          onContinue(selectedAd);
          setSelectedAd(pickRandomSponsor(selectedAd.id));
        }}
      >
        Watch Random Ad & Unlock Free Mode →
      </button>

      <div style={S.legal}>
        Free mode allows health, education, research, and maps.
      </div>
      <style>{globalCss}</style>
    </div>
  );
}

function AdPlayer({ sponsor, duration, onDone, pointsReward = 0, mode = "initial" }) {
  const [secondsLeft, setSecondsLeft] = useState(duration);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const done = secondsLeft <= 0;
  const pct = ((duration - Math.max(secondsLeft, 0)) / duration) * 100;

  return (
    <div
      style={{
        ...A.screen,
        background: `linear-gradient(160deg,#06080f,${sponsor.color}20)`,
      }}
    >
      <div style={A.card}>
        <div style={{ ...A.banner, background: sponsor.color }}>
          <span style={{ fontSize: 30 }}>{sponsor.logo}</span>
          <div style={{ flex: 1 }}>
            <div style={A.bannerName}>{sponsor.name}</div>
            <div style={A.bannerTag}>{sponsor.tagline}</div>
          </div>
          <div style={A.adBadge}>AD</div>
        </div>

        <div style={A.videoWrap}>
          <iframe
            src={toYoutubeEmbed(sponsor.videoId)}
            title={`Sponsored video ${sponsor.name}`}
            style={A.videoFrame}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div style={A.body}>
          <p style={A.adText}>{sponsor.adText}</p>
          <button style={{ ...A.adCta, background: sponsor.color }}>{sponsor.cta} ↗</button>
        </div>

        <div style={A.progWrap}>
          <div style={A.progTrack}>
            <div style={{ ...A.progFill, width: `${pct}%`, background: sponsor.color }} />
          </div>
          <div style={A.progLbl}>
            {done ? "✅ Ad complete" : `${secondsLeft}s remaining`}
          </div>
        </div>
      </div>

      <div style={A.reward}>
        <span style={{ fontSize: 34 }}>{mode === "break" ? "🎯" : "⏱️"}</span>
        <div>
          <div style={A.rewardLbl}>{mode === "break" ? "Ad break reward" : "Unlocking"}</div>
          <div style={A.rewardVal}>
            {mode === "break"
              ? `+${pointsReward} points after full 30s ad`
              : "25 Minutes Free Mode"}
          </div>
        </div>
      </div>

      {done ? (
        <button style={A.unlockBtn} onClick={onDone}>
          {mode === "break" ? "Continue Session →" : "Unlock My Session →"}
        </button>
      ) : (
        <div style={A.waitMsg}>This ad is mandatory and cannot be skipped.</div>
      )}

      <div style={A.powered}>Powered by Threvia · YouTube videos are demo placeholders</div>
    </div>
  );
}

function AgentModule({ user, onEarnPoints, onToast }) {
  const storageKey = `threviaReminders_${user?.id || "guest"}`;
  const noteKey = `threviaNotes_${user?.id || "guest"}`;

  const [template, setTemplate] = useState(AGENT_TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState("");
  const [when, setWhen] = useState("");
  const [channel, setChannel] = useState("in-app");
  const [reminders, setReminders] = useState([]);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const savedReminders = localStorage.getItem(storageKey);
    const savedNotes = localStorage.getItem(noteKey);
    if (savedReminders) setReminders(JSON.parse(savedReminders));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, [storageKey, noteKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(reminders));
  }, [storageKey, reminders]);

  useEffect(() => {
    localStorage.setItem(noteKey, JSON.stringify(notes));
  }, [noteKey, notes]);

  const finalMessage = customMessage.trim() || template;

  const addReminder = () => {
    if (!finalMessage || !when) {
      onToast("Add a message and date/time for the reminder.");
      return;
    }

    const item = {
      id: Date.now(),
      message: finalMessage,
      when,
      channel,
      createdAt: new Date().toISOString(),
    };

    setReminders((prev) => [item, ...prev]);
    setCustomMessage("");
    setWhen("");
    onEarnPoints(20);
    onToast("Reminder saved. +20 points");
  };

  const addNote = () => {
    if (!note.trim()) return;
    setNotes((prev) => [
      {
        id: Date.now(),
        text: note.trim(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setNote("");
    onEarnPoints(10);
    onToast("Note saved to your AI memory. +10 points");
  };

  const buildShareUrl = (item) => {
    const msg = encodeURIComponent(
      `[Threvia Reminder]\n${item.message}\nWhen: ${new Date(item.when).toLocaleString()}`
    );

    if (item.channel === "whatsapp") {
      return `https://wa.me/?text=${msg}`;
    }

    if (item.channel === "telegram") {
      return `https://t.me/share/url?url=https://threvia.app&text=${msg}`;
    }

    return "";
  };

  const removeReminder = (id) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div style={G.wrap}>
      <div style={G.card}>
        <h3 style={G.title}>🤖 AI Agent: Reminders + Saved Info</h3>
        <p style={G.sub}>
          Save health/study info and create reminders for WhatsApp, Telegram, or in-app.
        </p>

        <div style={G.grid}>
          <select
            style={G.input}
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {AGENT_TEMPLATES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            style={G.input}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Custom reminder message"
          />
          <input
            style={G.input}
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
          <select
            style={G.input}
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="in-app">In-App</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>

        <button style={G.btnPrimary} onClick={addReminder}>
          Save Reminder
        </button>
      </div>

      <div style={G.card}>
        <h3 style={G.title}>🧾 Save Notes</h3>
        <div style={G.row}>
          <input
            style={G.input}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Save study plans, meds, clinic info, internship links..."
          />
          <button style={G.btnSecondary} onClick={addNote}>
            Save
          </button>
        </div>

        <div style={G.list}>
          {notes.length === 0 ? (
            <div style={G.empty}>No notes yet.</div>
          ) : (
            notes.slice(0, 6).map((item) => (
              <div key={item.id} style={G.listItem}>
                <div style={G.itemText}>{item.text}</div>
                <div style={G.itemMeta}>{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={G.card}>
        <h3 style={G.title}>📅 Reminder Queue</h3>
        <div style={G.list}>
          {reminders.length === 0 ? (
            <div style={G.empty}>No reminders yet.</div>
          ) : (
            reminders.slice(0, 8).map((item) => {
              const shareUrl = buildShareUrl(item);
              return (
                <div key={item.id} style={G.listItem}>
                  <div style={G.itemText}>{item.message}</div>
                  <div style={G.itemMeta}>
                    {new Date(item.when).toLocaleString()} • {item.channel}
                  </div>
                  <div style={G.actionRow}>
                    {shareUrl ? (
                      <a href={shareUrl} target="_blank" rel="noreferrer" style={G.linkBtn}>
                        Open {item.channel === "whatsapp" ? "WhatsApp" : "Telegram"}
                      </a>
                    ) : (
                      <span style={G.inAppBadge}>In-app reminder</span>
                    )}
                    <button style={G.deleteBtn} onClick={() => removeReminder(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={G.card}>
        <h3 style={G.title}>📍 Opportunity Feed (Demo)</h3>
        <div style={G.resources}>
          <a href="https://www.sayouth.mobi" target="_blank" rel="noreferrer" style={G.resourceLink}>
            SA Youth: learnerships & internships
          </a>
          <a href="https://www.nsfas.org.za" target="_blank" rel="noreferrer" style={G.resourceLink}>
            NSFAS: education funding
          </a>
          <a href="https://www.health.gov.za" target="_blank" rel="noreferrer" style={G.resourceLink}>
            Department of Health services
          </a>
        </div>
      </div>
    </div>
  );
}

function MainApp({ sponsor, user, onLogout }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [expired, setExpired] = useState(false);
  const [module, setModule] = useState("chat");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Session unlocked! Thanks to ${sponsor.name}, you have 25 minutes of free mode for health, education, research, and map usage.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [points, setPoints] = useState(0);
  const [bucks, setBucks] = useState(0);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [browserUrl, setBrowserUrl] = useState("");
  const [browserInput, setBrowserInput] = useState("https://");
  const [blockedUrl, setBlockedUrl] = useState("");
  const [browserUnlocked, setBrowserUnlocked] = useState(false);

  const [unlockedModules, setUnlockedModules] = useState({});
  const [nextAdBreakAt, setNextAdBreakAt] = useState(SESSION_DURATION - AD_BREAK_INTERVAL);
  const [adBreak, setAdBreak] = useState(null);

  const chatEnd = useRef(null);
  const lastAdSponsor = useRef(sponsor.id);

  useEffect(() => {
    if (expired || adBreak) return;
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, expired, adBreak]);

  useEffect(() => {
    if (expired || adBreak || nextAdBreakAt <= 0 || timeLeft <= 0) return;

    if (timeLeft <= nextAdBreakAt) {
      const chosen = pickRandomSponsor(lastAdSponsor.current);
      lastAdSponsor.current = chosen.id;
      setAdBreak(chosen);
      setNextAdBreakAt((prev) => prev - AD_BREAK_INTERVAL);
    }
  }, [timeLeft, nextAdBreakAt, adBreak, expired]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const earnPoints = (amount) => {
    setPoints((prev) => prev + amount);
    showToast(`+${amount} points earned`);
  };

  const convertPointsToBucks = () => {
    const canConvert = Math.floor(points / POINTS_PER_BUCK);
    if (canConvert < 1) {
      showToast(`Need at least ${POINTS_PER_BUCK} points to convert.`);
      return;
    }

    setPoints((prev) => prev - canConvert * POINTS_PER_BUCK);
    setBucks((prev) => prev + canConvert);
    showToast(`Converted ${canConvert * POINTS_PER_BUCK} points → ${canConvert} ThreviaBucks`);
  };

  const handleAdBreakDone = () => {
    setAdBreak(null);
    earnPoints(AD_BREAK_POINTS);
  };

  const switchModule = (id) => {
    if (PREMIUM_MODULES.has(id) && !unlockedModules[id]) {
      if (bucks < PREMIUM_MODULE_UNLOCK_BUCKS) {
        showToast(`Need ${PREMIUM_MODULE_UNLOCK_BUCKS} Bucks to unlock ${id}.`);
        return;
      }

      setBucks((prev) => prev - PREMIUM_MODULE_UNLOCK_BUCKS);
      setUnlockedModules((prev) => ({ ...prev, [id]: true }));
      showToast(`${id} unlocked for this session.`);
    }

    setModule(id);

    if (id === "chat" || id === "browser" || id === "data" || id === "agent") {
      return;
    }

    const intros = {
      sexual:
        "Sexual Health 🌿 Everything here is anonymous and educational. What would you like to know?",
      mental: "Mind & Mood 🧠 Safe support space. How are you feeling right now?",
      skills:
        "Skills Hub 🎓 Let's focus on bursaries, CVs, study planning, and career prep.",
      map: "Help Map 📍 Share your area and I can help find nearby clinics and youth services.",
      documents:
        "My Documents unlocked. Store your study/health documents securely on this device.",
      support: "Support module unlocked. You can fund and sustain the free-mode program here.",
    };

    if (intros[id]) {
      setMessages([{ role: "assistant", content: intros[id] }]);
      earnPoints(10);
    }
  };

  const openBrowserUrl = (rawValue) => {
    const value = normalizeUrl(rawValue.trim());
    if (!value) return;

    const allowedInFreeMode = isAllowedFreeModeUrl(value);

    if (!browserUnlocked && !allowedInFreeMode) {
      setBlockedUrl(value);
      setBrowserUrl("");
      showToast(
        "Free mode is limited to health, education, research, and map websites."
      );
      return;
    }

    setBlockedUrl("");
    setBrowserUrl(value);

    if (allowedInFreeMode) {
      earnPoints(5);
    }
  };

  const unlockBrowser = () => {
    if (browserUnlocked) {
      showToast("Full browser access already unlocked.");
      return;
    }

    if (bucks < FULL_BROWSER_UNLOCK_BUCKS) {
      showToast(`Need ${FULL_BROWSER_UNLOCK_BUCKS} Bucks for full browser unlock.`);
      return;
    }

    setBucks((prev) => prev - FULL_BROWSER_UNLOCK_BUCKS);
    setBrowserUnlocked(true);
    showToast("Full browser access unlocked for this session.");

    if (blockedUrl) {
      setBrowserUrl(blockedUrl);
      setBlockedUrl("");
    }
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setInput("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);

    const kw = [
      "health",
      "sex",
      "period",
      "mental",
      "stress",
      "hiv",
      "sti",
      "condom",
      "clinic",
      "cv",
      "bursary",
      "study",
      "anxiety",
      "consent",
      "prep",
      "pregnancy",
      "internship",
      "learnership",
    ];

    if (kw.some((k) => msg.toLowerCase().includes(k))) {
      setTimeout(() => earnPoints(15), 600);
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.content?.[0]?.text ||
            "I could not reach the assistant API just now. Try again in a moment.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection issue. For now I can still help with reminders, notes, and curated resources in free mode.",
        },
      ]);
    }

    setLoading(false);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const timePct = (timeLeft / SESSION_DURATION) * 100;
  const timerColor = timePct > 25 ? "#00f5a0" : timePct > 10 ? "#ffc107" : "#ff4444";

  if (expired) {
    return (
      <div style={E.screen}>
        <div style={{ fontSize: 64 }}>⏰</div>
        <div style={E.title}>Session Ended</div>
        <div style={E.sub}>Your 25-minute free mode session has expired.</div>

        <div style={E.bucksBox}>
          <div style={E.bucksNum}>{points}</div>
          <div style={E.bucksLbl}>Points earned</div>
        </div>

        <div style={E.bucksBox}>
          <div style={E.bucksNum}>{bucks}</div>
          <div style={E.bucksLbl}>ThreviaBucks balance</div>
        </div>

        <div style={E.tip}>Login again and watch a new random ad to unlock another 25 minutes.</div>
        <button style={E.newBtn} onClick={() => window.location.reload()}>
          Start New Session →
        </button>

        <style>{globalCss}</style>
      </div>
    );
  }

  return (
    <div style={M.wrap}>
      <div style={M.timerBar}>
        <div style={M.timerLeft}>
          <div style={{ ...M.dot, background: timerColor }} />
          <div>
            <div style={{ ...M.time, color: timerColor }}>
              {mins}:{secs}
            </div>
            <div style={M.timeLbl}>session left</div>
          </div>
        </div>

        <div style={M.sponsorChip}>
          <span>{sponsor.logo}</span>
          <span style={{ fontSize: 11, color: "rgba(232,240,254,0.5)" }}>{sponsor.name}</span>
        </div>

        <div style={M.metricChip} onClick={() => setShowRewardsModal(true)}>
          <span style={M.metricNum}>{points}</span>
          <span style={M.metricLbl}>Points</span>
        </div>

        <div style={M.metricChip} onClick={() => setShowRewardsModal(true)}>
          <span style={M.metricNum}>{bucks}</span>
          <span style={M.metricLbl}>Bucks</span>
        </div>

        <div style={{ ...M.metricChip, background: "rgba(0,217,245,0.12)" }}>
          <span style={{ fontSize: 12 }}>{user?.name?.split(" ")[0] || "User"}</span>
          <button
            onClick={onLogout}
            title="Logout"
            style={M.logoutBtn}
          >
            🚪
          </button>
        </div>
      </div>

      <div style={M.strip}>
        <div style={{ ...M.stripFill, width: `${timePct}%`, background: timerColor }} />
      </div>

      {toast && <div style={M.toast}>{toast}</div>}

      <div style={M.nav}>
        {MODULES.map((item) => {
          const locked = PREMIUM_MODULES.has(item.id) && !unlockedModules[item.id];
          const showAsLocked = locked && !FREE_MODE_MODULES.has(item.id);

          return (
            <button
              key={item.id}
              onClick={() => switchModule(item.id)}
              style={{
                ...M.navBtn,
                ...(module === item.id ? M.navBtnOn : {}),
                ...(showAsLocked ? M.navBtnLocked : {}),
              }}
            >
              <span style={{ fontSize: 15 }}>
                {item.icon} {showAsLocked ? "🔒" : ""}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600 }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {module === "browser" ? (
        <div style={Br.wrap}>
          <div style={Br.urlRow}>
            <input
              style={Br.urlIn}
              value={browserInput}
              onChange={(e) => setBrowserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && openBrowserUrl(browserInput)}
              placeholder="Enter URL..."
            />
            <button style={Br.go} onClick={() => openBrowserUrl(browserInput)}>
              Go
            </button>
          </div>

          <div style={Br.bmarks}>
            {BOOKMARKS.map((b) => (
              <button
                key={b.url}
                style={Br.bmark}
                onClick={() => {
                  setBrowserInput(b.url);
                  openBrowserUrl(b.url);
                }}
              >
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                <span style={Br.bmarkText}>{b.label}</span>
              </button>
            ))}
          </div>

          {blockedUrl && !browserUnlocked && (
            <div style={Br.lockCard}>
              <div style={Br.lockTitle}>🔒 Restricted in Free Mode</div>
              <div style={Br.lockText}>
                Free mode is strictly for educational, health, research, and map access.
              </div>
              <div style={Br.lockText}>Blocked URL: {blockedUrl}</div>
              <button style={Br.unlockBtn} onClick={unlockBrowser}>
                Unlock full browser for {FULL_BROWSER_UNLOCK_BUCKS} Bucks
              </button>
            </div>
          )}

          {browserUrl ? (
            <iframe
              src={browserUrl}
              style={Br.frame}
              title="browser"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          ) : (
            <div style={Br.ph}>
              <div style={{ fontSize: 50 }}>🌐</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(232,240,254,0.52)" }}>
                Free-Mode Browser
              </div>
              <div style={Br.phText}>
                Health, education, research, and maps are open by default. Earn points, convert to Bucks,
                and unlock wider browsing.
              </div>
            </div>
          )}
        </div>
      ) : module === "documents" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          <DocumentStorage user={user} />
        </div>
      ) : module === "data" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          <DataPurchase
            userAddress={user?.address}
            userBucks={bucks}
            onPurchaseComplete={(data) => {
              showToast(`✅ ${data.package.dataSize} activated!`);
              if (data.paymentMethod === "bucks") {
                setBucks((prev) => Math.max(0, prev - data.bucksSpent));
              }
            }}
          />
        </div>
      ) : module === "agent" ? (
        <div style={{ flex: 1, overflow: "auto" }}>
          <AgentModule user={user} onEarnPoints={earnPoints} onToast={showToast} />
        </div>
      ) : module === "support" ? (
        <div style={P.wrap}>
          <div style={P.card}>
            <h3 style={P.title}>Support Threvia Free Mode</h3>
            <p style={P.text}>
              This module is unlocked and ready for Base Pay integrations in the next iteration.
            </p>
            <p style={P.text}>You can currently use Buy Data and AI Agent features in this demo.</p>
          </div>
        </div>
      ) : (
        <>
          {module !== "chat" && QUICK_PROMPTS[module] && (
            <div style={M.qrow}>
              {QUICK_PROMPTS[module].map((q) => (
                <button key={q} style={M.qbtn} onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
          )}

          <div style={M.chat}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{ ...M.row, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                {msg.role === "assistant" && <div style={M.avatar}>T</div>}
                <div style={{ ...M.bubble, ...(msg.role === "user" ? M.uBubble : M.aBubble) }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ ...M.row, justifyContent: "flex-start" }}>
                <div style={M.avatar}>T</div>
                <div style={{ ...M.bubble, ...M.aBubble }}>Thinking...</div>
              </div>
            )}

            <div ref={chatEnd} />
          </div>

          <div style={M.inputRow}>
            <input
              style={M.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about health, studies, careers, or local services..."
            />
            <button style={M.send} onClick={() => send()}>
              ➤
            </button>
          </div>
        </>
      )}

      <div style={M.footer}>🔒 POPIA-aligned demo · Free mode first · Youth-safe guidance</div>

      {showRewardsModal && (
        <div style={Mo.overlay} onClick={() => setShowRewardsModal(false)}>
          <div style={Mo.box} onClick={(e) => e.stopPropagation()}>
            <div style={Mo.title}>💰 Points & ThreviaBucks</div>
            <div style={Mo.rowStat}>
              <span>Points</span>
              <span style={Mo.bigNum}>{points}</span>
            </div>
            <div style={Mo.rowStat}>
              <span>ThreviaBucks</span>
              <span style={Mo.bigNum}>{bucks}</span>
            </div>

            <button style={Mo.convertBtn} onClick={convertPointsToBucks}>
              Convert points to Bucks ({POINTS_PER_BUCK} pts = 1 Buck)
            </button>

            <div style={Mo.subHd}>How to earn points</div>
            {["Watch mandatory ad breaks (+40)", "Health/education engagement (+15)", "Save reminders/notes (+20/+10)", "Use approved resources (+5)"].map((line) => (
              <div key={line} style={Mo.ruleRow}>
                {line}
              </div>
            ))}

            <button style={Mo.close} onClick={() => setShowRewardsModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {adBreak && (
        <div style={AD.overlay}>
          <AdPlayer
            sponsor={adBreak}
            duration={AD_BREAK_DURATION}
            onDone={handleAdBreakDone}
            pointsReward={AD_BREAK_POINTS}
            mode="break"
          />
        </div>
      )}

      <style>{globalCss}</style>
    </div>
  );
}

export default function Threvia() {
  const [stage, setStage] = useState("login");
  const [authMode, setAuthMode] = useState("login");
  const [sessionSponsor, setSessionSponsor] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    sdk.actions.ready();

    const storedUser = localStorage.getItem("threviaCurrentUser");
    if (!storedUser) return;

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      if (userData.email === "admin@threvia.app") {
        setStage("admin");
      } else {
        setStage("gate");
      }
    } catch {
      setStage("login");
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.email === "admin@threvia.app") {
      setStage("admin");
      return;
    }
    setStage("gate");
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setStage("gate");
  };

  const handleLogout = () => {
    localStorage.removeItem("threviaCurrentUser");
    setUser(null);
    setSessionSponsor(null);
    setStage("login");
    setAuthMode("login");
  };

  if (stage === "login") {
    return authMode === "login" ? (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthMode("register")}
      />
    ) : (
      <RegisterForm
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setAuthMode("login")}
      />
    );
  }

  if (stage === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (!user) {
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setAuthMode("register");
          setStage("login");
        }}
      />
    );
  }

  if (stage === "gate") {
    return (
      <RandomAdGate
        onContinue={(chosen) => {
          setSessionSponsor(chosen);
          setStage("ad");
        }}
      />
    );
  }

  if (stage === "ad") {
    return (
      <AdPlayer
        sponsor={sessionSponsor}
        duration={INITIAL_AD_DURATION}
        onDone={() => setStage("app")}
      />
    );
  }

  return <MainApp sponsor={sessionSponsor} user={user} onLogout={handleLogout} />;
}

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#06080f;font-family:'Sora',sans-serif}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,245,160,.3)}50%{box-shadow:0 0 0 8px rgba(0,245,160,0)}}
`;

const base = {
  fontFamily: "'Sora',sans-serif",
  background: "linear-gradient(160deg,#06080f 0%,#0a1220 100%)",
  minHeight: "100vh",
  maxWidth: 480,
  margin: "0 auto",
  color: "#e8f0fe",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
};

const S = {
  screen: { ...base, alignItems: "center", justifyContent: "center", padding: "24px 18px", gap: 16 },
  wifiBadge: {
    background: "rgba(0,245,160,0.1)",
    border: "1px solid rgba(0,245,160,0.25)",
    color: "#00f5a0",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.6,
    padding: "6px 16px",
    borderRadius: 999,
    textTransform: "uppercase",
  },
  heroTitle: { fontSize: 28, fontWeight: 700, textAlign: "center", lineHeight: 1.2 },
  heroSub: { fontSize: 13, color: "rgba(232,240,254,0.5)", textAlign: "center", lineHeight: 1.5 },
  card: {
    width: "100%",
    maxWidth: 320,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 18,
    position: "relative",
  },
  cardLogo: { fontSize: 34, marginBottom: 6 },
  cardName: { fontWeight: 700, fontSize: 18 },
  cardCat: { fontSize: 11, color: "rgba(232,240,254,0.55)", marginTop: 4 },
  timePill: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: "4px 10px",
    borderRadius: 999,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Space Mono',monospace",
  },
  ctaBtn: {
    width: "100%",
    maxWidth: 320,
    padding: "14px 16px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Sora',sans-serif",
  },
  legal: { fontSize: 10.5, color: "rgba(232,240,254,0.35)", textAlign: "center" },
};

const A = {
  screen: { ...base, padding: "20px 16px", alignItems: "center", justifyContent: "center", gap: 14 },
  card: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  banner: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" },
  bannerName: { fontWeight: 700, fontSize: 15, color: "#fff" },
  bannerTag: { fontSize: 10.5, color: "rgba(255,255,255,0.7)" },
  adBadge: {
    marginLeft: "auto",
    background: "rgba(255,255,255,0.2)",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
  },
  videoWrap: { width: "100%", aspectRatio: "16 / 9", background: "#000" },
  videoFrame: { width: "100%", height: "100%", border: "none" },
  body: { padding: "12px 16px" },
  adText: { fontSize: 13.5, lineHeight: 1.6, color: "rgba(232,240,254,0.82)", marginBottom: 12 },
  adCta: {
    border: "none",
    borderRadius: 10,
    padding: "8px 14px",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Sora',sans-serif",
  },
  progWrap: { padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" },
  progTrack: { height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" },
  progFill: { height: "100%", borderRadius: 99, transition: "width 1s linear" },
  progLbl: { fontSize: 11, color: "rgba(232,240,254,0.5)", marginTop: 6, textAlign: "right" },
  reward: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    background: "rgba(0,245,160,0.08)",
    border: "1px solid rgba(0,245,160,0.2)",
    borderRadius: 12,
    padding: "12px 14px",
  },
  rewardLbl: {
    fontSize: 10,
    color: "rgba(0,245,160,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  rewardVal: { fontSize: 14.5, fontWeight: 700, color: "#00f5a0" },
  unlockBtn: {
    width: "100%",
    padding: "13px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Sora',sans-serif",
    animation: "pulse 2s infinite",
  },
  waitMsg: { fontSize: 12, color: "rgba(232,240,254,0.45)", textAlign: "center" },
  powered: { fontSize: 10, color: "rgba(232,240,254,0.25)", textAlign: "center" },
};

const M = {
  wrap: { ...base },
  timerBar: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "12px 10px 8px",
    background: "rgba(6,8,15,0.96)",
    overflowX: "auto",
  },
  timerLeft: { display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: "50%", animation: "pulse 2s infinite" },
  time: { fontFamily: "'Space Mono',monospace", fontSize: 18, fontWeight: 700, lineHeight: 1 },
  timeLbl: { fontSize: 8.5, color: "rgba(232,240,254,0.4)", textTransform: "uppercase" },
  sponsorChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: "4px 8px",
    fontSize: 11,
    flexShrink: 0,
  },
  metricChip: {
    background: "rgba(0,245,160,0.1)",
    border: "1px solid rgba(0,245,160,0.2)",
    borderRadius: 16,
    padding: "4px 8px",
    cursor: "pointer",
    textAlign: "center",
    flexShrink: 0,
  },
  metricNum: {
    display: "block",
    fontFamily: "'Space Mono',monospace",
    fontSize: 12,
    fontWeight: 700,
    color: "#00f5a0",
    lineHeight: 1,
  },
  metricLbl: {
    display: "block",
    fontSize: 8,
    color: "rgba(0,245,160,0.55)",
    textTransform: "uppercase",
  },
  logoutBtn: {
    marginLeft: 6,
    border: "none",
    background: "none",
    color: "rgba(232,240,254,0.8)",
    cursor: "pointer",
    fontSize: 13,
  },
  strip: { height: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" },
  stripFill: { height: "100%", transition: "width 1s linear" },
  toast: {
    position: "fixed",
    top: 66,
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    padding: "8px 16px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
    zIndex: 1200,
    whiteSpace: "nowrap",
    animation: "slideUp 0.2s ease",
  },
  nav: {
    display: "flex",
    overflowX: "auto",
    gap: 6,
    padding: "8px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  navBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "7px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(232,240,254,0.5)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  navBtnOn: {
    border: "1px solid rgba(0,245,160,0.4)",
    background: "rgba(0,245,160,0.08)",
    color: "#00f5a0",
  },
  navBtnLocked: {
    border: "1px solid rgba(255,193,7,0.4)",
    color: "#ffd166",
  },
  qrow: { display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 10px" },
  qbtn: {
    background: "rgba(0,210,245,0.08)",
    border: "1px solid rgba(0,210,245,0.2)",
    borderRadius: 16,
    color: "#00d9f5",
    fontSize: 11,
    padding: "4px 10px",
    cursor: "pointer",
  },
  chat: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  row: { display: "flex", alignItems: "flex-end", gap: 6 },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 8,
    background: "linear-gradient(135deg,#00f5a0,#00d9f5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#06121f",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Space Mono',monospace",
  },
  bubble: {
    maxWidth: "82%",
    padding: "10px 12px",
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  aBubble: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
  },
  uBubble: {
    background: "linear-gradient(135deg,rgba(0,245,160,0.14),rgba(0,217,245,0.14))",
    border: "1px solid rgba(0,245,160,0.22)",
    borderBottomRightRadius: 4,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "10px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(6,8,15,0.96)",
  },
  input: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#e8f0fe",
    fontSize: 13,
    outline: "none",
    fontFamily: "'Sora',sans-serif",
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    cursor: "pointer",
    fontWeight: 700,
  },
  footer: {
    textAlign: "center",
    fontSize: 9.5,
    color: "rgba(232,240,254,0.25)",
    padding: "6px 12px 8px",
  },
};

const Br = {
  wrap: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  urlRow: {
    display: "flex",
    gap: 8,
    padding: "9px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  urlIn: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "8px 10px",
    color: "#e8f0fe",
    fontSize: 12,
    outline: "none",
  },
  go: {
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    fontWeight: 700,
    cursor: "pointer",
  },
  bmarks: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
    padding: "8px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  bmark: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "8px 6px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#e8f0fe",
    cursor: "pointer",
  },
  bmarkText: { fontSize: 9.5, color: "rgba(232,240,254,0.55)", textAlign: "center" },
  lockCard: {
    margin: "8px 10px",
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,193,7,0.1)",
    border: "1px solid rgba(255,193,7,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  lockTitle: { fontSize: 13, fontWeight: 700, color: "#ffd166" },
  lockText: { fontSize: 11.5, color: "rgba(232,240,254,0.75)" },
  unlockBtn: {
    padding: "9px 12px",
    borderRadius: 9,
    border: "none",
    background: "#ffd166",
    color: "#06121f",
    fontWeight: 700,
    cursor: "pointer",
  },
  frame: { flex: 1, border: "none", background: "#fff" },
  ph: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  phText: { fontSize: 12, color: "rgba(232,240,254,0.45)", textAlign: "center", lineHeight: 1.5 },
};

const E = {
  screen: { ...base, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  title: { fontSize: 26, fontWeight: 700, color: "#ff6b6b" },
  sub: { fontSize: 14, color: "rgba(232,240,254,0.5)", textAlign: "center" },
  bucksBox: {
    width: "100%",
    background: "rgba(0,245,160,0.08)",
    border: "1px solid rgba(0,245,160,0.2)",
    borderRadius: 14,
    padding: "14px 18px",
    textAlign: "center",
  },
  bucksNum: { fontSize: 32, fontWeight: 700, color: "#00f5a0", fontFamily: "'Space Mono',monospace" },
  bucksLbl: { fontSize: 11, color: "rgba(0,245,160,0.55)" },
  tip: { fontSize: 12, color: "rgba(232,240,254,0.45)", textAlign: "center" },
  newBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    fontWeight: 700,
    cursor: "pointer",
  },
};

const Mo = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    zIndex: 1300,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 14,
  },
  box: {
    width: "100%",
    maxWidth: 440,
    background: "#0a1220",
    border: "1px solid rgba(0,245,160,0.2)",
    borderRadius: 18,
    padding: 18,
    animation: "slideUp 0.2s ease",
  },
  title: { fontSize: 16, fontWeight: 700, color: "#00f5a0", marginBottom: 10 },
  rowStat: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    color: "rgba(232,240,254,0.85)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  bigNum: { fontFamily: "'Space Mono',monospace", fontWeight: 700, color: "#fff" },
  convertBtn: {
    width: "100%",
    padding: 11,
    marginTop: 14,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    fontWeight: 700,
    cursor: "pointer",
  },
  subHd: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 10,
    textTransform: "uppercase",
    color: "rgba(232,240,254,0.45)",
    letterSpacing: 1,
  },
  ruleRow: {
    fontSize: 12,
    color: "rgba(232,240,254,0.75)",
    padding: "6px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  close: {
    width: "100%",
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    color: "rgba(232,240,254,0.6)",
    cursor: "pointer",
  },
};

const AD = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1400,
    background: "rgba(5,8,16,0.96)",
    backdropFilter: "blur(6px)",
  },
};

const G = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 10,
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 12,
  },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 6 },
  sub: { fontSize: 12, color: "rgba(232,240,254,0.55)", marginBottom: 10, lineHeight: 1.4 },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 8 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 9,
    padding: "8px 10px",
    color: "#e8f0fe",
    fontSize: 12,
    outline: "none",
    fontFamily: "'Sora',sans-serif",
  },
  btnPrimary: {
    marginTop: 10,
    width: "100%",
    border: "none",
    borderRadius: 9,
    padding: "9px 11px",
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    color: "#06121f",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnSecondary: {
    border: "none",
    borderRadius: 9,
    padding: "9px 12px",
    background: "rgba(0,217,245,0.22)",
    color: "#00d9f5",
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
  },
  list: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  listItem: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    borderRadius: 10,
    padding: 9,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  itemText: { fontSize: 12.5, color: "#e8f0fe" },
  itemMeta: { fontSize: 10.5, color: "rgba(232,240,254,0.45)" },
  actionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  linkBtn: {
    display: "inline-block",
    fontSize: 11,
    color: "#00f5a0",
    textDecoration: "none",
    border: "1px solid rgba(0,245,160,0.4)",
    borderRadius: 8,
    padding: "5px 8px",
  },
  inAppBadge: {
    fontSize: 11,
    color: "#00d9f5",
    border: "1px solid rgba(0,217,245,0.4)",
    borderRadius: 8,
    padding: "5px 8px",
  },
  deleteBtn: {
    border: "1px solid rgba(255,68,68,0.35)",
    borderRadius: 8,
    background: "rgba(255,68,68,0.12)",
    color: "#ff7b7b",
    fontSize: 11,
    padding: "5px 8px",
    cursor: "pointer",
  },
  empty: { fontSize: 11.5, color: "rgba(232,240,254,0.45)" },
  resources: { display: "flex", flexDirection: "column", gap: 8 },
  resourceLink: { fontSize: 12, color: "#00d9f5", textDecoration: "none" },
};

const P = {
  wrap: { flex: 1, padding: 12 },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 14,
  },
  title: { fontSize: 15, fontWeight: 700, marginBottom: 8 },
  text: { fontSize: 12.5, color: "rgba(232,240,254,0.6)", lineHeight: 1.5, marginBottom: 6 },
};
