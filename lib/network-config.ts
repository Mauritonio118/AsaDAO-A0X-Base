// Centralized Base network configuration
export const BASE_MAINNET = {
  chainId: 8453,
  name: "Base",
  currency: "ETH",
  rpcUrl: "https://mainnet.base.org",
  blockExplorer: "https://basescan.org",
} as const

export const BASE_SEPOLIA = {
  chainId: 84532,
  name: "Base Sepolia",
  currency: "ETH",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org",
} as const

// Default network (mainnet)
export const DEFAULT_NETWORK = BASE_MAINNET

// All supported networks
export const SUPPORTED_NETWORKS = [BASE_MAINNET, BASE_SEPOLIA] as const

// Helper functions
export function getNetworkById(chainId: number) {
  return SUPPORTED_NETWORKS.find((network) => network.chainId === chainId)
}

export function getNetworkName(chainId: number | null): string {
  if (!chainId) return "Unknown"

  const network = getNetworkById(chainId)
  if (network) return network.name

  // Common networks for display
  switch (chainId) {
    case 1:
      return "Ethereum"
    default:
      return `Chain ${chainId}`
  }
}

export function isBaseNetwork(chainId: number | null): boolean {
  return chainId === BASE_MAINNET.chainId || chainId === BASE_SEPOLIA.chainId
}

export function getExplorerUrl(chainId: number, type: "tx" | "address" = "tx"): string {
  const network = getNetworkById(chainId) || DEFAULT_NETWORK
  return `${network.blockExplorer}/${type}`
}

export function getRpcUrl(chainId: number): string {
  const network = getNetworkById(chainId) || DEFAULT_NETWORK
  return network.rpcUrl
}
