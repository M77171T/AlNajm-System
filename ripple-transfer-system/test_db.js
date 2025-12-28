require('dotenv').config();
const db = require('./src/models/index');
console.log('🧪 اختبار قاعدة البيانات...');
const wallets = db.prepare('SELECT COUNT(*) as count FROM wallets').get();
const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
console.log(`   ✅ قاعدة البيانات تعمل. الجداول: wallets(${wallets.count}), users(${users.count})`);
