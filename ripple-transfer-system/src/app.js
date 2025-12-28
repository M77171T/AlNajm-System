const express = require('express');
const mongoose = require('./models/index');
const User = require('./models/User');
const { createNewWallet } = require('./services/wallet');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const wallet = await createNewWallet();
        
        const newUser = new User({
            username,
            password,
            walletAddress: wallet.address,
            walletSeed: wallet.seed
        });

        await newUser.save();
        res.json({ 
            status: "success", 
            message: "✅ تم إنشاء الحساب ومحفظة XRP بنجاح",
            data: {
                username: newUser.username,
                address: newUser.walletAddress
            }
        });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.listen(4000, () => {
    console.log(`🚀 النظام يعمل على المنفذ 4000 وجاهز للتسجيل`);
});
