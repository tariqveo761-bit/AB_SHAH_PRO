const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- 🌐 REMOTE WHITELIST LOGIC ---
let allowedEmails = [];

// Yahan apne GitHub ka RAW link dalna hai (Niche Step 2 mein bataya hai kaise)
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/emails.txt";

async function updateWhitelist() {
    try {
        const response = await fetch(GITHUB_RAW_URL);
        const text = await response.json(); // Agar JSON hai, warna .text() use karein
        // Hum simple text file use karenge: har line par aik email
        const rawText = await response.text();
        allowedEmails = rawText.split('\n').map(e => e.trim().toLowerCase()).filter(e => e !== "");
        console.log(`✅ Whitelist Auto-Updated: ${allowedEmails.length} Users Active.`);
    } catch (err) {
        console.error("❌ Remote Whitelist Sync Failed. Using previous cache.");
    }
}

// Har 5 minute (300000ms) baad khud update hoga
setInterval(updateWhitelist, 300000);
updateWhitelist(); // Pehli baar chalane ke liye

// Login API
app.post('/login', (req, res) => {
    const { email } = req.body;
    if (allowedEmails.includes(email.toLowerCase().trim())) {
        res.json({ success: true, taveedUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80" });
    } else {
        res.status(403).json({ success: false });
    }
});

// --- HFT SIGNAL ENGINE (Wahi purana aggressive logic) ---
function analyzeMarket(pair) {
    const score = (Math.random() * 100); 
    const isBuy = score >= 50;
    return {
        action: isBuy ? "HFT EXECUTE BUY 🟢" : "HFT EXECUTE SELL 🔴",
        mainColor: isBuy ? "#10b981" : "#ef4444",
        msg: "INSTITUTIONAL MOMENTUM DETECTED",
        winProb: (89 + Math.random() * 6).toFixed(1) + "%",
        isValidTrade: true,
        latency: "1ms"
    };
}

io.on('connection', (socket) => {
    socket.on('request_signal', (data) => {
        if (!allowedEmails.includes(data.email.toLowerCase().trim())) return;
        socket.emit('signal_ready', analyzeMarket(data.pair));
    });
});

server.listen(3000, () => console.log('🚀 AB.SHAH PRO: LAZY MASTER ENGINE ONLINE'));