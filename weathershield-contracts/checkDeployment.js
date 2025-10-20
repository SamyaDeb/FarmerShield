const Web3 = require("web3");

const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

const addresses = [
  { name: "FarmerRegistry", addr: "0x805dE0a2FC7e4818D19366f7191B162cB84dE89a" },
  { name: "PremiumPool", addr: "0xbfA80344cD3f706C80EF9924560E87E422507867" },
  { name: "PayoutManager", addr: "0x43A839630a3dB74dE461628bb5A665A22D4f8b90" },
];

async function checkAll() {
  for (const c of addresses) {
    const code = await web3.eth.getCode(c.addr);
    console.log(`${c.name}: ${code === "0x" ? "❌ Not Deployed" : "✅ Deployed"}`);
  }
}

checkAll();
