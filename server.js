const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
app.use(express.json());
app.use(express.static('.'));

function generateHash(data) {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

app.get('/data', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8') || '[]');
        res.json(data);
    } catch (e) { res.json([]); }
});

app.post('/add', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data.json', 'utf8') || '[]');
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
    } catch (e) { res.status(500).send(e.message); }
});

app.listen(3000, () => {
    console.log('✅ تم استعادة نظام النجم (عملات + اتفاقية + تشفير)');
    console.log('🔗 الرابط: http://localhost:3000');
});
