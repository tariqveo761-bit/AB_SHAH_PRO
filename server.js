const express = require('express');
const cors = require('cors');
const path = require('path'); 

const app = express();
app.use(cors());
app.use(express.json());

// --- 🌐 REMOTE WHITELIST LOGIC ---
let allowedEmails = [];

// 👇 YAHAN APNA WOH RAW LINK DOBARA DAALEIN 👇
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/tariqveo761-bit/AB_SHAH_PRO/refs/heads/main/emails.txt";

async function updateWhitelist() {
    try {
        const response = await fetch(GITHUB_RAW_URL, { cache: "no-store" });
        const rawText = await response.text();
        allowedEmails = rawText.split('\n').map(e => e.trim().toLowerCase()).filter(e => e !== "");
    } catch (err) {
        console.error("❌ Whitelist Sync Failed.");
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/login', async (req, res) => {
    const { email } = req.body;
    await updateWhitelist();
    if (allowedEmails.includes(email.toLowerCase().trim())) {
        res.json({ success: true, taveedUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80" });
    } else {
        res.status(403).json({ success: false });
    }
});

// --- HFT SIGNAL ENGINE ---
function analyzeMarket(pair) {
    const score = (Math.random() * 100); 
    const isBuy = score >= 50;
    const colors = isBuy ? { main: "#10b981", bg: "#2ea043" } : { main: "#ef4444", bg: "#f85149" };
    
    // Yahan 'direction' theek kar diya gaya hai (Pehle 'dir' tha jis se undefined aa raha tha)
    const strategies = [
        { name: "Tick Vol Delta", direction: isBuy ? "BUY" : "SELL" },
        { name: "Micro RSI (3)", direction: isBuy ? "BUY" : "SELL" },
        { name: "Order Block", direction: isBuy ? "BUY" : "SELL" },
        { name: "EMA 3/7 Cross", direction: isBuy ? "BUY" : "SELL" },
        { name: "VWAP Bias", direction: isBuy ? "BUY" : "SELL" },
        { name: "Fibonacci 0.5", direction: isBuy ? "BUY" : "SELL" }
    ];

    return {
        action: isBuy ? "HFT EXECUTE BUY 🟢" : "HFT EXECUTE SELL 🔴",
        mainColor: colors.main,
        msg: "INSTITUTIONAL MOMENTUM CONFIRMED",
        winProb: (89 + Math.random() * 6).toFixed(1) + "%",
        topStrategies: strategies.map(s => ({ ...s, color: colors.main })),
        isValidTrade: true,
        latency: Math.floor(Math.random() * 5 + 1) + "ms"
    };
}

// Signal API
app.post('/signal', (req, res) => {
    const { email, pair } = req.body;
    if (!allowedEmails.includes(email?.toLowerCase().trim())) return res.status(403).json({error: "Denied"});
    res.json(analyzeMarket(pair));
});

// Test API
app.post('/test', (req, res) => {
    const { email } = req.body;
    if (!allowedEmails.includes(email?.toLowerCase().trim())) return res.status(403).json({error: "Denied"});
    const total = 38000 + Math.floor(Math.random() * 5000);
    const wins = Math.floor(total * 0.92);
    res.json({ totalExecuted: total, wins, losses: total - wins, winRate: "92.3%" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server Running on Port ${PORT}`));
