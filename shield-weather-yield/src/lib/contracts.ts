import { Contract, Provider, Signer } from "ethers";
import farmerRegistry from "./abi/FarmerRegistry.json";
import premiumPool from "./abi/PremiumPool.json";
import payoutManager from "./abi/PayoutManager.json";

export const ADDRESSES = {
  alfajores: {
    FarmerRegistry: "0x805dE0a2FC7e4818D19366f7191B162cB84dE89a",
    PremiumPool: "0xbfA80344cD3f706C80EF9924560E87E422507867",
    PayoutManager: "0x43A839630a3dB74dE461628bb5A665A22D4f8b90",
    cUSD: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
  },
} as const;

export function getFarmerRegistry(providerOrSigner: Provider | Signer) {
  return new Contract(
    ADDRESSES.alfajores.FarmerRegistry,
    (farmerRegistry as any).abi,
    providerOrSigner
  );
}

export function getPremiumPool(providerOrSigner: Provider | Signer) {
  return new Contract(
    ADDRESSES.alfajores.PremiumPool,
    (premiumPool as any).abi,
    providerOrSigner
  );
}

export function getPayoutManager(providerOrSigner: Provider | Signer) {
  return new Contract(
    ADDRESSES.alfajores.PayoutManager,
    (payoutManager as any).abi,
    providerOrSigner
  );
}



