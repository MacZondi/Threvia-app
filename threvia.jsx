import { useState, useEffect, useRef } from "react";

const SESSION_DURATION = 25 * 60;

const SPONSORS = [
  { id: "vodacom", name: "Vodacom", tagline: "Connecting South Africa", color: "#E60000", logo: "📡", adDuration: 15, category: "Telecom", adText: "Stay connected with Vodacom's best data deals. Unlimited social media from R29/month. Get connected today!", cta: "Get a Deal" },
  { id: "capitec", name: "Capitec Bank", tagline: "Banking made simple", color: "#004A96", logo: "🏦", adDuration: 20, category: "Finance", adText: "Open a Capitec account in minutes. Zero monthly fees, instant EFTs, and cashback on every purchase.", cta: "Open Account" },
  { id: "nsfas", name: "NSFAS", tagline: "Funding your future", color: "#2d8a4e", logo: "🎓", adDuration: 12, category: "Education", adText: "Apply for NSFAS bursary funding for 2025. Covers tuition, accommodation & living allowance. Don't miss the deadline!", cta: "Apply Now" },
  { id: "doh", name: "Dept of Health", tagline: "Your health, our priority", color: "#8B2020", logo: "❤️", adDuration: 10, category: "Health", adText: "Free HIV testing & treatment at all public clinics. Know your status. Get on treatment. Live your life.", cta: "Find a Clinic" },
  { id: "mtn", name: "MTN", tagline: "Everywhere you go", color: "#cc9900", logo: "📶", adDuration: 15, category: "Telecom", adText: "MTN Pulse: Designed for youth. Get 1GB night data for just R10. Stream, chat, learn — all night long.", cta: "Get Pulse" },
];

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
  { id: "browser", icon: "🌐", label: "Browser" },
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

// ── SCREEN 1: Sponsor Select ────────────────────────────────────────────────
function SponsorSelect({ onSelect }) {
  const [picked, setPicked] = useState(null);
  return (
    <div style={S.screen}>
      <div style={S.wifiBadge}>📶 THREVIA FREE Wi-Fi</div>
      <div style={S.heroTitle}>
        Watch an ad,<br />get <span style={{ color: "#00f5a0" }}>25 minutes</span><br />free internet.
      </div>
      <div style={S.heroSub}>Choose a sponsor to unlock your session</div>

      <div style={S.grid}>
        {SPONSORS.map((s) => (
          <div
            key={s.id}
            onClick={() => setPicked(s.id)}
            style={{
              ...S.card,
              ...(picked === s.id
                ? { border: `2px solid ${s.color}`, background: `${s.color}15`, transform: "scale(1.02)" }
                : {}),
            }}
          >
            <div style={S.cardLogo}>{s.logo}</div>
            <div style={S.cardName}>{s.name}</div>
            <div style={S.cardCat}>{s.category}</div>
            <div style={{ ...S.timePill, background: s.color }}>{s.adDuration}s</div>
          </div>
        ))}
      </div>

      <button
        style={{ ...S.ctaBtn, opacity: picked ? 1 : 0.35, cursor: picked ? "pointer" : "default" }}
        onClick={() => picked && onSelect(SPONSORS.find((s) => s.id === picked))}
      >
        Watch Ad & Unlock Wi-Fi →
      </button>
      <div style={S.legal}>🔒 Anonymous · POPIA compliant · No data sold</div>

      <style>{globalCss}</style>
    </div>
  );
}

// ── SCREEN 2: Ad Player ─────────────────────────────────────────────────────
function AdPlayer({ sponsor, onDone }) {
  const [t, setT] = useState(sponsor.adDuration);
  const [canSkip, setCanSkip] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (t <= 0) { setDone(true); return; }
    const id = setTimeout(() => {
      setT((p) => p - 1);
      if (t === Math.ceil(sponsor.adDuration * 0.4)) setCanSkip(true);
    }, 1000);
    return () => clearTimeout(id);
  }, [t]);

  const pct = ((sponsor.adDuration - t) / sponsor.adDuration) * 100;

  return (
    <div style={{ ...A.screen, background: `linear-gradient(160deg,#06080f,${sponsor.color}18)` }}>
      <div style={A.card}>
        <div style={{ ...A.banner, background: sponsor.color }}>
          <span style={{ fontSize: 30 }}>{sponsor.logo}</span>
          <div style={{ flex: 1 }}>
            <div style={A.bannerName}>{sponsor.name}</div>
            <div style={A.bannerTag}>{sponsor.tagline}</div>
          </div>
          <div style={A.adBadge}>AD</div>
        </div>
        <div style={A.body}>
          <p style={A.adText}>{sponsor.adText}</p>
          <button style={{ ...A.adCta, background: sponsor.color }}>{sponsor.cta} ↗</button>
        </div>
        <div style={A.progWrap}>
          <div style={A.progTrack}>
            <div style={{ ...A.progFill, width: `${pct}%`, background: sponsor.color }} />
          </div>
          <div style={A.progLbl}>{done ? "✅ Complete!" : `${t}s remaining`}</div>
        </div>
      </div>

      <div style={A.reward}>
        <span style={{ fontSize: 34 }}>⏱️</span>
        <div>
          <div style={A.rewardLbl}>You're unlocking</div>
          <div style={A.rewardVal}>25 Minutes Free Internet</div>
        </div>
      </div>

      {done ? (
        <button style={A.unlockBtn} onClick={onDone}>🚀 Unlock My Session →</button>
      ) : canSkip ? (
        <button style={A.skipBtn} onClick={onDone}>Skip →</button>
      ) : (
        <div style={A.waitMsg}>Please watch the full ad to unlock Wi-Fi</div>
      )}
      <div style={A.powered}>Powered by Threvia · Free internet for South African youth</div>
    </div>
  );
}

// ── SCREEN 3: Main App ──────────────────────────────────────────────────────
function MainApp({ sponsor }) {
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [expired, setExpired] = useState(false);
  const [module, setModule] = useState("chat");
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Session unlocked! 🎉 Thanks to ${sponsor.name}, you've got 25 minutes of free internet.\n\nI'm Threvia — your peer guide for health, skills & wellbeing. What's on your mind?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bucks, setBucks] = useState(0);
  const [toast, setToast] = useState(null);
  const [showBucksModal, setShowBucksModal] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [browserUrl, setBrowserUrl] = useState("");
  const [browserInput, setBrowserInput] = useState("https://");
  const chatEnd = useRef(null);

  // Countdown
  useEffect(() => {
    if (expired) return;
    if (timeLeft <= 0) { setExpired(true); return; }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, expired]);

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

  const switchModule = (id) => {
    setModule(id);
    if (id === "chat" || id === "browser") return;
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
    const kw = ["health","sex","period","mental","stress","hiv","sti","condom","clinic","cv","bursary","study","anxiety","consent","prep"];
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

  return (
    <div style={M.wrap}>
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
            {[["Engage with health content","15"],["Switch to a wellness module","10"],["Watch a sponsor ad","30"],["Complete health quiz","25"],["Browse bookmarked sites","5"]].map(([l, a]) => (
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
  const [stage, setStage] = useState("select");
  const [sponsor, setSponsor] = useState(null);
  if (stage === "select") return <SponsorSelect onSelect={(s) => { setSponsor(s); setStage("ad"); }} />;
  if (stage === "ad") return <AdPlayer sponsor={sponsor} onDone={() => setStage("app")} />;
  return <MainApp sponsor={sponsor} />;
}

// ── GLOBAL CSS ────────────────────────────────────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#06080f;font-family:'Sora',sans-serif}
  @keyframes blink{0%,80%,100%{opacity:.2;transform:scale(.75)}40%{opacity:1;transform:scale(1)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,245,160,.35)}50%{box-shadow:0 0 0 10px rgba(0,245,160,0)}}
`;

// ── STYLE OBJECTS ─────────────────────────────────────────────────────────────
const base = {
  fontFamily:"'Sora',sans-serif",
  background:"linear-gradient(160deg,#06080f 0%,#0a1220 100%)",
  minHeight:"100vh", maxWidth:480, margin:"0 auto",
  color:"#e8f0fe", display:"flex", flexDirection:"column",
  overflow:"hidden", position:"relative",
};

// Sponsor Select
const S = {
  screen:{...base,alignItems:"center",padding:"0 0 36px"},
  wifiBadge:{
    background:"rgba(0,245,160,0.1)", border:"1px solid rgba(0,245,160,0.25)",
    color:"#00f5a0", fontSize:10, fontWeight:700, letterSpacing:2,
    padding:"6px 18px", borderRadius:99, marginTop:40, marginBottom:30,
    textTransform:"uppercase",
  },
  heroTitle:{fontSize:33,fontWeight:700,lineHeight:1.18,textAlign:"center",padding:"0 24px",marginBottom:10},
  heroSub:{fontSize:13,color:"rgba(232,240,254,0.4)",textAlign:"center",marginBottom:28},
  grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 18px",width:"100%",marginBottom:22},
  card:{
    background:"rgba(255,255,255,0.035)", border:"1.5px solid rgba(255,255,255,0.07)",
    borderRadius:16, padding:"16px 14px", cursor:"pointer",
    display:"flex", flexDirection:"column", alignItems:"flex-start", gap:4,
    position:"relative", transition:"all 0.2s",
  },
  cardLogo:{fontSize:28,marginBottom:4},
  cardName:{fontWeight:700,fontSize:14},
  cardCat:{fontSize:9.5,color:"rgba(232,240,254,0.38)",textTransform:"uppercase",letterSpacing:1},
  timePill:{position:"absolute",top:10,right:10,borderRadius:99,padding:"2px 8px",fontSize:9.5,fontWeight:700,color:"#fff",fontFamily:"'Space Mono',monospace"},
  ctaBtn:{
    margin:"0 18px", width:"calc(100% - 36px)", padding:"15px",
    borderRadius:14, background:"linear-gradient(135deg,#00f5a0,#00bcd4)",
    border:"none", color:"#06080f", fontWeight:700, fontSize:15,
    transition:"opacity 0.2s", fontFamily:"'Sora',sans-serif",
  },
  legal:{fontSize:9.5,color:"rgba(232,240,254,0.2)",marginTop:14,textAlign:"center"},
};

// Ad Player
const A = {
  screen:{...base,padding:"24px 18px",alignItems:"center",justifyContent:"center",gap:16},
  card:{width:"100%",borderRadius:18,overflow:"hidden",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"},
  banner:{display:"flex",alignItems:"center",gap:12,padding:"15px 16px"},
  bannerName:{fontWeight:700,fontSize:15,color:"#fff"},
  bannerTag:{fontSize:10.5,color:"rgba(255,255,255,0.55)"},
  adBadge:{marginLeft:"auto",background:"rgba(255,255,255,0.2)",borderRadius:6,padding:"2px 8px",fontSize:9.5,fontWeight:700,color:"#fff",letterSpacing:1},
  body:{padding:"18px 16px"},
  adText:{fontSize:14.5,lineHeight:1.65,color:"rgba(232,240,254,0.82)",marginBottom:14},
  adCta:{border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontWeight:700,fontSize:12.5,cursor:"pointer",fontFamily:"'Sora',sans-serif"},
  progWrap:{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.06)"},
  progTrack:{height:5,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden",marginBottom:5},
  progFill:{height:"100%",borderRadius:99,transition:"width 1s linear"},
  progLbl:{fontSize:10.5,color:"rgba(232,240,254,0.35)",textAlign:"right"},
  reward:{
    display:"flex",alignItems:"center",gap:14,width:"100%",
    background:"rgba(0,245,160,0.06)",border:"1px solid rgba(0,245,160,0.18)",
    borderRadius:14,padding:"14px 18px",
  },
  rewardLbl:{fontSize:10,color:"rgba(0,245,160,0.55)",textTransform:"uppercase",letterSpacing:1},
  rewardVal:{fontSize:16.5,fontWeight:700,color:"#00f5a0"},
  unlockBtn:{
    width:"100%",padding:"14px",borderRadius:13,
    background:"linear-gradient(135deg,#00f5a0,#00bcd4)",
    border:"none",color:"#06080f",fontWeight:700,fontSize:14.5,cursor:"pointer",
    animation:"glowPulse 2.5s infinite",fontFamily:"'Sora',sans-serif",
  },
  skipBtn:{
    background:"transparent",border:"1px solid rgba(255,255,255,0.13)",
    borderRadius:10,color:"rgba(232,240,254,0.45)",padding:"10px 22px",
    cursor:"pointer",fontSize:12.5,fontFamily:"'Sora',sans-serif",
  },
  waitMsg:{fontSize:11.5,color:"rgba(232,240,254,0.28)",textAlign:"center"},
  powered:{fontSize:9.5,color:"rgba(232,240,254,0.18)"},
};

// Main App
const M = {
  wrap:{...base},
  timerBar:{
    display:"flex",alignItems:"center",justifyContent:"space-between",
    padding:"12px 15px 8px",
    background:"rgba(6,8,15,0.96)",backdropFilter:"blur(10px)",
  },
  timerLeft:{display:"flex",alignItems:"center",gap:8},
  dot:{width:8,height:8,borderRadius:"50%",animation:"glowPulse 2s infinite"},
  time:{fontFamily:"'Space Mono',monospace",fontSize:20,fontWeight:700,lineHeight:1},
  timeLbl:{fontSize:8.5,color:"rgba(232,240,254,0.28)",textTransform:"uppercase",letterSpacing:1},
  sponsorChip:{
    display:"flex",alignItems:"center",gap:6,
    background:"rgba(255,255,255,0.04)",borderRadius:20,padding:"4px 10px",
    fontSize:11,
  },
  bucksChip:{
    background:"rgba(0,245,160,0.09)",border:"1px solid rgba(0,245,160,0.2)",
    borderRadius:20,padding:"4px 12px",cursor:"pointer",textAlign:"center",
  },
  bucksNum:{fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,color:"#00f5a0",display:"block"},
  bucksLbl:{fontSize:7.5,color:"rgba(0,245,160,0.5)",textTransform:"uppercase",letterSpacing:1},
  strip:{height:3,background:"rgba(255,255,255,0.04)",overflow:"hidden"},
  stripFill:{height:"100%",transition:"width 1s linear, background 2s"},
  toast:{
    position:"fixed",top:65,left:"50%",transform:"translateX(-50%)",
    background:"linear-gradient(135deg,#00f5a0,#00bcd4)",color:"#06080f",
    padding:"8px 20px",borderRadius:99,fontWeight:700,fontSize:13,
    zIndex:999,whiteSpace:"nowrap",animation:"slideUp 0.3s ease",
  },
  nav:{
    display:"flex",overflowX:"auto",gap:5,padding:"9px 12px",
    borderBottom:"1px solid rgba(255,255,255,0.04)",scrollbarWidth:"none",
  },
  navBtn:{
    display:"flex",flexDirection:"column",alignItems:"center",gap:3,
    padding:"7px 11px",borderRadius:10,
    border:"1px solid rgba(255,255,255,0.055)",background:"rgba(255,255,255,0.02)",
    color:"rgba(232,240,254,0.38)",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,
    transition:"all 0.2s",
  },
  navBtnOn:{border:"1px solid rgba(0,245,160,0.32)",background:"rgba(0,245,160,0.07)",color:"#00f5a0"},
  qrow:{display:"flex",flexWrap:"wrap",gap:5,padding:"8px 13px",borderBottom:"1px solid rgba(255,255,255,0.03)"},
  qbtn:{
    background:"rgba(0,210,245,0.06)",border:"1px solid rgba(0,210,245,0.16)",
    borderRadius:20,color:"#00d9f5",fontSize:11,padding:"4px 11px",cursor:"pointer",
  },
  chat:{
    flex:1,overflowY:"auto",padding:"13px",
    display:"flex",flexDirection:"column",gap:10,
    scrollbarWidth:"thin",scrollbarColor:"rgba(0,245,160,0.12) transparent",
  },
  row:{display:"flex",alignItems:"flex-end",gap:7},
  avatar:{
    width:26,height:26,borderRadius:8,
    background:"linear-gradient(135deg,#00f5a0,#00d9f5)",
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:12,fontWeight:700,color:"#06080f",flexShrink:0,
    fontFamily:"'Space Mono',monospace",
  },
  bubble:{maxWidth:"80%",padding:"10px 13px",borderRadius:16,fontSize:13.5,lineHeight:1.6,whiteSpace:"pre-wrap"},
  aBubble:{background:"rgba(255,255,255,0.047)",border:"1px solid rgba(255,255,255,0.065)",borderBottomLeftRadius:4,color:"#e8f0fe"},
  uBubble:{background:"linear-gradient(135deg,rgba(0,245,160,0.13),rgba(0,217,245,0.13))",border:"1px solid rgba(0,245,160,0.22)",borderBottomRightRadius:4,color:"#e8f0fe"},
  inputRow:{
    display:"flex",gap:9,padding:"10px 13px",
    borderTop:"1px solid rgba(255,255,255,0.046)",background:"rgba(6,8,15,0.97)",
  },
  input:{
    flex:1,background:"rgba(255,255,255,0.047)",border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:11,padding:"10px 13px",color:"#e8f0fe",fontSize:13.5,outline:"none",
    fontFamily:"'Sora',sans-serif",
  },
  send:{
    width:42,height:42,borderRadius:11,
    background:"linear-gradient(135deg,#00f5a0,#00bcd4)",
    border:"none",cursor:"pointer",fontSize:15,color:"#06080f",
    display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0,
  },
  footer:{textAlign:"center",fontSize:9.5,color:"rgba(232,240,254,0.16)",padding:"5px 14px 8px",letterSpacing:0.3},
};

// Browser
const Br = {
  wrap:{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"},
  urlRow:{display:"flex",gap:8,padding:"9px 13px",borderBottom:"1px solid rgba(255,255,255,0.045)"},
  urlIn:{
    flex:1,background:"rgba(255,255,255,0.046)",border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:10,padding:"8px 12px",color:"#e8f0fe",fontSize:12,outline:"none",
    fontFamily:"'Sora',sans-serif",
  },
  go:{
    padding:"8px 16px",borderRadius:10,
    background:"linear-gradient(135deg,#00f5a0,#00bcd4)",
    border:"none",color:"#06080f",fontWeight:700,fontSize:12,cursor:"pointer",
    fontFamily:"'Sora',sans-serif",
  },
  bmarks:{
    display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,padding:"9px 13px",
    borderBottom:"1px solid rgba(255,255,255,0.03)",
  },
  bmark:{
    display:"flex",flexDirection:"column",alignItems:"center",gap:4,
    padding:"10px 6px",borderRadius:10,
    background:"rgba(255,255,255,0.028)",border:"1px solid rgba(255,255,255,0.055)",
    cursor:"pointer",color:"#e8f0fe",transition:"all 0.2s",
  },
  frame:{flex:1,border:"none",background:"#fff"},
  ph:{
    flex:1,display:"flex",flexDirection:"column",alignItems:"center",
    justifyContent:"center",gap:12,padding:28,
  },
};

// Session Expired
const E = {
  screen:{...base,alignItems:"center",justifyContent:"center",padding:28,gap:16,animation:"fadeIn 0.5s ease"},
  title:{fontFamily:"'Space Mono',monospace",fontSize:26,fontWeight:700,color:"#ff6b6b"},
  sub:{fontSize:14,color:"rgba(232,240,254,0.4)",textAlign:"center"},
  bucksBox:{background:"rgba(0,245,160,0.07)",border:"1px solid rgba(0,245,160,0.2)",borderRadius:16,padding:"18px 32px",textAlign:"center"},
  bucksNum:{fontFamily:"'Space Mono',monospace",fontSize:42,fontWeight:700,color:"#00f5a0"},
  bucksLbl:{fontSize:12,color:"rgba(0,245,160,0.5)",marginTop:4},
  redeemBtn:{
    width:"100%",padding:"13px",borderRadius:13,
    background:"linear-gradient(135deg,#00f5a0,#00bcd4)",
    border:"none",color:"#06080f",fontWeight:700,fontSize:14.5,cursor:"pointer",
    fontFamily:"'Sora',sans-serif",
  },
  tip:{fontSize:12,color:"rgba(232,240,254,0.28)",textAlign:"center"},
  newBtn:{
    width:"100%",padding:"12px",borderRadius:13,
    background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
    color:"rgba(232,240,254,0.5)",fontSize:13.5,cursor:"pointer",
    fontFamily:"'Sora',sans-serif",
  },
};

// Bucks Modal
const Mo = {
  overlay:{
    position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",
    backdropFilter:"blur(8px)",zIndex:100,
    display:"flex",alignItems:"flex-end",justifyContent:"center",padding:16,
  },
  box:{
    background:"#0a1220",border:"1px solid rgba(0,245,160,0.18)",
    borderRadius:20,padding:22,width:"100%",maxWidth:440,animation:"slideUp 0.3s ease",
  },
  title:{fontFamily:"'Space Mono',monospace",fontSize:17,fontWeight:700,color:"#00f5a0",marginBottom:4},
  big:{fontFamily:"'Space Mono',monospace",fontSize:46,fontWeight:700,color:"#fff",lineHeight:1,marginBottom:14},
  track:{height:7,background:"rgba(0,245,160,0.09)",borderRadius:99,overflow:"hidden",marginBottom:4},
  fill:{height:"100%",background:"linear-gradient(90deg,#00f5a0,#00d9f5)",borderRadius:99,transition:"width 0.5s"},
  trackLbl:{fontSize:11,color:"rgba(232,240,254,0.32)",marginBottom:16},
  redeemBtn:{
    width:"100%",padding:"12px",borderRadius:11,
    background:"linear-gradient(135deg,#00f5a0,#00bcd4)",
    border:"none",color:"#06080f",fontWeight:700,fontSize:14,cursor:"pointer",
    marginBottom:16,fontFamily:"'Sora',sans-serif",
  },
  redeemed:{color:"#00f5a0",fontWeight:600,textAlign:"center",padding:"10px 0 16px",fontSize:14},
  subHd:{fontSize:9.5,color:"rgba(232,240,254,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:8},
  row:{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"},
  amt:{color:"#00f5a0",fontWeight:700,fontFamily:"'Space Mono',monospace",fontSize:12},
  close:{
    width:"100%",marginTop:14,padding:"11px",borderRadius:11,
    background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
    color:"rgba(232,240,254,0.45)",cursor:"pointer",fontSize:13,fontFamily:"'Sora',sans-serif",
  },
};