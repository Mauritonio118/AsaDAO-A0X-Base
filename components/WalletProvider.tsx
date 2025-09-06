"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { BASE_MAINNET, BASE_SEPOLIA, isBaseNetwork } from "@/lib/network-config"

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
const BASE_TESTNET_CHAIN_ID = BASE_SEPOLIA.chainId

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    isConnecting: false,
    error: null,
  })

  const checkConnection = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        const chainId = await window.ethereum.request({ method: "eth_chainId" })

        const normalizedChainId = chainId.startsWith("0x") ? Number.parseInt(chainId, 16) : Number(chainId)

        if (accounts.length > 0) {
          setWallet((prev) => ({
            ...prev,
            address: accounts[0],
            isConnected: true,
            chainId: normalizedChainId,
            error: null,
          }))
        } else {
          setWallet((prev) => ({
            ...prev,
            address: null,
            isConnected: false,
            chainId: normalizedChainId,
          }))
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }, [])

  const connectWallet = async () => {
    if (!window.ethereum) {
      setWallet((prev) => ({ ...prev, error: "MetaMask not installed" }))
      return
    }

    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      const chainId = await window.ethereum.request({ method: "eth_chainId" })

      setWallet((prev) => ({
        ...prev,
        address: accounts[0],
        isConnected: true,
        chainId: Number.parseInt(chainId, 16),
        isConnecting: false,
        error: null,
      }))
    } catch (error: any) {
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || "Failed to connect wallet",
      }))
    }
  }

  const disconnectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        })
      } catch (error) {
        try {
          if (window.ethereum.disconnect) {
            await window.ethereum.disconnect()
          }
        } catch (disconnectError) {
          console.log("Disconnect method not available, clearing local state only")
        }
      }
    }

    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
      isConnecting: false,
      error: null,
    })
  }, [])

  const switchToBase = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
      })
      await checkConnection()
    } catch (error: any) {
      if (error.code === 4902) {
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
          await checkConnection()
        } catch (addError) {
          console.error("Error adding Base network:", addError)
        }
      }
      await checkConnection()
    }
  }

  const isOnBase = isBaseNetwork(wallet.chainId)

  useEffect(() => {
    console.log("[v0] WalletProvider useEffect - setting up event listeners")
    checkConnection()

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("[v0] Accounts changed:", accounts)
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setWallet((prev) => ({ ...prev, address: accounts[0] }))
        }
      }

      const handleChainChanged = (chainId: string) => {
        console.log("[v0] Chain changed event received:", chainId)
        const id = chainId.startsWith("0x") ? Number.parseInt(chainId, 16) : Number(chainId)
        console.log("[v0] Converted chainId to number:", id)
        console.log("[v0] Previous wallet state:", wallet)
        setWallet((prev) => {
          const newState = { ...prev, chainId: id }
          console.log("[v0] New wallet state:", newState)
          return newState
        })
        console.log("[v0] Calling checkConnection after chain change")
        checkConnection()
      }

      const handleDisconnect = () => {
        console.log("[v0] Disconnect event received")
        disconnectWallet()
      }

      console.log("[v0] Registering ethereum event listeners")
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("disconnect", handleDisconnect)

      return () => {
        console.log("[v0] Cleaning up ethereum event listeners")
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
        window.ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [checkConnection, disconnectWallet])

  const contextValue: WalletContextType = {
    ...wallet,
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
