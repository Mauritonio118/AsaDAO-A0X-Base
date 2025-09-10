import usdcAbi from "./abi/usdc.json"
import coalAbi from "./abi/probando.json"
import tokenSaleAbi from "./abi/tokenSale1.json"
import { DEFAULT_NETWORK, getExplorerUrl } from "./network-config"

export const NETWORK = "base"
export const CHAIN_ID = DEFAULT_NETWORK.chainId

export const TOKENS = {
  USDC: {
    name: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    explorer: `https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`,
    abi: usdcAbi,
  },
  COAL: {
    name: "COAL",
    address: "0xE9510a43830D09f01f9930183534755cFC15880a",
    decimals: 18,
    explorer: `https://basescan.org/address/0xE9510a43830D09f01f9930183534755cFC15880a`,
    abi: coalAbi,
  },
}

export const SALE = {
  name: "COALSale1",
  address: "0x454DdC797B4B7a5F4149d56A5338E85635697656",
  explorer: `https://basescan.org/address/0x454DdC797B4B7a5F4149d56A5338E85635697656#code`,
  abi: tokenSaleAbi,
}

export const BURN_CONFIG = {
  INITIAL_MAX_SUPPLY_HUMAN: 1_000_000,
  INITIAL_MAX_SUPPLY_WEI: 1_000_000n * 10n ** 18n,
}
