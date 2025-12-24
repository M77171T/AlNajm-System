const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// تشغيل الواجهة الرسومية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// جلب البيانات من الملف
app.get('/data', (req, res) => {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    res.json(data);
});

// إضافة بيانات جديدة
app.post('/add', (req, res) => {
    const newData = req.body;
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    data.push(newData);
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`✅ نظام النجم يعمل الآن على: http://localhost:${PORT}`);
});
