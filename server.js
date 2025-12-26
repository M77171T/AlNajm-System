const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

function generateHash(data) {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

app.get('/data', (req, res) => {
    try {
        if (!fs.existsSync('data.json')) fs.writeFileSync('data.json', '[]');
        const data = fs.readFileSync('data.json', 'utf8');
        res.json(JSON.parse(data || '[]'));
    } catch (e) { res.json([]); }
});

app.post('/add', (req, res) => {
    try {
        let data = JSON.parse(fs.readFileSync('data.json', 'utf8') || '[]');
        const newEntry = {
            id: Date.now(),
            name: req.body.name,
            amount: req.body.amount,
            currency: req.body.currency,
            time: new Date().toLocaleString('ar-YE'),
            hash: ""
        };
        newEntry.hash = generateHash(newEntry);
        data.push(newEntry);
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => {
    console.log('🚀 النظام جاهز للرفع على المنفذ: ' + PORT);
});
