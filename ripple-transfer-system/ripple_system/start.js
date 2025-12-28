const xrpl = require("xrpl");

async function main() {
    console.log("🚀 جاري الاتصال بشركة ريبل العالمية...");
    const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    console.log("🔐 جاري إنشاء الخزينة المركزية (التي ستحمل المليار)...");
    const wallet = xrpl.Wallet.generate();

    console.log("\n--- تم بنجاح! احتفظ بهذه البيانات سرية ---");
    console.log("العنوان (Address): " + wallet.address);
    console.log("المفتاح السري (Secret): " + wallet.seed);
    console.log("-------------------------------------------\n");

    await client.disconnect();
}
main();
