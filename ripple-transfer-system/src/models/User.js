const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    walletAddress: { type: String },
    walletSeed: { type: String },
    balance: { type: Number, default: 0 }
});
module.exports = mongoose.model('User', userSchema);
