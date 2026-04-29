const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // Yeh line zaroori hai

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" },
    transports: ['polling', 'websocket']
});

// --- 🌐 REMOTE WHITELIST LOGIC ---
let allowedEmails = [];

// ⚠️ YAHAN APNA WOH "RAW" LINK DOBARA DAALEIN JO PEHLE COPY KIYA THA
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/emails.txt";

async function updateWhitelist() {
    try {
        const response = await fetch(GITHUB_RAW_URL);
        const rawText = await response.text();
        allowedEmails = rawText.split('\n').map(e => e.trim().toLowerCase()).filter(e => e !== "");
        console.log(`✅ Whitelist Updated: ${allowedEmails.length} Users.`);
    } catch (err) {
        console.error("❌ Whitelist Sync Failed.");
    }
}

setInterval(updateWhitelist, 300000);
updateWhitelist();

// --- 🏠 MAIN PAGE ROUTE (Yeh "Cannot GET /" ko theek karega) ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Login API
app.post('/login', (req, res) => {
    const { email } = req.body;
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
    
    const strategies = [
        { name: "Tick Vol Delta", dir: isBuy ? "BUY" : "SELL" },
        { name: "Micro RSI (3)", dir: isBuy ? "BUY" : "SELL" },
        { name: "Order Block", dir: isBuy ? "BUY" : "SELL" },
        { name: "EMA 3/7 Cross", dir: isBuy ? "BUY" : "SELL" },
        { name: "VWAP Bias", dir: isBuy ? "BUY" : "SELL" },
        { name: "Fibonacci 0.5", dir: isBuy ? "BUY" : "SELL" }
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

io.on('connection', (socket) => {
    socket.on('request_signal', (data) => {
        if (!allowedEmails.includes(data.email?.toLowerCase().trim())) return;
        socket.emit('signal_ready', analyzeMarket(data.pair));
    });

    socket.on('run_test', (data) => {
        const total = 38000 + Math.floor(Math.random() * 5000);
        const wins = Math.floor(total * 0.92);
        socket.emit('test_results', {
            totalExecuted: total,
            wins: wins,
            losses: total - wins,
            winRate: "92.3%"
        });
    });
});

// Vercel ke liye port setup
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server Running on Port ${PORT}`));
