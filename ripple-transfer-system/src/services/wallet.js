const xrpl = require('xrpl');
async function createNewWallet() {
    const wallet = xrpl.Wallet.generate();
    return {
        address: wallet.address,
        seed: wallet.seed,
        publicKey: wallet.publicKey
    };
}
module.exports = { createNewWallet };
