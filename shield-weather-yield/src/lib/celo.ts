import { BrowserProvider, JsonRpcProvider } from "ethers";

export const CELO_ALFAJORES_RPC = "https://alfajores-forno.celo-testnet.org";

export function getBrowserProvider(): BrowserProvider | null {
  if (typeof window === "undefined") return null;
  const anyWindow = window as any;
  if (anyWindow.ethereum) {
    return new BrowserProvider(anyWindow.ethereum);
  }
  return null;
}

export function getJsonRpcProvider(): JsonRpcProvider {
  return new JsonRpcProvider(CELO_ALFAJORES_RPC, 44787);
}



