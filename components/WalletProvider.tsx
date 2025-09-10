"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { BASE_MAINNET, isBaseNetwork } from "@/lib/network-config"
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi"

interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  switchToBase: () => Promise<void>
  isOnBase: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const BASE_CHAIN_ID = BASE_MAINNET.chainId

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { connect, connectors, isPending, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const connectWallet = useCallback(async () => {
    await connect({ connector: connectors[0] })
  }, [connect, connectors])

  const disconnectWallet = useCallback(async () => {
    disconnect()
  }, [disconnect])

  const switchToBase = useCallback(async () => {
    try {
      await switchChain({ chainId: BASE_CHAIN_ID })
    } catch (error: any) {
      if (error?.code === 4902 && window.ethereum) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
                chainName: BASE_MAINNET.name,
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [BASE_MAINNET.rpcUrl],
                blockExplorerUrls: [BASE_MAINNET.blockExplorer],
              },
            ],
          })
          await switchChain({ chainId: BASE_CHAIN_ID })
        } catch (addError) {
          console.error("Error adding Base network:", addError)
        }
      } else {
        console.error("Error switching network:", error)
      }
    }
  }, [switchChain])

  const isOnBase = isBaseNetwork(chainId)

  const contextValue: WalletContextType = {
    address: address ?? null,
    isConnected,
    chainId: chainId ?? null,
    isConnecting: isPending,
    error: connectError?.message ?? null,
    connectWallet,
    disconnectWallet,
    switchToBase,
    isOnBase,
  }

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider")
  }
  return context
}
