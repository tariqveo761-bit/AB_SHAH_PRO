import { createClient } from '@vercel/edge-config';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { email, deviceId } = req.body;
    const config = createClient(process.env.EDGE_CONFIG);

    try {
        // 1. Edge Config se licensed users ki list uthayen
        const licensedUsers = await config.get('users') || {};

        // 2. Check karein ke email valid hai ya nahi
        if (!licensedUsers[email]) {
            return res.status(403).json({ 
                success: false, 
                message: 'No active license found for this email. Contact AB.SHAH.' 
            });
        }

        const registeredDevice = licensedUsers[email];

        // 3. Hardware Lock Logic
        if (registeredDevice === "NEW") {
            // Agar naya user hai, toh ye device uska permanent lock ban jayega
            // Note: Edge Config read-only hota hai API se, 
            // Isliye pehli baar aapko Vercel Dashboard mein ID khud likhni hogi (Step 3 dekhein)
            return res.status(200).json({ 
                success: false, 
                message: `REGISTRATION REQUIRED: Please send your Device ID to Admin: ${deviceId}` 
            });
        }

        if (registeredDevice === deviceId) {
            return res.status(200).json({ success: true, message: 'Access Granted' });
        } else {
            return res.status(401).json({ 
                success: false, 
                message: 'SECURITY VIOLATION: License locked to another device.' 
            });
        }

    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Configuration Error' });
    }
}
