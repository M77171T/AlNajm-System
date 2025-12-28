const crypto = require('crypto');
const { Wallet } = require('xrpl');
const db = require('../models/index');

class WalletService {
    constructor() {
        this.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
        this.IV_LENGTH = 16;
    }

    encrypt(text) {
        let iv = crypto.randomBytes(this.IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    decrypt(text) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(this.ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        return Buffer.concat([decrypted, decipher.final()]).toString();
    }

    async createNewWallet(userId) {
        try {
            const wallet = Wallet.generate();
            const encryptedSeed = this.encrypt(wallet.seed);
            const walletId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const stmt = db.prepare(`INSERT INTO wallets (wallet_id, user_id, address, encrypted_seed, public_key, balance) VALUES (?, ?, ?, ?, ?, ?)`);
            stmt.run(walletId, userId, wallet.address, encryptedSeed, wallet.publicKey, '0');
            
            return { success: true, walletId, address: wallet.address, publicKey: wallet.publicKey, message: 'تم إنشاء المحفظة بنجاح' };
        } catch (error) {
            console.error('خطأ في إنشاء المحفظة:', error);
            return { success: false, error: error.message };
        }
    }

    getWallet(walletId) {
        const stmt = db.prepare('SELECT * FROM wallets WHERE wallet_id = ?');
        return stmt.get(walletId);
    }

    async getWalletForSigning(walletId) {
        try {
            const stmt = db.prepare('SELECT encrypted_seed FROM wallets WHERE wallet_id = ?');
            const row = stmt.get(walletId);
            if (!row) throw new Error('المحفظة غير موجودة');
            const decryptedSeed = this.decrypt(row.encrypted_seed);
            return Wallet.fromSeed(decryptedSeed);
        } catch (error) {
            console.error('خطأ في استرجاع المحفظة:', error);
            return null;
        }
    }

    updateWalletBalance(walletId, newBalance) {
        const stmt = db.prepare('UPDATE wallets SET balance = ? WHERE wallet_id = ?');
        const result = stmt.run(newBalance, walletId);
        return result.changes > 0;
    }

    getUserWallets(userId) {
        const stmt = db.prepare('SELECT * FROM wallets WHERE user_id = ?');
        return stmt.all(userId);
    }
}

module.exports = new WalletService();
