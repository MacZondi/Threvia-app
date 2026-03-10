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
const AD_BREAK_POINTS = 20;
const POINTS_PER_BUCK = 40;
const DAILY_POINTS_CAP = 60;
const PREMIUM_MODULE_UNLOCK_BUCKS = 30;
const FULL_BROWSER_UNLOCK_BUCKS = 25;

const SPONSORS = [
  {
    id: "vodacom",
    name: "Vodacom",
    tagline: "Connecting South Africa",
    color: "#E60000",
    logo: "VD",
    logoUrl: "/images/vodacom.png",
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
    logo: "CP",
    logoUrl: "/images/Capitecbanklogo.png",
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
    logo: "NS",
    logoUrl: "/images/nsfas.png",
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
    logo: "DH",
    logoUrl: "/images/Deptofhealth.png",
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
    logo: "MT",
    logoUrl: "/images/Mtn.jpg",
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
const CHAT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const CHAT_API_ENDPOINT = `${CHAT_API_BASE_URL.replace(/\/$/, "")}/chat`;

const MODULES = [
  { id: "chat", icon: "💬", label: "Assistant" },
  { id: "sexual", icon: "🩺", label: "Sexual Health" },
  { id: "mental", icon: "🧠", label: "Mental Health" },
  { id: "skills", icon: "🎓", label: "Skills" },
  { id: "map", icon: "📍", label: "Services Map" },
  { id: "browser", icon: "🌐", label: "Web Access" },
  { id: "agent", icon: "🤖", label: "Agent" },
  { id: "documents", icon: "📁", label: "Documents" },
  { id: "data", icon: "📶", label: "Data Store" },
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
  { label: "WHO Health", url: "https://www.who.int", icon: "WH", logoUrl: "https://logo.clearbit.com/who.int" },
  { label: "UNICEF SA", url: "https://www.unicef.org/southafrica", icon: "UN", logoUrl: "https://logo.clearbit.com/unicef.org" },
  { label: "NSFAS", url: "https://www.nsfas.org.za", icon: "NS", logoUrl: "https://logo.clearbit.com/nsfas.org.za" },
  { label: "SA Youth", url: "https://www.sayouth.mobi", icon: "SY", logoUrl: "https://logo.clearbit.com/sayouth.mobi" },
  { label: "Health ZA", url: "https://www.health.gov.za", icon: "HZ", logoUrl: "https://logo.clearbit.com/health.gov.za" },
  { label: "OpenStreetMap", url: "https://www.openstreetmap.org", icon: "OS", logoUrl: "https://logo.clearbit.com/openstreetmap.org" },
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

function LogoBadge({
  logoUrl,
  fallback,
  alt,
  size = 36,
  radius = 10,
  border = "1px solid rgba(131,164,222,0.3)",
  background = "rgba(7,14,28,0.84)",
  textColor = "var(--th-ink)",
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        border,
        background,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <span
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 700,
          fontSize: Math.max(10, Math.floor(size * 0.28)),
          letterSpacing: 0.3,
          color: textColor,
        }}
      >
        {fallback}
      </span>
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={alt}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: "#fff",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </div>
  );
}

function RandomAdGate({ onContinue }) {
  const [selectedAd, setSelectedAd] = useState(() => pickRandomSponsor());

  return (
    <div style={S.screen}>
      <div style={S.wifiBadge}>THREVIA ACCESS LAYER</div>
      <div style={S.heroTitle}>
        Premium public-health infrastructure, powered by sponsor-funded sessions.
      </div>
      <div style={S.heroSub}>
        Users watch a short sponsor slot, then unlock a guided 25-minute experience for education,
        health, and opportunity access.
      </div>

      <div style={S.pitchRow}>
        <div style={S.pitchCard}>
          <div style={S.pitchValue}>25m</div>
          <div style={S.pitchLabel}>session duration</div>
        </div>
        <div style={S.pitchCard}>
          <div style={S.pitchValue}>10+</div>
          <div style={S.pitchLabel}>care modules</div>
        </div>
        <div style={S.pitchCard}>
          <div style={S.pitchValue}>B2G/B2B</div>
          <div style={S.pitchLabel}>monetization lanes</div>
        </div>
      </div>

      <div style={{ ...S.card, border: `2px solid ${selectedAd.color}` }}>
        <div style={S.cardLogo}>
          <LogoBadge
            logoUrl={selectedAd.logoUrl}
            fallback={selectedAd.logo}
            alt={`${selectedAd.name} logo`}
            size={56}
            radius={14}
          />
        </div>
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
        Start Sponsored Session
      </button>

      <div style={S.legal}>Health, education, research, and maps are open by default.</div>
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
        background: `linear-gradient(160deg,rgba(6,14,28,0.94),${sponsor.color}26)`,
      }}
    >
      <div style={A.card}>
        <div style={{ ...A.banner, background: sponsor.color }}>
          <LogoBadge
            logoUrl={sponsor.logoUrl}
            fallback={sponsor.logo}
            alt={`${sponsor.name} logo`}
            size={36}
            radius={10}
            border="1px solid rgba(255,255,255,0.36)"
            background="rgba(255,255,255,0.16)"
            textColor="#fff"
          />
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
          <button style={{ ...A.adCta, background: sponsor.color }}>{sponsor.cta}</button>
        </div>

        <div style={A.progWrap}>
          <div style={A.progTrack}>
            <div style={{ ...A.progFill, width: `${pct}%`, background: sponsor.color }} />
          </div>
          <div style={A.progLbl}>
            {done ? "Ad complete" : `${secondsLeft}s remaining`}
          </div>
        </div>
      </div>

      <div style={A.reward}>
        <span style={A.rewardBadge}>{mode === "break" ? "BREAK" : "ACCESS"}</span>
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
          {mode === "break" ? "Continue Session" : "Unlock Session"}
        </button>
      ) : (
        <div style={A.waitMsg}>This ad is mandatory and cannot be skipped.</div>
      )}

      <div style={A.powered}>Powered by Threvia · Sponsor videos stream via embedded YouTube</div>
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
    const rewarded = onEarnPoints({
      amount: 6,
      source: "agent_reminder_saved",
      maxTimes: 1,
    });
    onToast(rewarded ? "Reminder saved. +6 points" : "Reminder saved.");
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
    const eligibleForReward = note.trim().length >= 30;
    setNote("");
    const rewarded =
      eligibleForReward &&
      onEarnPoints({
        amount: 4,
        source: "agent_note_quality",
        maxTimes: 1,
      });
    onToast(
      rewarded
        ? "Note saved. +4 points for detailed entry"
        : "Note saved."
    );
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
        <h3 style={G.title}>AI Agent: Reminders and Saved Information</h3>
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
        <h3 style={G.title}>Saved Notes</h3>
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
        <h3 style={G.title}>Reminder Queue</h3>
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
        <h3 style={G.title}>Opportunity Feed</h3>
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
  const todayKey = new Date().toLocaleDateString("en-CA");
  const dailyPointsStorageKey = `threviaDailyPoints_${user?.id || "guest"}_${todayKey}`;
  const [dailyPointsAwarded, setDailyPointsAwarded] = useState(0);

  const [browserUrl, setBrowserUrl] = useState("");
  const [browserInput, setBrowserInput] = useState("https://");
  const [blockedUrl, setBlockedUrl] = useState("");
  const [browserUnlocked, setBrowserUnlocked] = useState(false);

  const [unlockedModules, setUnlockedModules] = useState({});
  const [nextAdBreakAt, setNextAdBreakAt] = useState(SESSION_DURATION - AD_BREAK_INTERVAL);
  const [adBreak, setAdBreak] = useState(null);

  const chatEnd = useRef(null);
  const lastAdSponsor = useRef(sponsor.id);
  const rewardState = useRef({
    counts: {},
    lastAt: {},
    approvedDomains: new Set(),
  });

  useEffect(() => {
    const stored = localStorage.getItem(dailyPointsStorageKey);
    if (!stored) {
      setDailyPointsAwarded(0);
      return;
    }
    const parsed = Number(stored);
    setDailyPointsAwarded(Number.isFinite(parsed) ? parsed : 0);
  }, [dailyPointsStorageKey]);

  useEffect(() => {
    localStorage.setItem(dailyPointsStorageKey, String(dailyPointsAwarded));
  }, [dailyPointsStorageKey, dailyPointsAwarded]);

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

  const earnPoints = (amount, source = "default", options = {}) => {
    const now = Date.now();
    const count = rewardState.current.counts[source] || 0;
    const lastAt = rewardState.current.lastAt[source] || 0;
    const remainingDailyPoints = DAILY_POINTS_CAP - dailyPointsAwarded;
    if (remainingDailyPoints <= 0) {
      showToast("Daily points cap reached. Earn more tomorrow.");
      return false;
    }

    if (options.maxTimes != null && count >= options.maxTimes) {
      return false;
    }

    if (options.cooldownMs && now - lastAt < options.cooldownMs) {
      return false;
    }

    const grantedAmount = Math.min(amount, remainingDailyPoints);
    rewardState.current.counts[source] = count + 1;
    rewardState.current.lastAt[source] = now;
    setPoints((prev) => prev + grantedAmount);
    setDailyPointsAwarded((prev) => Math.min(DAILY_POINTS_CAP, prev + grantedAmount));
    showToast(`+${grantedAmount} points earned`);
    return true;
  };

  const convertPointsToBucks = () => {
    const canConvert = Math.floor(points / POINTS_PER_BUCK);
    if (canConvert < 1) {
      showToast(`Need at least ${POINTS_PER_BUCK} points to convert.`);
      return;
    }

    setPoints((prev) => prev - canConvert * POINTS_PER_BUCK);
    setBucks((prev) => prev + canConvert);
    showToast(`Converted ${canConvert * POINTS_PER_BUCK} points to ${canConvert} ThreviaBucks`);
  };

  const handleAdBreakDone = () => {
    setAdBreak(null);
    earnPoints(AD_BREAK_POINTS, "ad_break_completed");
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
        "Sexual Health: everything here is anonymous and educational. What would you like to know?",
      mental: "Mental Health: this is a safe support space. How are you feeling right now?",
      skills:
        "Skills: let's focus on bursaries, CVs, study planning, and career preparation.",
      map: "Services Map: share your area and I can help find nearby clinics and youth services.",
      documents:
        "Documents unlocked. Store your study and health documents securely on this device.",
      support: "Support module unlocked. You can fund and sustain the free-mode program here.",
    };

    if (intros[id]) {
      setMessages([{ role: "assistant", content: intros[id] }]);
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
      const host = new URL(value).hostname.replace(/^www\./, "");
      const isNewDomain = !rewardState.current.approvedDomains.has(host);
      if (isNewDomain && rewardState.current.approvedDomains.size < 2) {
        rewardState.current.approvedDomains.add(host);
        earnPoints(5, "approved_resource_domain", {
          maxTimes: 2,
          cooldownMs: 2 * 60 * 1000,
        });
      }
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

    const hits = kw.filter((k) => msg.toLowerCase().includes(k)).length;
    const qualifiesForQueryReward = hits >= 2 && msg.trim().length >= 40;

    try {
      const res = await fetch(CHAT_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 700,
          system: SYSTEM_PROMPT,
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const apiError = typeof data?.error === "string" ? data.error : null;
        throw new Error(apiError || `Chat API error ${res.status}`);
      }

      const assistantReply = typeof data?.reply === "string" ? data.reply.trim() : "";
      if (!assistantReply) {
        throw new Error("Chat API returned an empty reply");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: assistantReply,
        },
      ]);
      if (qualifiesForQueryReward) {
        earnPoints(8, "quality_health_query", {
          maxTimes: 3,
          cooldownMs: 4 * 60 * 1000,
        });
      }
    } catch (error) {
      console.error("Chat send failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Chat is temporarily unavailable. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const timePct = (timeLeft / SESSION_DURATION) * 100;
  const timerColor = timePct > 25 ? "#0a9e9f" : timePct > 10 ? "#f4a83d" : "#d0573f";

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
          Start New Session
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
          <LogoBadge
            logoUrl={sponsor.logoUrl}
            fallback={sponsor.logo}
            alt={`${sponsor.name} logo`}
            size={20}
            radius={6}
          />
          <span style={{ fontSize: 11, color: "var(--th-muted)" }}>{sponsor.name}</span>
        </div>

        <div style={M.metricChip} onClick={() => setShowRewardsModal(true)}>
          <span style={M.metricNum}>{points}</span>
          <span style={M.metricLbl}>Points</span>
        </div>

        <div style={M.metricChip} onClick={() => setShowRewardsModal(true)}>
          <span style={M.metricNum}>{bucks}</span>
          <span style={M.metricLbl}>Bucks</span>
        </div>

        <div style={{ ...M.metricChip, background: "rgba(12,123,198,0.14)" }}>
          <span style={{ fontSize: 12 }}>{user?.name?.split(" ")[0] || "User"}</span>
          <button
            onClick={onLogout}
            title="Logout"
            style={M.logoutBtn}
          >
            Log out
          </button>
        </div>
      </div>

      <div style={M.strip}>
        <div style={{ ...M.stripFill, width: `${timePct}%`, background: timerColor }} />
      </div>

      {toast && <div style={M.toast}>{toast}</div>}

      <div style={M.investorBanner}>
        <div style={M.investorTitle}>Platform Overview</div>
        <div style={M.investorText}>
          Threvia combines ad-funded access, youth-safe AI, and utility wallet rails in one
          operating layer.
        </div>
      </div>

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
              <span style={M.navIcon}>{item.icon}</span>
              <span style={M.navLabel}>{showAsLocked ? `${item.label} (Locked)` : item.label}</span>
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
                <span style={Br.bmarkIcon}>
                  <LogoBadge
                    logoUrl={b.logoUrl}
                    fallback={b.icon}
                    alt={`${b.label} logo`}
                    size={30}
                    radius={8}
                  />
                </span>
                <span style={Br.bmarkText}>{b.label}</span>
              </button>
            ))}
          </div>

          {blockedUrl && !browserUnlocked && (
            <div style={Br.lockCard}>
              <div style={Br.lockTitle}>Restricted in Free Mode</div>
              <div style={Br.lockText}>
                Free mode is strictly for educational, health, research, and map access.
              </div>
              <div style={Br.lockText}>Blocked URL: {blockedUrl}</div>
              <button style={Br.unlockBtn} onClick={unlockBrowser}>
                Unlock full browser ({FULL_BROWSER_UNLOCK_BUCKS} Bucks)
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
              <div style={Br.phIcon}>WEB</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--th-muted)" }}>
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
              showToast(`${data.package.dataSize} activated.`);
              if (data.paymentMethod === "bucks") {
                setBucks((prev) => Math.max(0, prev - data.bucksSpent));
              }
            }}
          />
        </div>
      ) : module === "agent" ? (
        <div style={{ flex: 1, overflow: "auto" }}>
          <AgentModule
            user={user}
            onEarnPoints={(config) => {
              if (typeof config === "number") {
                return earnPoints(config, "agent_legacy", { maxTimes: 1 });
              }
              if (!config?.amount) return false;
              return earnPoints(config.amount, config.source || "agent_custom", config);
            }}
            onToast={showToast}
          />
        </div>
      ) : module === "support" ? (
        <div style={P.wrap}>
          <div style={P.card}>
            <h3 style={P.title}>Support Threvia Free Mode</h3>
            <p style={P.text}>
              This module is unlocked and ready for Base Pay integrations in the next iteration.
            </p>
            <p style={P.text}>Buy Data and Agent features are currently available in this environment.</p>
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
              Send
            </button>
          </div>
        </>
      )}

      <div style={M.footer}>POPIA-aligned platform · Sponsor-funded access · Youth-safe guidance</div>

      {showRewardsModal && (
        <div style={Mo.overlay} onClick={() => setShowRewardsModal(false)}>
          <div style={Mo.box} onClick={(e) => e.stopPropagation()}>
            <div style={Mo.title}>Points and ThreviaBucks</div>
            <div style={Mo.rowStat}>
              <span>Points</span>
              <span style={Mo.bigNum}>{points}</span>
            </div>
            <div style={Mo.rowStat}>
              <span>ThreviaBucks</span>
              <span style={Mo.bigNum}>{bucks}</span>
            </div>
            <div style={Mo.rowStat}>
              <span>Daily Points</span>
              <span style={Mo.bigNum}>{dailyPointsAwarded}/{DAILY_POINTS_CAP}</span>
            </div>

            <button style={Mo.convertBtn} onClick={convertPointsToBucks}>
              Convert points to Bucks ({POINTS_PER_BUCK} pts = 1 Buck)
            </button>

            <div style={Mo.subHd}>How to earn points</div>
            {[
              "Complete mandatory ad breaks (+20)",
              "Submit high-quality health/study prompts (+8 after assistant reply)",
              "First reminder and first detailed note only (+6 / +4)",
              "New approved resource domains only (+5, max 2)",
              `Daily points cap: ${DAILY_POINTS_CAP}`,
            ].map((line) => (
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
  *{box-sizing:border-box;margin:0;padding:0}
  @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(10,158,159,.25)}50%{box-shadow:0 0 0 12px rgba(10,158,159,0)}}
  @keyframes floatIn{from{opacity:0;transform:translateY(20px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
`;

const base = {
  fontFamily: "'Manrope',sans-serif",
  background:
    "radial-gradient(circle at 8% 6%,rgba(12,123,198,0.2) 0%,transparent 38%),linear-gradient(160deg,rgba(4,10,20,0.96) 0%,rgba(8,16,30,0.96) 100%)",
  minHeight: "100vh",
  width: "100%",
  maxWidth: 1140,
  margin: "0 auto",
  color: "var(--th-ink)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "relative",
  border: "1px solid var(--th-card-border)",
  borderRadius: 30,
  boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
  backdropFilter: "blur(8px)",
};

const S = {
  screen: {
    ...base,
    alignItems: "center",
    justifyContent: "center",
    padding: "42px clamp(18px,4vw,48px)",
    gap: 16,
    animation: "floatIn .35s ease",
  },
  wifiBadge: {
    background: "rgba(10,158,159,0.14)",
    border: "1px solid rgba(10,158,159,0.28)",
    color: "var(--th-accent)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.4,
    padding: "6px 14px",
    borderRadius: 999,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: "clamp(26px,4.5vw,44px)",
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.12,
    maxWidth: 880,
    color: "var(--th-ink)",
  },
  heroSub: {
    fontSize: 15,
    color: "var(--th-muted)",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: 760,
  },
  pitchRow: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: 10,
    maxWidth: 760,
  },
  pitchCard: {
    background: "rgba(8,16,34,0.78)",
    border: "1px solid rgba(16,34,58,0.12)",
    borderRadius: 14,
    padding: "12px 14px",
    textAlign: "center",
  },
  pitchValue: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 22,
    fontWeight: 700,
    color: "var(--th-ink)",
  },
  pitchLabel: {
    fontSize: 11,
    color: "var(--th-muted)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(8,16,34,0.86)",
    border: "1px solid rgba(16,34,58,0.12)",
    borderRadius: 18,
    padding: 22,
    position: "relative",
    boxShadow: "0 14px 30px rgba(16,34,58,0.15)",
  },
  cardLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    border: "1px solid rgba(16,34,58,0.15)",
    background: "rgba(16,34,58,0.06)",
    display: "grid",
    placeItems: "center",
    fontFamily: "'Space Grotesk',sans-serif",
    fontWeight: 700,
    fontSize: 20,
    marginBottom: 8,
    color: "var(--th-ink)",
  },
  cardName: { fontWeight: 700, fontSize: 20, color: "var(--th-ink)" },
  cardCat: { fontSize: 12, color: "var(--th-muted)", marginTop: 4 },
  timePill: {
    position: "absolute",
    right: 14,
    top: 14,
    padding: "5px 11px",
    borderRadius: 999,
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'Space Grotesk',sans-serif",
  },
  ctaBtn: {
    width: "100%",
    maxWidth: 420,
    padding: "14px 16px",
    borderRadius: 13,
    border: "none",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.2,
    boxShadow: "0 12px 26px rgba(12,123,198,0.28)",
  },
  legal: { fontSize: 11, color: "var(--th-muted)", textAlign: "center" },
};

const A = {
  screen: {
    ...base,
    padding: "24px clamp(14px,4vw,34px)",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  card: {
    width: "100%",
    maxWidth: 880,
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(8,16,34,0.88)",
    border: "1px solid rgba(16,34,58,0.12)",
    boxShadow: "0 12px 30px rgba(16,34,58,0.15)",
  },
  banner: { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" },
  bannerName: { fontWeight: 700, fontSize: 15, color: "#fff" },
  bannerTag: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  adBadge: {
    marginLeft: "auto",
    background: "rgba(0,0,0,0.22)",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
  },
  videoWrap: { width: "100%", aspectRatio: "16 / 9", background: "#000" },
  videoFrame: { width: "100%", height: "100%", border: "none" },
  body: { padding: "12px 16px" },
  adText: { fontSize: 13.5, lineHeight: 1.6, color: "var(--th-muted)", marginBottom: 12 },
  adCta: {
    border: "none",
    borderRadius: 10,
    padding: "8px 14px",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Manrope',sans-serif",
  },
  progWrap: { padding: "10px 16px", borderTop: "1px solid rgba(16,34,58,0.08)" },
  progTrack: { height: 6, background: "rgba(16,34,58,0.08)", borderRadius: 99, overflow: "hidden" },
  progFill: { height: "100%", borderRadius: 99, transition: "width 1s linear" },
  progLbl: { fontSize: 11, color: "var(--th-muted)", marginTop: 6, textAlign: "right" },
  reward: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 880,
    background: "rgba(10,158,159,0.12)",
    border: "1px solid rgba(10,158,159,0.25)",
    borderRadius: 12,
    padding: "12px 14px",
  },
  rewardLbl: {
    fontSize: 10,
    color: "rgba(10,158,159,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  rewardVal: { fontSize: 14.5, fontWeight: 700, color: "var(--th-accent)" },
  rewardBadge: {
    minWidth: 68,
    height: 40,
    borderRadius: 10,
    border: "1px solid rgba(10,158,159,0.34)",
    background: "rgba(10,158,159,0.14)",
    color: "var(--th-accent)",
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    display: "grid",
    placeItems: "center",
  },
  unlockBtn: {
    width: "100%",
    maxWidth: 880,
    padding: "13px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    animation: "pulse 2s infinite",
  },
  waitMsg: { fontSize: 12, color: "var(--th-muted)", textAlign: "center" },
  powered: { fontSize: 10, color: "rgba(16,34,58,0.45)", textAlign: "center" },
};

const M = {
  wrap: { ...base },
  timerBar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    padding: "14px 14px 10px",
    background: "rgba(8,16,34,0.68)",
    borderBottom: "1px solid rgba(16,34,58,0.08)",
  },
  timerLeft: { display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: "50%", animation: "pulse 2s infinite" },
  time: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 700, lineHeight: 1 },
  timeLbl: { fontSize: 9, color: "var(--th-muted)", textTransform: "uppercase" },
  sponsorChip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(8,16,34,0.72)",
    border: "1px solid rgba(16,34,58,0.12)",
    borderRadius: 16,
    padding: "5px 10px",
    fontSize: 11,
    flexShrink: 0,
    color: "var(--th-ink)",
  },
  metricChip: {
    background: "rgba(10,158,159,0.12)",
    border: "1px solid rgba(10,158,159,0.24)",
    borderRadius: 16,
    padding: "5px 10px",
    cursor: "pointer",
    textAlign: "center",
    flexShrink: 0,
  },
  metricNum: {
    display: "block",
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--th-accent)",
    lineHeight: 1,
  },
  metricLbl: {
    display: "block",
    fontSize: 8,
    color: "rgba(10,158,159,0.65)",
    textTransform: "uppercase",
  },
  logoutBtn: {
    marginLeft: 6,
    border: "none",
    background: "none",
    color: "var(--th-muted)",
    cursor: "pointer",
    fontSize: 13,
  },
  strip: { height: 4, background: "rgba(16,34,58,0.08)", overflow: "hidden" },
  stripFill: { height: "100%", transition: "width 1s linear" },
  toast: {
    position: "fixed",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    padding: "9px 16px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
    zIndex: 1200,
    whiteSpace: "nowrap",
    animation: "slideUp 0.2s ease",
    boxShadow: "0 10px 22px rgba(16,34,58,0.28)",
  },
  investorBanner: {
    margin: "12px 12px 0",
    borderRadius: 16,
    padding: "12px 14px",
    border: "1px solid rgba(16,34,58,0.12)",
    background: "rgba(8,16,34,0.9)",
  },
  investorTitle: {
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--th-ink)",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  investorText: {
    fontSize: 13,
    color: "var(--th-muted)",
    lineHeight: 1.45,
  },
  nav: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(16,34,58,0.08)",
  },
  navBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "9px 11px",
    borderRadius: 12,
    border: "1px solid rgba(16,34,58,0.12)",
    background: "rgba(8,16,34,0.76)",
    color: "var(--th-muted)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    flex: "1 1 92px",
  },
  navIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    border: "1px solid rgba(16,34,58,0.16)",
    background: "rgba(8,16,34,0.9)",
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0,
    display: "grid",
    placeItems: "center",
    color: "var(--th-ink)",
  },
  navLabel: { fontSize: 10, fontWeight: 600, textAlign: "center" },
  navBtnOn: {
    border: "1px solid rgba(10,158,159,0.4)",
    background: "rgba(10,158,159,0.14)",
    color: "var(--th-accent)",
  },
  navBtnLocked: {
    border: "1px solid rgba(244,154,80,0.45)",
    color: "var(--th-warm)",
  },
  qrow: { display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px" },
  qbtn: {
    background: "rgba(12,123,198,0.1)",
    border: "1px solid rgba(12,123,198,0.25)",
    borderRadius: 16,
    color: "var(--th-accent-strong)",
    fontSize: 12,
    padding: "6px 11px",
    cursor: "pointer",
  },
  chat: {
    flex: 1,
    overflowY: "auto",
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  row: { display: "flex", alignItems: "flex-end", gap: 6 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "'Space Grotesk',sans-serif",
  },
  bubble: {
    maxWidth: "82%",
    padding: "11px 13px",
    borderRadius: 15,
    fontSize: 13.5,
    lineHeight: 1.52,
    whiteSpace: "pre-wrap",
  },
  aBubble: {
    background: "rgba(8,16,34,0.78)",
    border: "1px solid rgba(16,34,58,0.12)",
    borderBottomLeftRadius: 4,
  },
  uBubble: {
    background: "rgba(13,126,199,0.12)",
    border: "1px solid rgba(10,158,159,0.22)",
    borderBottomRightRadius: 4,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "12px",
    borderTop: "1px solid rgba(16,34,58,0.08)",
    background: "rgba(8,16,34,0.7)",
  },
  input: {
    flex: 1,
    background: "rgba(8,16,34,0.82)",
    border: "1px solid rgba(16,34,58,0.14)",
    borderRadius: 12,
    padding: "10px 12px",
    color: "var(--th-ink)",
    fontSize: 13.5,
    outline: "none",
    fontFamily: "'Manrope',sans-serif",
  },
  send: {
    minWidth: 66,
    height: 44,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    padding: "0 14px",
    boxShadow: "0 10px 20px rgba(16,34,58,0.22)",
  },
  footer: {
    textAlign: "center",
    fontSize: 10.5,
    color: "var(--th-muted)",
    padding: "9px 12px 12px",
  },
};

const Br = {
  wrap: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  urlRow: {
    display: "flex",
    gap: 8,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(16,34,58,0.08)",
  },
  urlIn: {
    flex: 1,
    background: "rgba(8,16,34,0.82)",
    border: "1px solid rgba(16,34,58,0.14)",
    borderRadius: 12,
    padding: "8px 10px",
    color: "var(--th-ink)",
    fontSize: 13,
    outline: "none",
  },
  go: {
    padding: "8px 14px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  bmarks: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
    gap: 8,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(16,34,58,0.08)",
  },
  bmark: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "10px 8px",
    borderRadius: 12,
    border: "1px solid rgba(16,34,58,0.12)",
    background: "rgba(8,16,34,0.74)",
    color: "var(--th-ink)",
    cursor: "pointer",
  },
  bmarkIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "1px solid rgba(16,34,58,0.16)",
    background: "rgba(8,16,34,0.92)",
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    display: "grid",
    placeItems: "center",
  },
  bmarkText: { fontSize: 11, color: "var(--th-muted)", textAlign: "center" },
  lockCard: {
    margin: "10px 12px",
    padding: 14,
    borderRadius: 14,
    background: "rgba(244,154,80,0.14)",
    border: "1px solid rgba(244,154,80,0.34)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  lockTitle: { fontSize: 13, fontWeight: 700, color: "#91511d" },
  lockText: { fontSize: 12, color: "rgba(16,34,58,0.82)" },
  unlockBtn: {
    padding: "9px 12px",
    borderRadius: 10,
    border: "none",
    background: "#91511d",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  frame: { flex: 1, border: "none", background: "#fff" },
  ph: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  phIcon: {
    width: 68,
    height: 68,
    borderRadius: 18,
    border: "1px solid rgba(16,34,58,0.16)",
    background: "rgba(8,16,34,0.92)",
    fontFamily: "'Space Grotesk',sans-serif",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 1.2,
    display: "grid",
    placeItems: "center",
    color: "var(--th-ink)",
  },
  phText: { fontSize: 13, color: "var(--th-muted)", textAlign: "center", lineHeight: 1.5 },
};

const E = {
  screen: { ...base, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 },
  title: { fontSize: 32, fontWeight: 700, color: "#b0523d", fontFamily: "'Space Grotesk',sans-serif" },
  sub: { fontSize: 14, color: "var(--th-muted)", textAlign: "center" },
  bucksBox: {
    width: "100%",
    maxWidth: 460,
    background: "rgba(8,16,34,0.78)",
    border: "1px solid rgba(16,34,58,0.13)",
    borderRadius: 14,
    padding: "14px 18px",
    textAlign: "center",
  },
  bucksNum: { fontSize: 32, fontWeight: 700, color: "var(--th-accent)", fontFamily: "'Space Grotesk',sans-serif" },
  bucksLbl: { fontSize: 11, color: "var(--th-muted)" },
  tip: { fontSize: 12, color: "var(--th-muted)", textAlign: "center", maxWidth: 520 },
  newBtn: {
    width: "100%",
    maxWidth: 460,
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};

const Mo = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(11,28,48,0.32)",
    zIndex: 1300,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 14,
    backdropFilter: "blur(8px)",
  },
  box: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(8,16,34,0.95)",
    border: "1px solid rgba(16,34,58,0.14)",
    borderRadius: 20,
    padding: 18,
    animation: "slideUp 0.2s ease",
    color: "var(--th-ink)",
  },
  title: { fontSize: 18, fontWeight: 700, color: "var(--th-ink)", marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" },
  rowStat: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    color: "rgba(16,34,58,0.9)",
    borderBottom: "1px solid rgba(16,34,58,0.08)",
  },
  bigNum: { fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: "var(--th-ink)" },
  convertBtn: {
    width: "100%",
    padding: 11,
    marginTop: 14,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  subHd: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 11,
    textTransform: "uppercase",
    color: "var(--th-muted)",
    letterSpacing: 1,
  },
  ruleRow: {
    fontSize: 12,
    color: "rgba(16,34,58,0.85)",
    padding: "6px 0",
    borderBottom: "1px solid rgba(16,34,58,0.06)",
  },
  close: {
    width: "100%",
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    border: "1px solid rgba(16,34,58,0.14)",
    background: "rgba(8,16,34,0.6)",
    color: "var(--th-muted)",
    cursor: "pointer",
  },
};

const AD = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1400,
    background: "rgba(16,34,58,0.68)",
    backdropFilter: "blur(6px)",
  },
};

const G = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
  },
  card: {
    background: "rgba(8,16,34,0.78)",
    border: "1px solid rgba(16,34,58,0.12)",
    borderRadius: 14,
    padding: 14,
  },
  title: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--th-ink)" },
  sub: { fontSize: 12.5, color: "var(--th-muted)", marginBottom: 10, lineHeight: 1.4 },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 8 },
  row: { display: "flex", gap: 8, alignItems: "center" },
  input: {
    width: "100%",
    background: "rgba(8,16,34,0.82)",
    border: "1px solid rgba(16,34,58,0.14)",
    borderRadius: 10,
    padding: "8px 10px",
    color: "var(--th-ink)",
    fontSize: 13,
    outline: "none",
    fontFamily: "'Manrope',sans-serif",
  },
  btnPrimary: {
    marginTop: 10,
    width: "100%",
    border: "none",
    borderRadius: 10,
    padding: "10px 12px",
    background: "linear-gradient(180deg,#0d7ec7 0%,#0b6eaf 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  btnSecondary: {
    border: "none",
    borderRadius: 10,
    padding: "9px 12px",
    background: "rgba(12,123,198,0.18)",
    color: "var(--th-accent-strong)",
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
  },
  list: { display: "flex", flexDirection: "column", gap: 8, marginTop: 8 },
  listItem: {
    border: "1px solid rgba(16,34,58,0.12)",
    background: "rgba(8,16,34,0.72)",
    borderRadius: 12,
    padding: 9,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  itemText: { fontSize: 12.5, color: "var(--th-ink)" },
  itemMeta: { fontSize: 10.5, color: "var(--th-muted)" },
  actionRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  linkBtn: {
    display: "inline-block",
    fontSize: 11,
    color: "var(--th-accent)",
    textDecoration: "none",
    border: "1px solid rgba(10,158,159,0.4)",
    borderRadius: 8,
    padding: "5px 8px",
  },
  inAppBadge: {
    fontSize: 11,
    color: "var(--th-accent-strong)",
    border: "1px solid rgba(12,123,198,0.4)",
    borderRadius: 8,
    padding: "5px 8px",
  },
  deleteBtn: {
    border: "1px solid rgba(191,84,63,0.35)",
    borderRadius: 8,
    background: "rgba(191,84,63,0.12)",
    color: "#b0523d",
    fontSize: 11,
    padding: "5px 8px",
    cursor: "pointer",
  },
  empty: { fontSize: 11.5, color: "var(--th-muted)" },
  resources: { display: "flex", flexDirection: "column", gap: 8 },
  resourceLink: { fontSize: 12, color: "var(--th-accent-strong)", textDecoration: "none" },
};

const P = {
  wrap: { flex: 1, padding: 12 },
  card: {
    background: "rgba(8,16,34,0.82)",
    border: "1px solid rgba(16,34,58,0.12)",
    borderRadius: 14,
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--th-ink)" },
  text: { fontSize: 13, color: "var(--th-muted)", lineHeight: 1.5, marginBottom: 6 },
};
