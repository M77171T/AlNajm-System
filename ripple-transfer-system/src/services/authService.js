const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/index');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

class AuthService {
    async register(userData) {
        const { username, email, password, phone } = userData;
        try {
            const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
            if (existingUser) throw new Error('البريد الإلكتروني أو اسم المستخدم موجود مسبقاً');
            
            const passwordHash = await bcrypt.hash(password, 12);
            const stmt = db.prepare(`INSERT INTO users (username, email, password_hash, phone) VALUES (?, ?, ?, ?)`);
            const result = stmt.run(username, email, passwordHash, phone || null);
            const token = this.generateToken(result.lastInsertRowid, username);
            
            return {
                success: true,
                message: 'تم تسجيل المستخدم بنجاح',
                user: { id: result.lastInsertRowid, username, email, phone },
                token
            };
        } catch (error) {
            console.error('خطأ في التسجيل:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    async login(identifier, password) {
        try {
            const user = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(identifier, identifier);
            if (!user) throw new Error('المستخدم غير موجود');
            
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) throw new Error('كلمة المرور غير صحيحة');
            
            const token = this.generateToken(user.id, user.username);
            return {
                success: true,
                message: 'تم تسجيل الدخول بنجاح',
                user: { id: user.id, username: user.username, email: user.email, kyc_status: user.kyc_status },
                token
            };
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    generateToken(userId, username) {
        return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    
    verifyToken(token) {
        try { return jwt.verify(token, JWT_SECRET); } 
        catch (error) { console.error('خطأ في التحقق من الـ token:', error.message); return null; }
    }
    
    getUserById(userId) {
        return db.prepare('SELECT id, username, email, phone, kyc_status FROM users WHERE id = ?').get(userId);
    }
}

module.exports = new AuthService();
