import { useState, useEffect } from "react";

// Mid-session YouTube ad — shown every 5 minutes, unskippable, earns 30 ThreviaBucks
// YouTube video IDs keyed by sponsor id
const SPONSOR_VIDEOS = {
    vodacom: "dQw4w9WgXcQ",   // demo: replace with real Vodacom YT ad ID
    capitec: "dQw4w9WgXcQ",   // demo: replace with real Capitec YT ad ID
    nsfas: "dQw4w9WgXcQ",   // demo: replace with real NSFAS YT ad ID
    doh: "dQw4w9WgXcQ",   // demo: replace with real DoH YT ad ID
    mtn: "dQw4w9WgXcQ",   // demo: replace with real MTN YT ad ID
};

const AD_DURATION = 30; // seconds

export function MidSessionAd({ sponsor, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(AD_DURATION);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            setDone(true);
            return;
        }
        const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [timeLeft]);

    const pct = ((AD_DURATION - timeLeft) / AD_DURATION) * 100;
    const videoId = SPONSOR_VIDEOS[sponsor?.id] || "dQw4w9WgXcQ";
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1&playsinline=1&mute=0`;

    return (
        <div style={ms.overlay}>
            <div style={ms.card}>
                {/* Header */}
                <div style={{ ...ms.header, background: sponsor?.color || "#00f5a0" }}>
                    <span style={{ fontSize: 22 }}>{sponsor?.logo}</span>
                    <div style={{ flex: 1 }}>
                        <div style={ms.sponsorName}>{sponsor?.name}</div>
                        <div style={ms.sponsorTag}>{sponsor?.tagline}</div>
                    </div>
                    <div style={ms.adBadge}>AD</div>
                </div>

                {/* YouTube Embed */}
                <div style={ms.videoWrap}>
                    <iframe
                        src={embedUrl}
                        style={ms.iframe}
                        title="Sponsored Ad"
                        allow="autoplay; encrypted-media"
                        allowFullScreen={false}
                        sandbox="allow-scripts allow-same-origin"
                    />
                    {/* Overlay to block controls (prevent right-click / interaction with iframe) */}
                    {!done && <div style={ms.videoBlock} />}
                </div>

                {/* Progress bar */}
                <div style={ms.progWrap}>
                    <div style={ms.progTrack}>
                        <div style={{ ...ms.progFill, width: `${pct}%`, background: sponsor?.color || "#00f5a0" }} />
                    </div>
                    <div style={ms.progRow}>
                        <span style={ms.progLbl}>
                            {done ? "✅ Ad complete!" : `${timeLeft}s remaining — please watch`}
                        </span>
                        <span style={ms.reward}>+30 🪙</span>
                    </div>
                </div>

                {/* Reward info */}
                <div style={ms.rewardBox}>
                    <span style={{ fontSize: 24 }}>🎁</span>
                    <div>
                        <div style={ms.rewardTitle}>Watching earns you</div>
                        <div style={ms.rewardValue}>+30 ThreviaBucks</div>
                    </div>
                </div>

                {/* Continue button — only visible when done */}
                {done ? (
                    <button style={ms.continueBtn} onClick={onComplete}>
                        🚀 Continue Session →
                    </button>
                ) : (
                    <div style={ms.noSkip}>🚫 Ad cannot be skipped • Earn 30 ThreviaBucks</div>
                )}
            </div>

            <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,245,160,.35)}50%{box-shadow:0 0 0 10px rgba(0,245,160,0)}}
      `}</style>
        </div>
    );
}

const ms = {
    overlay: {
        position: "fixed", inset: 0,
        background: "rgba(6,8,15,0.96)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.3s ease",
    },
    card: {
        width: "100%", maxWidth: 440,
        background: "linear-gradient(160deg,#0a1220,#0d1a2e)",
        border: "1px solid rgba(0,245,160,0.18)",
        borderRadius: 20,
        overflow: "hidden",
        animation: "slideUp 0.35s ease",
    },
    header: {
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px",
    },
    sponsorName: { fontWeight: 700, fontSize: 14, color: "#fff", fontFamily: "'Sora',sans-serif" },
    sponsorTag: { fontSize: 10, color: "rgba(255,255,255,0.55)", fontFamily: "'Sora',sans-serif" },
    adBadge: {
        marginLeft: "auto",
        background: "rgba(255,255,255,0.22)", borderRadius: 6,
        padding: "2px 8px", fontSize: 9.5, fontWeight: 700, color: "#fff", letterSpacing: 1,
        fontFamily: "'Space Mono',monospace",
    },
    videoWrap: { position: "relative", width: "100%", paddingBottom: "56.25%" /* 16:9 */ },
    iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" },
    videoBlock: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: "15%",
        zIndex: 2, cursor: "not-allowed",
    },
    progWrap: { padding: "12px 16px 4px" },
    progTrack: { height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 6 },
    progFill: { height: "100%", borderRadius: 99, transition: "width 1s linear" },
    progRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    progLbl: { fontSize: 10.5, color: "rgba(232,240,254,0.35)", fontFamily: "'Sora',sans-serif" },
    reward: { fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#00f5a0", fontWeight: 700 },
    rewardBox: {
        display: "flex", alignItems: "center", gap: 12,
        margin: "10px 16px",
        background: "rgba(0,245,160,0.06)", border: "1px solid rgba(0,245,160,0.16)",
        borderRadius: 12, padding: "12px 16px",
    },
    rewardTitle: { fontSize: 10, color: "rgba(0,245,160,0.55)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Sora',sans-serif" },
    rewardValue: { fontSize: 15, fontWeight: 700, color: "#00f5a0", fontFamily: "'Space Mono',monospace" },
    continueBtn: {
        display: "block", width: "calc(100% - 32px)", margin: "12px 16px 16px",
        padding: "13px", borderRadius: 13,
        background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
        border: "none", color: "#06080f", fontWeight: 700, fontSize: 14,
        cursor: "pointer", fontFamily: "'Sora',sans-serif",
        animation: "glowPulse 2.5s infinite",
    },
    noSkip: {
        textAlign: "center", fontSize: 11, color: "rgba(232,240,254,0.25)",
        padding: "10px 16px 16px", fontFamily: "'Sora',sans-serif",
    },
};
