import { useState, useEffect, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { LoginForm } from "./Login";
import { RegisterForm } from "./Register";
import { AdminDashboard } from "./AdminDashboard";
import { AuthComponent } from "./Auth";
import { DataPurchase } from "./DataPurchase";
import DocumentStorage from "./DocumentStorage";
import { MidSessionAd } from "./MidSessionAd";
import { RemindersModule } from "./RemindersModule";
import { TokenWallet } from "./TokenWallet";

const SESSION_DURATION = 25 * 60;

// YouTube video IDs for demo ads (replace with real sponsor ad IDs for production)
// Using well-known short public YouTube videos as placeholders
const SPONSOR_VIDEOS = {
  vodacom: "JGwWNGJdvx8",  // Ed Sheeran - Shape Of You (demo)
  capitec: "kJQP7kiw5Fk",  // Despacito (demo)
  nsfas: "9bZkp7q19f0",  // PSY - Gangnam Style (demo)
  doh: "fJ9rUzIMcZQ",  // Queen - Bohemian Rhapsody (demo)
  mtn: "hT_nvWreIhg",  // Avengers theme (demo)
};

// Entry ad duration: 30 seconds (unskippable)
const ENTRY_AD_DURATION = 30;
// Mid-session ad interval: every 5 minutes (300s)
const MID_AD_INTERVAL = 5 * 60;

const SPONSORS = [
  { id: "vodacom", name: "Vodacom", tagline: "Connecting South Africa", color: "#E60000", logo: "📡", category: "Telecom", adText: "Stay connected with Vodacom's best data deals. Unlimited social media from R29/month.", cta: "Get a Deal" },
  { id: "capitec", name: "Capitec Bank", tagline: "Banking made simple", color: "#004A96", logo: "🏦", category: "Finance", adText: "Open a Capitec account in minutes. Zero monthly fees, instant EFTs, and cashback on every purchase.", cta: "Open Account" },
  { id: "nsfas", name: "NSFAS", tagline: "Funding your future", color: "#2d8a4e", logo: "🎓", category: "Education", adText: "Apply for NSFAS bursary funding for 2025. Covers tuition, accommodation & living allowance.", cta: "Apply Now" },
  { id: "doh", name: "Dept of Health", tagline: "Your health, our priority", color: "#8B2020", logo: "❤️", category: "Health", adText: "Free HIV testing & treatment at all public clinics. Know your status. Get on treatment. Live your life.", cta: "Find a Clinic" },
  { id: "mtn", name: "MTN", tagline: "Everywhere you go", color: "#cc9900", logo: "📶", category: "Telecom", adText: "MTN Pulse: Designed for youth. Get 1GB night data for just R10. Stream, chat, learn — all night long.", cta: "Get Pulse" },
];

// Modules available for free (during 25-min session) vs requiring ThreviaBucks
const FREE_MODULES = new Set(["chat", "sexual", "mental", "skills", "map", "documents", "reminders"]);
const GATED_MODULE_COST = { browser: 100, data: 75, wallet: 0 };

const SYSTEM_PROMPT = `You are the Threvia Intelligence Engine. Compassionate, evidence-based, judgment-free. Peer-to-peer tone — never preachy. Users are South African youth, often on mobile while commuting.

CRISIS PROTOCOL: If user expresses self-harm or suicidal thoughts → immediately give: Lifeline SA: 0861 322 322 | SMS 31393. Global: Text HOME to 741741.

MODULES:
- Sexual Health: Safe sex, consent, STI prevention, period tracking. Educational only, non-graphic.
- Mental Health: Stress, anxiety, motivation, coping strategies.
- Skills Hub: CV help, bursaries, matric tips, interview prep.
- Help Map: Nearest clinics, youth centers, health services.

Keep responses SHORT and warm. Users earn ThreviaBucks for health engagement.
COMPLIANCE: POPIA + GDPR. Youth-safe content only.`;

const MODULES = [
  { id: "chat", icon: "💬", label: "Threvia" },
  { id: "sexual", icon: "🌿", label: "Sexual Health" },
  { id: "mental", icon: "🧠", label: "Mind & Mood" },
  { id: "skills", icon: "🎓", label: "Skills Hub" },
  { id: "map", icon: "📍", label: "Help Map" },
  { id: "reminders", icon: "🔔", label: "Reminders" },
  { id: "browser", icon: "🌐", label: "Browser 🔒" },
  { id: "documents", icon: "📚", label: "My Docs" },
  { id: "data", icon: "📊", label: "Buy Data 🔒" },
  { id: "wallet", icon: "💎", label: "Wallet" },
];

const QUICK_PROMPTS = {
  sexual: ["How do I track my period?", "What is PrEP?", "Where can I get free condoms?", "Signs of an STI?"],
  mental: ["I'm really stressed out", "Give me a daily motivation", "How do I handle exam anxiety?", "I need to talk to someone"],
  skills: ["Help me write a CV", "What bursaries exist in SA?", "Study tips for matric", "Job interview prep"],
  map: ["Find a clinic near me", "Nearest youth center?", "Free HIV testing", "Mental health services nearby"],
};

const BOOKMARKS = [
  { label: "WHO Health", url: "https://www.who.int", icon: "🏥" },
  { label: "UNICEF SA", url: "https://www.unicef.org/southafrica", icon: "🌍" },
  { label: "NSFAS Apply", url: "https://www.nsfas.org.za", icon: "🎓" },
  { label: "SA Youth Jobs", url: "https://www.sayouth.mobi", icon: "💼" },
  { label: "Lifeline SA", url: "https://lifelinesa.co.za", icon: "❤️" },
  { label: "Health ZA", url: "https://www.health.gov.za", icon: "💊" },
];

// ── SCREEN 1: Ad Loading (auto-picks random sponsor) ───────────────────────
function AdLoading({ onReady }) {
  const [sponsor] = useState(() => SPONSORS[Math.floor(Math.random() * SPONSORS.length)]);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) { onReady(sponsor); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  return (
    <div style={S.screen}>
      <div style={S.wifiBadge}>📶 THREVIA FREE Wi-Fi</div>
      <div style={S.heroTitle}>
        Watch an ad,<br />get <span style={{ color: "#00f5a0" }}>25 minutes</span><br />free internet.
      </div>
      <div style={S.heroSub}>A short ad will play to unlock your session</div>

      {/* Sponsor preview */}
      <div style={{ ...S.sponsorPreview, borderColor: `${sponsor.color}44`, background: `${sponsor.color}12` }}>
        <span style={{ fontSize: 36 }}>{sponsor.logo}</span>
        <div>
          <div style={S.previewName}>{sponsor.name}</div>
          <div style={S.previewTag}>{sponsor.tagline}</div>
          <div style={{ ...S.previewTag, color: sponsor.color, fontWeight: 700, marginTop: 4, fontFamily: "'Space Mono',monospace" }}>
            {ENTRY_AD_DURATION}s ad · Earn 50 ThreviaBucks
          </div>
        </div>
      </div>

      <div style={S.loadingPill}>
        <div style={{ ...S.loadDot, animationDelay: "0s" }} />
        <div style={{ ...S.loadDot, animationDelay: "0.2s" }} />
        <div style={{ ...S.loadDot, animationDelay: "0.4s" }} />
        <span style={S.loadText}>Ad starting in {countdown}s...</span>
      </div>

      <div style={S.reward}>
        <span style={{ fontSize: 30 }}>🎁</span>
        <div>
          <div style={S.rewardLbl}>Watch the ad to unlock</div>
          <div style={S.rewardVal}>25 Minutes Free Internet</div>
        </div>
      </div>

      <div style={S.legal}>🔒 Anonymous · POPIA compliant · No data sold</div>
      <style>{globalCss}</style>
    </div>
  );
}

// ── SCREEN 2: Ad Player (YouTube, unskippable, earns 50 ThreviaBucks) ────────
function AdPlayer({ sponsor, onDone }) {
  const [t, setT] = useState(ENTRY_AD_DURATION);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (t <= 0) { setDone(true); return; }
    const id = setTimeout(() => setT((p) => p - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);

  const pct = ((ENTRY_AD_DURATION - t) / ENTRY_AD_DURATION) * 100;
  const videoId = SPONSOR_VIDEOS[sponsor.id] || "dQw4w9WgXcQ";
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <div style={{ ...A.screen, background: `linear-gradient(160deg,#06080f,${sponsor.color}18)` }}>
      {/* Sponsor header */}
      <div style={{ ...A.banner, background: sponsor.color }}>
        <span style={{ fontSize: 28 }}>{sponsor.logo}</span>
        <div style={{ flex: 1 }}>
          <div style={A.bannerName}>{sponsor.name}</div>
          <div style={A.bannerTag}>{sponsor.tagline}</div>
        </div>
        <div style={A.adBadge}>AD</div>
      </div>

      {/* YouTube embed */}
      <div style={A.videoWrap}>
        <iframe
          src={embedUrl}
          style={A.iframe}
          title="Sponsored Ad"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          sandbox="allow-scripts allow-same-origin"
        />
        {/* Block user interaction with iframe controls */}
        {!done && <div style={A.videoBlock} />}
      </div>

      {/* Progress bar */}
      <div style={A.progWrap}>
        <div style={A.progTrack}>
          <div style={{ ...A.progFill, width: `${pct}%`, background: sponsor.color }} />
        </div>
        <div style={A.progLbl}>{done ? "✅ Ad complete! 50 ThreviaBucks earned" : `🚫 ${t}s remaining — ad cannot be skipped`}</div>
      </div>

      {/* Reward */}
      <div style={A.reward}>
        <span style={{ fontSize: 30 }}>⏱️</span>
        <div>
          <div style={A.rewardLbl}>Watch the full ad to unlock</div>
          <div style={A.rewardVal}>25 Minutes Free Internet + 50 ThreviaBucks</div>
        </div>
      </div>

      {done ? (
        <button style={A.unlockBtn} onClick={onDone}>🚀 Unlock My 25-Minute Session →</button>
      ) : (
        <div style={A.waitMsg}>Please watch the full ad — this earns you free internet access</div>
      )}
      <div style={A.powered}>Powered by Threvia · Free internet for South African youth</div>
    </div>
  );
}

// ── SCREEN 3: Main App ──────────────────────────────────────────────────────
function MainApp({ sponsor, user, onLogout }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [expired, setExpired] = useState(false);
  const [module, setModule] = useState("chat");
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Session unlocked! 🎉 Thanks to ${sponsor.name}, you've got 25 minutes of free internet.\n\nI'm Threvia — your peer guide for health, skills & wellbeing. What's on your mind?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bucks, setBucks] = useState(50); // Start with 50 from entry ad
  const [toast, setToast] = useState(null);
  const [showBucksModal, setShowBucksModal] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("");
  const [browserInput, setBrowserInput] = useState("https://");
  const [showMidAd, setShowMidAd] = useState(false);
  const [midAdSponsor, setMidAdSponsor] = useState(null);
  const [nextMidAd, setNextMidAd] = useState(MID_AD_INTERVAL); // countdown to next mid ad
  const [gatedModal, setGatedModal] = useState(null); // which gated module was attempted
  const [preAdWarning, setPreAdWarning] = useState(false);
  const chatEnd = useRef(null);

  // Session countdown
  useEffect(() => {
    if (expired) return;
    if (timeLeft <= 0) { setExpired(true); return; }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, expired]);

  // Mid-session ad interval (every 5 minutes)
  useEffect(() => {
    if (expired || showMidAd) return;
    if (nextMidAd <= 30 && !preAdWarning) setPreAdWarning(true);
    if (nextMidAd <= 0) {
      setPreAdWarning(false);
      const randomSponsor = SPONSORS[Math.floor(Math.random() * SPONSORS.length)];
      setMidAdSponsor(randomSponsor);
      setShowMidAd(true);
      setNextMidAd(MID_AD_INTERVAL);
      return;
    }
    const id = setTimeout(() => setNextMidAd((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [nextMidAd, expired, showMidAd, preAdWarning]);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const timePct = (timeLeft / SESSION_DURATION) * 100;
  const bucksPct = Math.min((bucks / 50) * 100, 100);
  const timerColor = timePct > 25 ? "#00f5a0" : timePct > 10 ? "#ffc107" : "#ff4444";

  const earnBucks = (n) => {
    setBucks((b) => b + n);
    setToast(`+${n} ThreviaBucks! 🎉`);
    setTimeout(() => setToast(null), 2500);
  };

  const spendBucks = (n) => {
    setBucks((b) => Math.max(0, b - n));
  };

  const switchModule = (id) => {
    // Check if gated module and user doesn't have enough bucks
    if (!FREE_MODULES.has(id) && GATED_MODULE_COST[id]) {
      if (bucks < GATED_MODULE_COST[id]) {
        setGatedModal(id);
        return;
      }
    }
    setModule(id);
    if (id === "chat" || id === "browser" || id === "data" || id === "reminders" || id === "wallet" || id === "documents") return;
    const intros = {
      sexual: "Sexual Health space 🌿 Everything here is 100% anonymous. What would you like to know?",
      mental: "Mind & Mood 🧠 This is a safe space. How are you feeling today?",
      skills: "Skills Hub 🎓 CV help, bursaries, matric tips — let's build your future. What do you need?",
      map: "Help Map 📍 Tell me your area and I'll help you find clinics, youth centers, and free health services.",
    };
    setMessages([{ role: "assistant", content: intros[id] }]);
    earnBucks(10);
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const updated = [...messages, { role: "user", content: msg }];
    setMessages(updated);
    setLoading(true);
    const kw = ["health", "sex", "period", "mental", "stress", "hiv", "sti", "condom", "clinic", "cv", "bursary", "study", "anxiety", "consent", "prep"];
    if (kw.some((k) => msg.toLowerCase().includes(k))) setTimeout(() => earnBucks(15), 900);

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
      setMessages((p) => [...p, { role: "assistant", content: data.content?.[0]?.text || "Sorry, try again?" }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection issue — try again in a moment. 🔄" }]);
    }
    setLoading(false);
  };

  // ── Session Expired ──
  if (expired) {
    return (
      <div style={E.screen}>
        <div style={{ fontSize: 64 }}>⏰</div>
        <div style={E.title}>Session Ended</div>
        <div style={E.sub}>Your 25-minute free session has expired.</div>
        <div style={E.bucksBox}>
          <div style={E.bucksNum}>{bucks}</div>
          <div style={E.bucksLbl}>ThreviaBucks earned this session</div>
        </div>
        {bucks >= 50 && !redeemed && (
          <button style={E.redeemBtn} onClick={() => { setBucks((b) => b - 50); setRedeemed(true); }}>
            🚀 Redeem 60MB Extra Data
          </button>
        )}
        {redeemed && <div style={{ color: "#00f5a0", fontWeight: 700, fontSize: 15 }}>✅ 60MB unlocked! Enjoy.</div>}
        <div style={E.tip}>Watch another ad to unlock a new session</div>
        <button style={E.newBtn} onClick={() => window.location.reload()}>Watch New Ad →</button>
        <style>{globalCss}</style>
      </div>
    );
  }

  // ── Gated module modal ──
  const GatedModal = gatedModal ? (
    <div style={Mo.overlay} onClick={() => setGatedModal(null)}>
      <div style={Mo.box} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🔒</div>
        <div style={{ ...Mo.title, textAlign: "center" }}>Premium Feature</div>
        <div style={{ fontSize: 13, color: "rgba(232,240,254,0.55)", textAlign: "center", margin: "8px 0 16px", lineHeight: 1.6 }}>
          You need <strong style={{ color: "#00f5a0" }}>{GATED_MODULE_COST[gatedModal]} ThreviaBucks</strong> to access this feature.
          You currently have <strong style={{ color: "#ffc107" }}>{bucks} ThreviaBucks</strong>.
        </div>
        <div style={{ fontSize: 11.5, color: "rgba(232,240,254,0.35)", textAlign: "center", marginBottom: 16 }}>
          Earn more by engaging with health content, watching ads, and using reminders.
        </div>
        <button style={{ ...Mo.close, background: "rgba(0,245,160,0.08)", color: "#00f5a0", border: "1px solid rgba(0,245,160,0.2)" }} onClick={() => setGatedModal(null)}>Got it</button>
      </div>
    </div>
  ) : null;

  return (
    <div style={M.wrap}>
      {/* ── Mid-session Ad Overlay ── */}
      {showMidAd && (
        <MidSessionAd
          sponsor={midAdSponsor}
          onComplete={() => {
            setShowMidAd(false);
            setMidAdSponsor(null);
            earnBucks(30);
          }}
        />
      )}

      {/* ── Gated Modal ── */}
      {GatedModal}

      {/* ── Pre-ad Warning Banner ── */}
      {preAdWarning && !showMidAd && (
        <div style={M.adWarning}>
          📺 Sponsor ad in {nextMidAd}s — earn +30 ThreviaBucks!
        </div>
      )}

      {/* ── Timer Bar ── */}
      <div style={M.timerBar}>
        <div style={M.timerLeft}>
          <div style={{ ...M.dot, background: timerColor }} />
          <div>
            <div style={{ ...M.time, color: timerColor }}>{mins}:{secs}</div>
            <div style={M.timeLbl}>session left</div>
          </div>
        </div>
        <div style={M.sponsorChip}>
          <span>{sponsor.logo}</span>
          <span style={{ fontSize: 11, color: "rgba(232,240,254,0.45)" }}>{sponsor.name}</span>
        </div>
        <div style={M.bucksChip} onClick={() => setShowBucksModal(true)}>
          <span style={M.bucksNum}>{bucks}</span>
          <span style={M.bucksLbl}>Bucks</span>
        </div>
        <div style={{ ...M.bucksChip, marginLeft: 'auto', background: 'rgba(0,217,245,0.15)' }}>
          <span style={{ fontSize: 12 }}>{user?.name?.split(' ')[0]}</span>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(232,240,254,0.8)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: 14,
              fontWeight: 700,
              transition: 'all 0.3s',
              borderRadius: '4px',
              marginLeft: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,68,68,0.2)';
              e.currentTarget.style.color = '#ff5555';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'rgba(232,240,254,0.8)';
            }}
          >
            🚪
          </button>
        </div>
      </div>
      {/* progress strip */}
      <div style={M.strip}>
        <div style={{ ...M.stripFill, width: `${timePct}%`, background: timerColor }} />
      </div>

      {toast && <div style={M.toast}>{toast}</div>}

      {/* ── Module Nav ── */}
      <div style={M.nav}>
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => switchModule(m.id)}
            style={{ ...M.navBtn, ...(module === m.id ? M.navBtnOn : {}) }}
          >
            <span style={{ fontSize: 15 }}>{m.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.4 }}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* ── Browser ── */}
      {module === "browser" ? (
        <div style={Br.wrap}>
          <div style={Br.urlRow}>
            <input
              style={Br.urlIn}
              value={browserInput}
              onChange={(e) => setBrowserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setBrowserUrl(browserInput)}
              placeholder="Enter URL..."
            />
            <button style={Br.go} onClick={() => setBrowserUrl(browserInput)}>Go</button>
          </div>
          <div style={Br.bmarks}>
            {BOOKMARKS.map((b) => (
              <button
                key={b.url}
                style={Br.bmark}
                onClick={() => { setBrowserInput(b.url); setBrowserUrl(b.url); earnBucks(5); }}
              >
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                <span style={{ fontSize: 9, color: "rgba(232,240,254,0.45)", textAlign: "center" }}>{b.label}</span>
              </button>
            ))}
          </div>
          {browserUrl
            ? <iframe src={browserUrl} style={Br.frame} title="browser" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            : (
              <div style={Br.ph}>
                <div style={{ fontSize: 50 }}>🌐</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(232,240,254,0.5)" }}>Open Internet</div>
                <div style={{ fontSize: 12, color: "rgba(232,240,254,0.28)", textAlign: "center", lineHeight: 1.6 }}>
                  Enter a URL or tap a bookmark to browse freely during your 25-minute session
                </div>
              </div>
            )}
        </div>
      ) : module === "documents" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          <DocumentStorage user={user} />
        </div>
      ) : module === "reminders" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <RemindersModule />
        </div>
      ) : module === "wallet" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TokenWallet
            bucks={bucks}
            onRedeem={(bucksCost, threvAmt) => {
              spendBucks(bucksCost);
              if (threvAmt > 0) setToast(`✅ ${threvAmt} THREV converted!`);
              else setToast(`✅ Redeemed!`);
              setTimeout(() => setToast(null), 3000);
            }}
          />
        </div>
      ) : module === "data" ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
          <DataPurchase
            userAddress={user?.address}
            userBucks={bucks}
            onPurchaseComplete={(data) => {
              setToast(`✅ ${data.package.dataSize} activated!`);
              if (data.paymentMethod === 'bucks') {
                setBucks((b) => Math.max(0, b - data.bucksSpent));
              }
              setTimeout(() => setToast(null), 3000);
            }}
          />
        </div>
      ) : (
        <>
          {/* Quick prompts */}
          {module !== "chat" && QUICK_PROMPTS[module] && (
            <div style={M.qrow}>
              {QUICK_PROMPTS[module].map((q) => (
                <button key={q} style={M.qbtn} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* Chat */}
          <div style={M.chat}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...M.row, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && <div style={M.avatar}>T</div>}
                <div style={{ ...M.bubble, ...(m.role === "user" ? M.uBubble : M.aBubble) }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...M.row, justifyContent: "flex-start" }}>
                <div style={M.avatar}>T</div>
                <div style={{ ...M.bubble, ...M.aBubble }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5a0", animation: `blink 1.4s ${d}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          {/* Input */}
          <div style={M.inputRow}>
            <input
              style={M.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything — it's anonymous..."
            />
            <button style={M.send} onClick={() => send()}>➤</button>
          </div>
        </>
      )}

      <div style={M.footer}>🔒 Anonymous & private · POPIA compliant · Your data, your rights</div>

      {/* ── Bucks Modal ── */}
      {showBucksModal && (
        <div style={Mo.overlay} onClick={() => setShowBucksModal(false)}>
          <div style={Mo.box} onClick={(e) => e.stopPropagation()}>
            <div style={Mo.title}>💰 ThreviaBucks</div>
            <div style={Mo.big}>{bucks}</div>
            <div style={Mo.track}><div style={{ ...Mo.fill, width: `${bucksPct}%` }} /></div>
            <div style={Mo.trackLbl}>{Math.min(bucks, 50)}/50 bucks → 60MB extra data</div>
            {bucks >= 50 && !redeemed
              ? <button style={Mo.redeemBtn} onClick={() => { setBucks((b) => b - 50); setRedeemed(true); }}>🚀 Redeem 60MB Data</button>
              : redeemed && <div style={Mo.redeemed}>✅ 60MB unlocked! Enjoy.</div>}
            <div style={Mo.subHd}>Ways to earn</div>
            {[["Engage with health content", "15"], ["Switch to a wellness module", "10"], ["Watch a sponsor ad", "30"], ["Complete health quiz", "25"], ["Browse bookmarked sites", "5"]].map(([l, a]) => (
              <div key={l} style={Mo.row}>
                <span style={{ fontSize: 12.5, color: "rgba(232,240,254,0.6)" }}>{l}</span>
                <span style={Mo.amt}>+{a}</span>
              </div>
            ))}
            <button style={Mo.close} onClick={() => setShowBucksModal(false)}>Close</button>
          </div>
        </div>
      )}

      <style>{globalCss}</style>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function Threvia() {
  // Stages: 'login' | 'admin' | 'adloading' | 'ad' | 'app'
  const [stage, setStage] = useState("login");
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [sponsor, setSponsor] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    sdk.actions.ready();
    // Check if user is already authenticated
    const storedUser = localStorage.getItem('threviaCurrentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        if (userData.email === 'admin@threvia.app') {
          setStage("admin");
        } else {
          // Always re-show ad on login (no session persistence)
          setStage("adloading");
        }
      } catch (e) {
        console.log('Failed to restore user session');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.email === 'admin@threvia.app') {
      setStage("admin");
    } else {
      setStage("adloading"); // -> random sponsor auto-selected -> ad
    }
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setStage("adloading");
  };

  const handleLogout = () => {
    localStorage.removeItem('threviaCurrentUser');
    setUser(null);
    setStage("login");
    setAuthMode("login");
  };

  // Authentication screens
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

  // Admin dashboard
  if (stage === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Verify user exists before proceeding
  if (!user) {
    return <LoginForm
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={() => {
        setAuthMode("register");
        setStage("login");
      }}
    />;
  }

  // Ad loading screen (auto-picks random sponsor, 3s countdown)
  if (stage === "adloading") {
    return <AdLoading onReady={(s) => { setSponsor(s); setStage("ad"); }} />;
  }

  // YouTube ad (unskippable)
  if (stage === "ad") return <AdPlayer sponsor={sponsor} onDone={() => setStage("app")} />;

  // Main app
  return <MainApp sponsor={sponsor} user={user} onLogout={handleLogout} />;
}

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#06080f;font-family:'Sora',sans-serif}

  /* ── Animations ── */
  @keyframes blink{0%,80%,100%{opacity:.2;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}
  @keyframes bounceIn{0%{opacity:0;transform:scale(.7)}60%{transform:scale(1.06)}80%{transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
  @keyframes neonPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.4),0 0 10px rgba(139,92,246,.15)}50%{box-shadow:0 0 0 8px rgba(139,92,246,0),0 0 24px rgba(139,92,246,.35)}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,245,160,.35)}50%{box-shadow:0 0 0 10px rgba(0,245,160,0)}}
  @keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes ripple{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}
  @keyframes typewriter{0%{width:0}100%{width:100%}}
  @keyframes messagePop{0%{opacity:0;transform:translateY(10px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}

  /* ── Hover micro-interactions ── */
  button:active{transform:scale(.96)!important;transition:transform .1s!important}

  /* ── Scrollbar ── */
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(139,92,246,.25);border-radius:4px}
`;

// ── STYLE OBJECTS ─────────────────────────────────────────────────────────────
const base = {
  fontFamily: "'Sora',sans-serif",
  background: "linear-gradient(160deg,#06080f 0%,#0a1220 100%)",
  minHeight: "100vh", maxWidth: 480, margin: "0 auto",
  color: "#e8f0fe", display: "flex", flexDirection: "column",
  overflow: "hidden", position: "relative",
};

// Ad Loading / Sponsor Preview
const S = {
  screen: { ...base, alignItems: "center", padding: "0 0 36px", animation: "fadeIn 0.5s ease" },
  wifiBadge: {
    background: "rgba(0,245,160,0.1)", border: "1px solid rgba(0,245,160,0.25)",
    color: "#00f5a0", fontSize: 10, fontWeight: 700, letterSpacing: 2,
    padding: "6px 18px", borderRadius: 99, marginTop: 40, marginBottom: 30,
    textTransform: "uppercase", animation: "float 3s ease-in-out infinite",
  },
  heroTitle: { fontSize: 33, fontWeight: 700, lineHeight: 1.18, textAlign: "center", padding: "0 24px", marginBottom: 10, animation: "slideUp 0.5s ease" },
  heroSub: { fontSize: 13, color: "rgba(232,240,254,0.4)", textAlign: "center", marginBottom: 24, animation: "slideUp 0.6s ease" },
  sponsorPreview: {
    display: "flex", alignItems: "center", gap: 14,
    margin: "0 20px 20px", padding: "18px 20px",
    border: "1.5px solid", borderRadius: 18, width: "calc(100% - 40px)",
    animation: "scaleIn 0.45s ease",
  },
  previewName: { fontWeight: 700, fontSize: 16, color: "#e8f0fe", fontFamily: "'Sora',sans-serif", marginBottom: 2 },
  previewTag: { fontSize: 11, color: "rgba(232,240,254,0.4)", fontFamily: "'Sora',sans-serif" },
  loadingPill: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.04)", borderRadius: 99, padding: "8px 18px",
    marginBottom: 20, animation: "fadeIn 0.8s ease",
  },
  loadDot: {
    width: 7, height: 7, borderRadius: "50%", background: "#00f5a0",
    animation: "blink 1.4s infinite",
  },
  loadText: { fontSize: 12, color: "rgba(232,240,254,0.45)", fontFamily: "'Sora',sans-serif" },
  reward: {
    display: "flex", alignItems: "center", gap: 14,
    background: "rgba(0,245,160,0.06)", border: "1px solid rgba(0,245,160,0.18)",
    borderRadius: 14, padding: "14px 20px", margin: "0 20px 20px", width: "calc(100% - 40px)",
    animation: "slideUp 0.7s ease",
  },
  rewardLbl: { fontSize: 10, color: "rgba(0,245,160,0.55)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Sora',sans-serif" },
  rewardVal: { fontSize: 15, fontWeight: 700, color: "#00f5a0", fontFamily: "'Space Mono',monospace" },
  legal: { fontSize: 9.5, color: "rgba(232,240,254,0.2)", marginTop: 4, textAlign: "center" },
};

// Ad Player (YouTube fullscreen layout)
const A = {
  screen: { ...base, padding: "0", alignItems: "stretch", justifyContent: "flex-start", gap: 0 },
  banner: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", flexShrink: 0 },
  bannerName: { fontWeight: 700, fontSize: 14, color: "#fff", fontFamily: "'Sora',sans-serif" },
  bannerTag: { fontSize: 10, color: "rgba(255,255,255,0.55)", fontFamily: "'Sora',sans-serif" },
  adBadge: { marginLeft: "auto", background: "rgba(255,255,255,0.22)", borderRadius: 6, padding: "2px 8px", fontSize: 9.5, fontWeight: 700, color: "#fff", letterSpacing: 1 },
  videoWrap: { position: "relative", width: "100%", paddingBottom: "56.25%", flexShrink: 0, background: "#000" },
  iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" },
  videoBlock: { position: "absolute", top: 0, left: 0, right: 0, bottom: "15%", zIndex: 2, cursor: "not-allowed" },
  progWrap: { padding: "10px 16px 6px", flexShrink: 0 },
  progTrack: { height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden", marginBottom: 5 },
  progFill: { height: "100%", borderRadius: 99, transition: "width 1s linear" },
  progLbl: { fontSize: 10.5, color: "rgba(232,240,254,0.35)", textAlign: "center", fontFamily: "'Sora',sans-serif" },
  reward: {
    display: "flex", alignItems: "center", gap: 12, margin: "8px 16px",
    background: "rgba(0,245,160,0.06)", border: "1px solid rgba(0,245,160,0.18)",
    borderRadius: 12, padding: "12px 16px", flexShrink: 0,
  },
  rewardLbl: { fontSize: 10, color: "rgba(0,245,160,0.55)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Sora',sans-serif" },
  rewardVal: { fontSize: 13, fontWeight: 700, color: "#00f5a0", fontFamily: "'Space Mono',monospace" },
  unlockBtn: {
    margin: "8px 16px", padding: "13px", borderRadius: 13,
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    border: "none", color: "#06080f", fontWeight: 700, fontSize: 14, cursor: "pointer",
    animation: "glowPulse 2.5s infinite", fontFamily: "'Sora',sans-serif", flexShrink: 0,
  },
  waitMsg: { fontSize: 11.5, color: "rgba(232,240,254,0.28)", textAlign: "center", padding: "8px 16px", fontFamily: "'Sora',sans-serif", flexShrink: 0 },
  powered: { fontSize: 9.5, color: "rgba(232,240,254,0.18)", textAlign: "center", padding: "6px", flexShrink: 0, fontFamily: "'Sora',sans-serif" },
};

// Main App
const M = {
  wrap: { ...base },
  adWarning: {
    background: "linear-gradient(90deg,rgba(255,165,0,0.15),rgba(255,165,0,0.08))",
    border: "1px solid rgba(255,165,0,0.3)",
    color: "#ffc107", fontSize: 11.5, fontWeight: 600, textAlign: "center",
    padding: "7px 16px", fontFamily: "'Sora',sans-serif", flexShrink: 0,
    animation: "slideDown 0.35s ease",
  },
  timerBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 15px 8px",
    background: "rgba(6,4,18,0.97)", backdropFilter: "blur(14px)",
    borderBottom: "1px solid rgba(139,92,246,0.12)",
    animation: "slideDown 0.4s ease",
  },
  timerLeft: { display: "flex", alignItems: "center", gap: 8 },
  dot: { width: 9, height: 9, borderRadius: "50%", animation: "neonPulse 2s infinite" },
  time: { fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, lineHeight: 1 },
  timeLbl: { fontSize: 8.5, color: "rgba(232,240,254,0.28)", textTransform: "uppercase", letterSpacing: 1 },
  sponsorChip: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "4px 10px",
    fontSize: 11,
  },
  bucksChip: {
    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
    borderRadius: 20, padding: "4px 12px", cursor: "pointer", textAlign: "center",
    transition: "all 0.2s",
  },
  bucksNum: { fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: "#c084fc", display: "block" },
  bucksLbl: { fontSize: 7.5, color: "rgba(192,132,252,0.55)", textTransform: "uppercase", letterSpacing: 1 },
  strip: { height: 4, background: "rgba(139,92,246,0.06)", overflow: "hidden" },
  stripFill: { height: "100%", transition: "width 1s linear, background 2s" },
  toast: {
    position: "fixed", top: 65, left: "50%", transform: "translateX(-50%)",
    background: "linear-gradient(135deg,#8b5cf6,#a855f7)", color: "#fff",
    padding: "9px 22px", borderRadius: 99, fontWeight: 700, fontSize: 13,
    zIndex: 999, whiteSpace: "nowrap", animation: "bounceIn 0.4s ease",
    boxShadow: "0 4px 24px rgba(139,92,246,0.55)",
  },
  nav: {
    display: "flex", overflowX: "auto", gap: 5, padding: "9px 12px",
    borderBottom: "1px solid rgba(139,92,246,0.1)", scrollbarWidth: "none",
    background: "rgba(6,4,18,0.6)",
  },
  navBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    padding: "7px 11px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.055)", background: "rgba(255,255,255,0.02)",
    color: "rgba(232,240,254,0.38)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
    transition: "all 0.22s ease",
  },
  navBtnOn: { border: "1px solid rgba(139,92,246,0.45)", background: "rgba(139,92,246,0.12)", color: "#c084fc", boxShadow: "0 0 12px rgba(139,92,246,0.25)" },
  qrow: { display: "flex", flexWrap: "wrap", gap: 5, padding: "8px 13px", borderBottom: "1px solid rgba(139,92,246,0.07)" },
  qbtn: {
    background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 20, color: "#c084fc", fontSize: 11, padding: "5px 12px", cursor: "pointer",
    transition: "all 0.18s", animation: "scaleIn 0.25s ease",
  },
  chat: {
    flex: 1, overflowY: "auto", padding: "13px",
    display: "flex", flexDirection: "column", gap: 10,
    scrollbarWidth: "thin", scrollbarColor: "rgba(139,92,246,0.2) transparent",
    background: "linear-gradient(180deg,rgba(10,8,20,0) 0%,rgba(20,8,40,0.15) 100%)",
  },
  row: { display: "flex", alignItems: "flex-end", gap: 7, animation: "messagePop 0.28s ease" },
  avatar: {
    width: 28, height: 28, borderRadius: 9,
    background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
    fontFamily: "'Space Mono',monospace",
    boxShadow: "0 0 12px rgba(139,92,246,0.55)",
    animation: "neonPulse 3s infinite",
  },
  bubble: { maxWidth: "80%", padding: "10px 13px", borderRadius: 16, fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap", animation: "messagePop 0.28s ease" },
  aBubble: { background: "rgba(139,92,246,0.09)", border: "1px solid rgba(139,92,246,0.2)", borderBottomLeftRadius: 4, color: "#e8f0fe" },
  uBubble: { background: "linear-gradient(135deg,rgba(139,92,246,0.16),rgba(168,85,247,0.12))", border: "1px solid rgba(168,85,247,0.28)", borderBottomRightRadius: 4, color: "#e8f0fe" },
  inputRow: {
    display: "flex", gap: 9, padding: "10px 13px",
    borderTop: "1px solid rgba(139,92,246,0.15)",
    background: "rgba(6,4,18,0.97)",
    backdropFilter: "blur(12px)",
  },
  input: {
    flex: 1, background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.22)",
    borderRadius: 11, padding: "10px 13px", color: "#e8f0fe", fontSize: 13.5, outline: "none",
    fontFamily: "'Sora',sans-serif",
    transition: "border-color 0.25s, box-shadow 0.25s",
  },
  send: {
    width: 42, height: 42, borderRadius: 11,
    background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
    border: "none", cursor: "pointer", fontSize: 15, color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0,
    boxShadow: "0 0 12px rgba(139,92,246,0.5)",
    transition: "box-shadow 0.3s, transform 0.15s",
  },
  footer: { textAlign: "center", fontSize: 9.5, color: "rgba(232,240,254,0.16)", padding: "5px 14px 8px", letterSpacing: 0.3 },
};

// Browser
const Br = {
  wrap: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  urlRow: { display: "flex", gap: 8, padding: "9px 13px", borderBottom: "1px solid rgba(255,255,255,0.045)" },
  urlIn: {
    flex: 1, background: "rgba(255,255,255,0.046)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10, padding: "8px 12px", color: "#e8f0fe", fontSize: 12, outline: "none",
    fontFamily: "'Sora',sans-serif",
  },
  go: {
    padding: "8px 16px", borderRadius: 10,
    background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
    border: "none", color: "#06080f", fontWeight: 700, fontSize: 12, cursor: "pointer",
    fontFamily: "'Sora',sans-serif",
  },
  bmarks: {
    display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, padding: "9px 13px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  bmark: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "10px 6px", borderRadius: 10,
    background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.055)",
    cursor: "pointer", color: "#e8f0fe", transition: "all 0.2s",
  },
  frame: { flex: 1, border: "none", background: "#fff" },
  ph: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 12, padding: 28,
  },
};

// Session Expired
const E = {
  screen: { ...base, alignItems: "center", justifyContent: "center", padding: 28, gap: 16, animation: "bounceIn 0.6s ease" },
  title: { fontFamily: "'Space Mono',monospace", fontSize: 26, fontWeight: 700, color: "#ff6b6b", animation: "slideDown 0.35s ease" },
  sub: { fontSize: 14, color: "rgba(232,240,254,0.4)", textAlign: "center" },
  bucksBox: { background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: 16, padding: "18px 32px", textAlign: "center", animation: "scaleIn 0.5s ease" },
  bucksNum: { fontFamily: "'Space Mono',monospace", fontSize: 42, fontWeight: 700, color: "#c084fc" },
  bucksLbl: { fontSize: 12, color: "rgba(192,132,252,0.5)", marginTop: 4 },
  redeemBtn: {
    width: "100%", padding: "13px", borderRadius: 13,
    background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
    border: "none", color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
    fontFamily: "'Sora',sans-serif", boxShadow: "0 0 20px rgba(139,92,246,0.4)",
    animation: "neonPulse 2.5s infinite",
  },
  tip: { fontSize: 12, color: "rgba(232,240,254,0.28)", textAlign: "center" },
  newBtn: {
    width: "100%", padding: "12px", borderRadius: 13,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(232,240,254,0.5)", fontSize: 13.5, cursor: "pointer",
    fontFamily: "'Sora',sans-serif",
  },
};

// Bucks Modal
const Mo = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(10px)", zIndex: 100,
    display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16,
    animation: "fadeIn 0.25s ease",
  },
  box: {
    background: "linear-gradient(160deg,#0d0a1e,#0a1220)", border: "1px solid rgba(139,92,246,0.25)",
    borderRadius: 20, padding: 22, width: "100%", maxWidth: 440, animation: "slideUp 0.35s ease",
    boxShadow: "0 -4px 40px rgba(139,92,246,0.15)",
  },
  title: { fontFamily: "'Space Mono',monospace", fontSize: 17, fontWeight: 700, color: "#c084fc", marginBottom: 4 },
  big: { fontFamily: "'Space Mono',monospace", fontSize: 46, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 14 },
  track: { height: 7, background: "rgba(139,92,246,0.09)", borderRadius: 99, overflow: "hidden", marginBottom: 4 },
  fill: { height: "100%", background: "linear-gradient(90deg,#8b5cf6,#a855f7)", borderRadius: 99, transition: "width 0.5s" },
  trackLbl: { fontSize: 11, color: "rgba(232,240,254,0.32)", marginBottom: 16 },
  redeemBtn: {
    width: "100%", padding: "12px", borderRadius: 11,
    background: "linear-gradient(135deg,#8b5cf6,#a855f7)",
    border: "none", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
    marginBottom: 16, fontFamily: "'Sora',sans-serif",
    boxShadow: "0 0 16px rgba(139,92,246,0.5)", animation: "neonPulse 2.5s infinite",
  },
  redeemed: { color: "#c084fc", fontWeight: 600, textAlign: "center", padding: "10px 0 16px", fontSize: 14 },
  subHd: { fontSize: 9.5, color: "rgba(232,240,254,0.3)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  row: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  amt: { color: "#c084fc", fontWeight: 700, fontFamily: "'Space Mono',monospace", fontSize: 12 },
  close: {
    width: "100%", marginTop: 14, padding: "11px", borderRadius: 11,
    background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)",
    color: "rgba(232,240,254,0.45)", cursor: "pointer", fontSize: 13, fontFamily: "'Sora',sans-serif",
  },
};
