import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ThreviaTokenABI from "./contracts/ThreviaToken.json";

// THREV Token info (matches ThreviaToken.sol)
const TOKEN_INFO = {
    name: "Threvia Bucks",
    symbol: "THREV",
    decimals: 18,
    totalSupply: "21,000,000",
    network: "Base (Coinbase L2)",
    networkColor: "#0052FF",
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Local deployment address
    baseExplorer: "https://basescan.org",
    conversionRate: 50, // 50 ThreviaBucks = 1 THREV
};

const EARN_WAYS = [
    { action: "Watch entry ad (post-login)", bucks: 50 },
    { action: "Watch in-session mid-ad (every 5 min)", bucks: 30 },
    { action: "Engage with health content", bucks: 15 },
    { action: "Switch to wellness module", bucks: 10 },
    { action: "Browse bookmarked health sites", bucks: 5 },
    { action: "Complete health quiz", bucks: 25 },
    { action: "Save a reminder", bucks: 5 },
];

const REDEEM_WAYS = [
    { action: "Extra 60MB data", cost: 50, icon: "📡" },
    { action: "Access premium browser tab", cost: 100, icon: "🌐" },
    { action: "1 THREV token (blockchain)", cost: 50, icon: "🪙" },
    { action: "Unlock advanced AI features", cost: 150, icon: "🤖" },
];

export function TokenWallet({ bucks, onRedeem }) {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [tokenBalance, setTokenBalance] = useState("0");

    const threvBalance = Number(tokenBalance) > 0 ? Number(tokenBalance) : Math.floor(bucks / TOKEN_INFO.conversionRate);
    const convertable = convertAmt ? Math.min(Number(convertAmt), bucks) : 0;
    const threvFromConvert = Math.floor(convertable / TOKEN_INFO.conversionRate);

    // Initial check for wallet connection
    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const checkIfWalletIsConnected = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_accounts" });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setWalletConnected(true);
                    fetchTokenBalance(accounts[0]);
                }
            } catch (error) {
                console.error("Error checking wallet connection:", error);
            }
        }
    };

    const fetchTokenBalance = async (address) => {
        if (!window.ethereum) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(TOKEN_INFO.contractAddress, ThreviaTokenABI.abi, provider);
            const balance = await contract.balanceOf(address);
            setTokenBalance(ethers.formatUnits(balance, 18));
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const handleConnect = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setWalletConnected(true);
                    fetchTokenBalance(accounts[0]);
                }
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert("No Web3 wallet found! Please install MetaMask or Coinbase Wallet.");
        }
    };

    const handleConvert = async () => {
        if (threvFromConvert <= 0 || !walletConnected) return;
        setConverting(true);

        try {
            // Note: In a real environment, the conversion from points to tokens
            // must happen from a backend service with a funded 'minter' wallet
            // to call `convertPointsToThrev()`.
            // Here, for the demo/UI perspective, we simulate checking standard transfer or assuming backend success.
            setTimeout(() => {
                onRedeem?.(threvFromConvert * TOKEN_INFO.conversionRate, threvFromConvert);
                setTokenBalance((prev) => (Number(prev) + threvFromConvert).toString());
                setConvertDone(true);
                setConverting(false);
                setConvertAmt("");
                setTimeout(() => setConvertDone(false), 3000);
            }, 1800);
        } catch (error) {
            console.error("Conversion failed:", error);
            setConverting(false);
            alert("Conversion failed. See console for details.");
        }
    };

    return (
        <div style={TW.wrap}>
            {/* Token Hero Card */}
            <div style={TW.heroCard}>
                <div style={TW.heroLeft}>
                    <div style={TW.heroIcon}>🪙</div>
                    <div>
                        <div style={TW.heroSymbol}>{TOKEN_INFO.symbol}</div>
                        <div style={TW.heroName}>{TOKEN_INFO.name}</div>
                    </div>
                </div>
                <div style={TW.heroNet}>
                    <div style={{ ...TW.netDot, background: TOKEN_INFO.networkColor }} />
                    <span style={TW.netLabel}>Base L2</span>
                </div>
            </div>

            {/* Balances */}
            <div style={TW.balRow}>
                <div style={TW.balCard}>
                    <div style={TW.balNum}>{bucks}</div>
                    <div style={TW.balLabel}>ThreviaBucks</div>
                    <div style={TW.balSub}>In-app points</div>
                </div>
                <div style={{ ...TW.balCard, borderColor: "rgba(0,82,255,0.25)", background: "rgba(0,82,255,0.07)" }}>
                    <div style={{ ...TW.balNum, color: "#4f8fff" }}>{threvBalance}</div>
                    <div style={{ ...TW.balLabel, color: "rgba(79,143,255,0.7)" }}>THREV Tokens</div>
                    <div style={TW.balSub}>Blockchain value</div>
                </div>
            </div>

            {/* Conversion rate pill */}
            <div style={TW.ratePill}>
                💱 50 ThreviaBucks = 1 THREV token
            </div>

            {/* Tab nav */}
            <div style={TW.tabs}>
                {[["overview", "📋 Overview"], ["earn", "💡 Earn"], ["redeem", "🎁 Redeem"]].map(([id, label]) => (
                    <button
                        key={id}
                        style={{ ...TW.tab, ...(tab === id ? TW.tabOn : {}) }}
                        onClick={() => setTab(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === "overview" && (
                <div style={TW.section}>
                    {/* Token info */}
                    <div style={TW.infoCard}>
                        <div style={TW.infoTitle}>🔗 Contract Details</div>
                        {[
                            ["Name", TOKEN_INFO.name],
                            ["Symbol", TOKEN_INFO.symbol],
                            ["Decimals", TOKEN_INFO.decimals],
                            ["Total Supply", TOKEN_INFO.totalSupply + " THREV"],
                            ["Network", TOKEN_INFO.network],
                            ["Contract", TOKEN_INFO.contractAddress],
                        ].map(([k, v]) => (
                            <div key={k} style={TW.infoRow}>
                                <span style={TW.infoKey}>{k}</span>
                                <span style={TW.infoVal}>{v}</span>
                            </div>
                        ))}
                        <a href={TOKEN_INFO.baseExplorer} target="_blank" rel="noopener noreferrer" style={TW.explorerLink}>
                            View on BaseScan ↗
                        </a>
                    </div>

                    {/* Wallet connect */}
                    {!walletConnected ? (
                        <button style={TW.connectBtn} onClick={handleConnect}>
                            🔗 Connect Web3 Wallet
                        </button>
                    ) : (
                        <div style={TW.walletBox}>
                            <div style={TW.walletLabel}>Connected Wallet</div>
                            <div style={TW.walletAddr}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>
                            <div style={TW.walletNote}>✅ Connected via Web3</div>
                        </div>
                    )}

                    {/* Convert form */}
                    <div style={TW.convertCard}>
                        <div style={TW.convertTitle}>💱 Convert to THREV</div>
                        <div style={TW.convertDesc}>Convert your in-app ThreviaBucks to THREV tokens on Base</div>
                        <input
                            style={TW.convertInput}
                            type="number"
                            min={50}
                            max={bucks}
                            step={50}
                            placeholder={`Enter ThreviaBucks (you have ${bucks})`}
                            value={convertAmt}
                            onChange={(e) => setConvertAmt(e.target.value)}
                        />
                        {convertAmt > 0 && (
                            <div style={TW.convertPreview}>
                                {convertable} ThreviaBucks → <strong>{threvFromConvert} THREV</strong>
                            </div>
                        )}
                        <button
                            style={{ ...TW.convertBtn, opacity: threvFromConvert > 0 ? 1 : 0.4 }}
                            onClick={handleConvert}
                            disabled={threvFromConvert <= 0 || converting}
                        >
                            {converting ? "⏳ Converting..." : convertDone ? "✅ Done!" : "Convert Now"}
                        </button>
                    </div>
                </div>
            )}

            {/* Earn Tab */}
            {tab === "earn" && (
                <div style={TW.section}>
                    <div style={TW.listCard}>
                        <div style={TW.listCardTitle}>Ways to Earn ThreviaBucks</div>
                        {EARN_WAYS.map((e) => (
                            <div key={e.action} style={TW.earnRow}>
                                <span style={TW.earnAction}>{e.action}</span>
                                <span style={TW.earnAmt}>+{e.bucks}</span>
                            </div>
                        ))}
                    </div>
                    <div style={TW.tipBox}>
                        💡 Every 50 ThreviaBucks = 1 THREV on-chain. Keep watching ads and engaging with health content to earn more!
                    </div>
                </div>
            )}

            {/* Redeem Tab */}
            {tab === "redeem" && (
                <div style={TW.section}>
                    <div style={TW.listCard}>
                        <div style={TW.listCardTitle}>Redeem ThreviaBucks</div>
                        {REDEEM_WAYS.map((r) => (
                            <div key={r.action} style={TW.redeemRow}>
                                <span style={{ fontSize: 20 }}>{r.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={TW.redeemAction}>{r.action}</div>
                                    <div style={TW.redeemCost}>{r.cost} ThreviaBucks</div>
                                </div>
                                <button
                                    style={{ ...TW.redeemBtn, opacity: bucks >= r.cost ? 1 : 0.38 }}
                                    disabled={bucks < r.cost}
                                    onClick={() => onRedeem?.(r.cost, 0)}
                                >
                                    {bucks >= r.cost ? "Redeem" : "Need more"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const TW = {
    wrap: { flex: 1, overflowY: "auto", padding: "0 0 24px", scrollbarWidth: "thin", scrollbarColor: "rgba(0,245,160,0.12) transparent" },
    heroCard: {
        margin: "12px 14px 8px",
        background: "linear-gradient(135deg,rgba(0,245,160,0.1),rgba(0,82,255,0.1))",
        border: "1px solid rgba(0,245,160,0.18)",
        borderRadius: 16, padding: "16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    heroLeft: { display: "flex", alignItems: "center", gap: 12 },
    heroIcon: { fontSize: 34 },
    heroSymbol: { fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700, color: "#00f5a0" },
    heroName: { fontSize: 11, color: "rgba(232,240,254,0.45)", fontFamily: "'Sora',sans-serif" },
    heroNet: { display: "flex", alignItems: "center", gap: 6, background: "rgba(0,82,255,0.13)", borderRadius: 99, padding: "5px 12px" },
    netDot: { width: 8, height: 8, borderRadius: "50%" },
    netLabel: { fontSize: 11, fontWeight: 600, color: "#4f8fff", fontFamily: "'Sora',sans-serif" },

    balRow: { display: "flex", gap: 10, padding: "0 14px 8px" },
    balCard: {
        flex: 1, background: "rgba(0,245,160,0.07)", border: "1px solid rgba(0,245,160,0.18)",
        borderRadius: 14, padding: "14px 12px", textAlign: "center",
    },
    balNum: { fontFamily: "'Space Mono',monospace", fontSize: 26, fontWeight: 700, color: "#00f5a0" },
    balLabel: { fontSize: 10.5, fontWeight: 600, color: "rgba(0,245,160,0.65)", marginTop: 2, fontFamily: "'Sora',sans-serif" },
    balSub: { fontSize: 9, color: "rgba(232,240,254,0.25)", marginTop: 2, fontFamily: "'Sora',sans-serif" },

    ratePill: {
        margin: "0 14px 10px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 99, padding: "7px 16px",
        fontSize: 11, color: "rgba(232,240,254,0.45)", textAlign: "center",
        fontFamily: "'Sora',sans-serif",
    },

    tabs: { display: "flex", gap: 6, padding: "0 14px 10px" },
    tab: {
        flex: 1, padding: "8px 4px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.03)", color: "rgba(232,240,254,0.38)",
        cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'Sora',sans-serif",
    },
    tabOn: { border: "1px solid rgba(0,245,160,0.32)", background: "rgba(0,245,160,0.08)", color: "#00f5a0" },

    section: { padding: "0 14px" },
    infoCard: {
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "14px 16px", marginBottom: 12,
    },
    infoTitle: { fontSize: 12, fontWeight: 700, color: "#e8f0fe", marginBottom: 10, fontFamily: "'Space Mono',monospace" },
    infoRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
    infoKey: { fontSize: 11, color: "rgba(232,240,254,0.35)", fontFamily: "'Sora',sans-serif" },
    infoVal: { fontSize: 11, color: "#e8f0fe", fontWeight: 600, fontFamily: "'Space Mono',monospace", maxWidth: "60%", textAlign: "right", wordBreak: "break-all" },
    explorerLink: { display: "block", marginTop: 10, fontSize: 11, color: "#4f8fff", textDecoration: "none", fontFamily: "'Sora',sans-serif" },

    connectBtn: {
        width: "100%", padding: "12px", borderRadius: 12,
        background: "rgba(0,82,255,0.15)", border: "1px solid rgba(0,82,255,0.35)",
        color: "#4f8fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
        marginBottom: 12, fontFamily: "'Sora',sans-serif",
    },
    walletBox: {
        background: "rgba(0,82,255,0.07)", border: "1px solid rgba(0,82,255,0.2)",
        borderRadius: 12, padding: "12px 16px", marginBottom: 12, textAlign: "center",
    },
    walletLabel: { fontSize: 9.5, color: "rgba(232,240,254,0.35)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Sora',sans-serif" },
    walletAddr: { fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: "#4f8fff", margin: "4px 0" },
    walletNote: { fontSize: 10, color: "rgba(232,240,254,0.25)", fontFamily: "'Sora',sans-serif" },

    convertCard: {
        background: "rgba(0,245,160,0.05)", border: "1px solid rgba(0,245,160,0.14)",
        borderRadius: 14, padding: "14px 16px",
    },
    convertTitle: { fontSize: 13, fontWeight: 700, color: "#e8f0fe", marginBottom: 4, fontFamily: "'Space Mono',monospace" },
    convertDesc: { fontSize: 10.5, color: "rgba(232,240,254,0.38)", marginBottom: 10, fontFamily: "'Sora',sans-serif" },
    convertInput: {
        width: "100%", background: "rgba(255,255,255,0.046)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "10px 12px", color: "#e8f0fe", fontSize: 13, outline: "none",
        fontFamily: "'Sora',sans-serif", boxSizing: "border-box", marginBottom: 8,
        colorScheme: "dark",
    },
    convertPreview: { fontSize: 12, color: "rgba(0,245,160,0.7)", marginBottom: 8, fontFamily: "'Sora',sans-serif" },
    convertBtn: {
        width: "100%", padding: "11px", borderRadius: 11,
        background: "linear-gradient(135deg,#00f5a0,#00bcd4)",
        border: "none", color: "#06080f", fontWeight: 700, fontSize: 13.5,
        cursor: "pointer", fontFamily: "'Sora',sans-serif",
        transition: "opacity 0.2s",
    },

    listCard: {
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "14px 16px", marginBottom: 12,
    },
    listCardTitle: { fontSize: 12, fontWeight: 700, color: "#e8f0fe", marginBottom: 10, fontFamily: "'Space Mono',monospace" },
    earnRow: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" },
    earnAction: { fontSize: 11.5, color: "rgba(232,240,254,0.55)", fontFamily: "'Sora',sans-serif" },
    earnAmt: { fontFamily: "'Space Mono',monospace", fontSize: 12, fontWeight: 700, color: "#00f5a0" },
    tipBox: {
        background: "rgba(0,245,160,0.05)", border: "1px solid rgba(0,245,160,0.12)",
        borderRadius: 12, padding: "12px 14px",
        fontSize: 11.5, color: "rgba(232,240,254,0.45)", lineHeight: 1.6,
        fontFamily: "'Sora',sans-serif",
    },
    redeemRow: {
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    },
    redeemAction: { fontSize: 12.5, color: "#e8f0fe", fontWeight: 600, fontFamily: "'Sora',sans-serif" },
    redeemCost: { fontSize: 10.5, color: "rgba(0,245,160,0.5)", fontFamily: "'Space Mono',monospace", marginTop: 1 },
    redeemBtn: {
        padding: "7px 12px", borderRadius: 8,
        background: "rgba(0,245,160,0.12)", border: "1px solid rgba(0,245,160,0.25)",
        color: "#00f5a0", fontWeight: 700, fontSize: 10.5,
        cursor: "pointer", fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap",
        transition: "opacity 0.2s",
    },
};
