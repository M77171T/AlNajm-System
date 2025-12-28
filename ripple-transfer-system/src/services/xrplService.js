const xrpl = require("xrpl");

class XRPLService {
    constructor() {
        this.client = null;
        this.TESTNET_URL = process.env.TESTNET_WS_URL;
    }

    async connect() {
        if (!this.client || !this.client.isConnected()) {
            this.client = new xrpl.Client(this.TESTNET_URL);
            await this.client.connect();
            console.log("✅ متصل بـ XRPL Testnet");
        }
        return this.client;
    }

    async disconnect() {
        if (this.client && this.client.isConnected()) await this.client.disconnect();
    }

    async getBalance(address) {
        try {
            const client = await this.connect();
            const balance = await client.getXrpBalance(address);
            return { success: true, balance };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async sendPayment(fromWalletId, destinationAddress, amount) {
        try {
            const client = await this.connect();
            const wallet = await require('./walletService').getWalletForSigning(fromWalletId);
            if (!wallet) throw new Error('فشل تحميل محفظة المرسل');
            
            const tx = { "TransactionType": "Payment", "Account": wallet.address, "Amount": xrpl.xrpToDrops(amount.toString()), "Destination": destinationAddress };
            const prepared = await client.autofill(tx);
            const signed = wallet.sign(prepared);
            const result = await client.submitAndWait(signed.tx_blob);

            if (result.result.meta.TransactionResult === "tesSUCCESS") {
                const newBalance = await client.getXrpBalance(wallet.address);
                require('./walletService').updateWalletBalance(fromWalletId, newBalance);
                return { success: true, hash: result.result.hash, from: wallet.address, to: destinationAddress, amount: amount, newBalance: newBalance };
            } else {
                throw new Error(`فشل التحويل: ${result.result.meta.TransactionResult}`);
            }
        } catch (error) {
            console.error("خطأ في إرسال التحويل:", error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new XRPLService();
