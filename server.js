const http = require('http');
const fs = require('fs');

const DATA_FILE = './data.json';

// وظيفة قراءة البيانات
function loadData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initial = { balance: 5000, transactions: [] };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial));
        return initial;
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

// وظيفة حفظ البيانات
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
    let data = loadData();
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/send') {
        const name = url.searchParams.get('name');
        const amount = parseInt(url.searchParams.get('amount'));
        if (name && amount && amount <= data.balance) {
            data.balance -= amount;
            data.transactions.unshift({ name, amount, date: new Date().toLocaleString() });
            saveData(data);
            res.writeHead(200, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({ success: true }));
        }
    }

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    const rows = data.transactions.map(t => `<tr><td>${t.name}</td><td>${t.amount}$</td><td>✅ ناجحة</td></tr>`).join('');

    res.end(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>خزنة النجم</title>
    <style>
        body { font-family: sans-serif; background: #f0f2f5; text-align: center; padding: 20px; }
        .card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); max-width: 400px; margin: auto; }
        .balance { font-size: 35px; color: #28a745; font-weight: bold; }
        input { width: 85%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px; }
        button { background: #1a73e8; color: white; border: none; padding: 12px; width: 90%; border-radius: 8px; font-weight: bold; cursor: pointer; }
        table { width: 100%; margin-top: 20px; border-collapse: collapse; }
        th, td { border-bottom: 1px solid #ddd; padding: 10px; }
    </style></head>
    <body>
        <div class="card">
            <h1>🌟 خزنة النجم الذكية</h1>
            <div class="balance">${data.balance}$</div>
            <p>الرصيد المحفوظ</p>
            <input type="text" id="n" placeholder="اسم المستلم">
            <input type="number" id="a" placeholder="المبلغ">
            <button onclick="send()">إرسال وحفظ دائم</button>
            <table><tr><th>المستلم</th><th>المبلغ</th><th>الحالة</th></tr>${rows}</table>
        </div>
        <script>
            async function send() {
                const n = document.getElementById('n').value;
                const a = document.getElementById('a').value;
                if(!n || !a) return alert('أدخل البيانات');
                const res = await fetch('/send?name=' + encodeURIComponent(n) + '&amount=' + a);
                const json = await res.json();
                if(json.success) location.reload(); else alert('خطأ في الرصيد');
            }
        </script>
    </body></html>`);
});

server.listen(3000, () => console.log('🚀 نظام النجم متصل بالقاعدة الآن!'));
