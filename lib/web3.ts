import { ethers } from "ethers"
import { BASE_MAINNET, getRpcUrl } from "./network-config"

//export { BASE_MAINNET, BASE_SEPOLIA } from "./network-config"

// Get RPC provider for Base network (independent of wallet state)
export function getRpcProvider(chainId: number = BASE_MAINNET.chainId) {
  const rpcUrl = getRpcUrl(chainId)
  return new ethers.JsonRpcProvider(rpcUrl)
}

// Get provider for Base network
export function getProvider(chainId: number = BASE_MAINNET.chainId) {
  if (typeof window !== "undefined" && window.ethereum) {
    // Check if wallet is connected and on correct network
    const provider = new ethers.BrowserProvider(window.ethereum)
    // For now, return browser provider but consider using getRpcProvider for read operations
    return provider
  }

  const rpcUrl = getRpcUrl(chainId)
  return new ethers.JsonRpcProvider(rpcUrl)
}

// Get signer (requires connected wallet)
export async function getSigner() {
  if (typeof window !== "undefined" && window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum)
    return await provider.getSigner()
  }
  throw new Error("No wallet connected")
}

// Format address for display
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format ETH amount
export function formatEther(wei: bigint): string {
  return ethers.formatEther(wei)
}

// Parse ETH amount to wei
export function parseEther(ether: string): bigint {
  return ethers.parseEther(ether)
}

// Utility functions for token operations
export function formatCOALAmount(amount: bigint, decimals: number, displayDecimals = 4): string {
  const formatted = ethers.formatUnits(amount, decimals)
  const num = Number.parseFloat(formatted)
  return num.toFixed(displayDecimals).replace(/\.?0+$/, "")
}

export function parseCOALAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals)
}

export function isValidNumber(value: string): boolean {
  return /^\d*\.?\d*$/.test(value) && value !== "" && Number.parseFloat(value) > 0
}
