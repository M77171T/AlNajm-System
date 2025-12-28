const authService = require('../services/authService');

function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'مصادقة مطلوبة. يرجى تقديم token صالح' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = authService.verifyToken(token);
        if (!decoded) return res.status(403).json({ success: false, error: 'Token غير صالح أو منتهي الصلاحية' });
        req.user = decoded; req.userId = decoded.userId; next();
    } catch (error) {
        return res.status(500).json({ success: false, error: 'خطأ في المصادقة' });
    }
}

module.exports = { authenticate };
