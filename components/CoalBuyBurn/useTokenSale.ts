"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ethers, formatUnits } from "ethers"
import { useWallet } from "@/hooks/use-wallet"
import { getSigner, getProvider, getRpcProvider } from "@/lib/web3"
import { TOKENS, SALE } from "@/lib/contracts"
import type { TokenPurchaseState } from "./types"

const QUOTE_DEBOUNCE_MS = 400

const isValidInteger = (value: string): boolean => {
  return /^[1-9]\d*$/.test(value)
}

const filterIntegerInput = (value: string): string => {
  // Remove any non-digit characters
  const digitsOnly = value.replace(/\D/g, "")
  // Remove leading zeros
  return digitsOnly.replace(/^0+/, "") || ""
}

type ActionType = "approve" | "buy" | null

export function useTokenSale() {
  const { address, isOnBase } = useWallet()
  const actionIdRef = useRef(0)
  const currentActionRef = useRef<ActionType>(null)

  const [state, setState] = useState<TokenPurchaseState>({
    coalAmountInput: "",
    saleAmount: null,
    usdcQuote: null,
    tokenPrice: null,
    allowance: 0n,
    usdcBalance: 0n,
    coalBalance: 0n,
    availableInventory: 0n,
    availableTokensInt: 0,
    isQuoting: false,
    isApproving: false,
    isBuying: false,
    approveResult: null,
    buyResult: null,
    validationError: null,
  })

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      approveResult: null,
      buyResult: null,
      validationError: null,
    }))
  }, [])

  const startNewAction = useCallback((actionType: ActionType) => {
    actionIdRef.current += 1
    currentActionRef.current = actionType
    setState((prev) => ({
      ...prev,
      validationError: null,
    }))
    return actionIdRef.current
  }, [])

  const loadInventory = useCallback(async () => {
    try {
      const provider = getRpcProvider()
      const saleContract = new ethers.Contract(SALE.address, SALE.abi, provider)
      const availableInventory = await saleContract.availableInventory()
      const availableTokensInt = Number(availableInventory / 10n ** 18n)

      setState((prev) => ({
        ...prev,
        availableInventory,
        availableTokensInt,
      }))
    } catch (error) {
      console.error("Inventory loading error:", error)
    }
  }, [])

  const loadTokenPrice = useCallback(async () => {
    if (state.tokenPrice) return

    try {
      console.log("[v0] Loading token price...")
      const provider = getRpcProvider()
      const saleContract = new ethers.Contract(SALE.address, SALE.abi, provider)
      const oneToken = 10n ** 18n

      console.log("[v0] Calling quote with oneToken:", oneToken.toString())
      console.log("[v0] Contract address:", SALE.address)

      const code = await provider.getCode(SALE.address)
      if (code === "0x") {
        throw new Error("Contract not deployed at address")
      }

      const tokenPrice = await saleContract.quote(oneToken)
      console.log("[v0] Token price loaded:", tokenPrice.toString())

      setState((prev) => ({
        ...prev,
        tokenPrice,
      }))
    } catch (error) {
      console.error("Token price loading error:", error)
      setState((prev) => ({
        ...prev,
        tokenPrice: 0n, // This will prevent infinite retries
      }))
    }
  }, [state.tokenPrice])

  const loadBalances = useCallback(async () => {
    if (!address || !isOnBase) return

    try {
      const provider = getProvider()
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, TOKENS.USDC.abi, provider)
      const coalContract = new ethers.Contract(TOKENS.COAL.address, TOKENS.COAL.abi, provider)

      const [usdcBalance, coalBalance, allowance] = await Promise.all([
        usdcContract.balanceOf(address),
        coalContract.balanceOf(address),
        usdcContract.allowance(address, SALE.address),
      ])

      setState((prev) => ({
        ...prev,
        usdcBalance,
        coalBalance,
        allowance,
      }))
    } catch (error) {
      console.error("Balance loading error:", error)
    }
  }, [address, isOnBase])

  useEffect(() => {
    if (!state.coalAmountInput || !isValidInteger(state.coalAmountInput) || !state.tokenPrice) {
      setState((prev) => ({
        ...prev,
        usdcQuote: null,
        saleAmount: null,
        validationError: null,
      }))
      return
    }

    const inputTokens = Number.parseInt(state.coalAmountInput)
    const saleAmount = BigInt(inputTokens) * 10n ** 18n
    const usdcQuote = state.tokenPrice * BigInt(inputTokens)

    if (inputTokens > state.availableTokensInt && state.availableTokensInt > 0) {
      setState((prev) => ({
        ...prev,
        validationError: `Amount exceeds available inventory (${state.availableTokensInt} tokens)`,
        usdcQuote,
        saleAmount,
      }))
      return
    }

    setState((prev) => ({
      ...prev,
      saleAmount,
      usdcQuote,
      validationError: null,
    }))
  }, [state.coalAmountInput, state.tokenPrice, state.availableTokensInt])

  useEffect(() => {
    loadTokenPrice()
    loadInventory()
  }, [loadTokenPrice, loadInventory])

  useEffect(() => {
    loadBalances()
  }, [loadBalances])

  const setCOALAmount = (amount: string) => {
    const filteredAmount = filterIntegerInput(amount)
    clearResults()
    setState((prev) => ({ ...prev, coalAmountInput: filteredAmount }))
  }

  const approveUSDC = async () => {
    if (!address || !state.usdcQuote) return

    const actionId = startNewAction("approve")

    try {
      setState((prev) => ({ ...prev, isApproving: true }))

      const signer = await getSigner()
      const usdcContract = new ethers.Contract(TOKENS.USDC.address, TOKENS.USDC.abi, signer)

      if (state.allowance > 0n && state.allowance !== state.usdcQuote) {
        const zeroTx = await usdcContract.approve(SALE.address, 0n)
        await zeroTx.wait()
      }

      const approveTx = await usdcContract.approve(SALE.address, state.usdcQuote)
      await approveTx.wait()
      await loadBalances()

      if (actionId === actionIdRef.current && currentActionRef.current === "approve") {
        setState((prev) => ({
          ...prev,
          isApproving: false,
          approveResult: {
            success: true,
            error: null,
            txHash: approveTx.hash,
            timestamp: Date.now(),
          },
        }))
      }
    } catch (error: any) {
      console.error("Approval error:", error)
      if (actionId === actionIdRef.current && currentActionRef.current === "approve") {
        setState((prev) => ({
          ...prev,
          isApproving: false,
          approveResult: {
            success: false,
            error: error.reason || error.message || "Approval failed",
            txHash: null,
            timestamp: Date.now(),
          },
        }))
      }
    }
  }

  const buyCOAL = async () => {
    if (!address || !state.saleAmount || !state.usdcQuote) return

    const actionId = startNewAction("buy")

    try {
      setState((prev) => ({ ...prev, isBuying: true }))

      const signer = await getSigner()
      const saleContract = new ethers.Contract(SALE.address, SALE.abi, signer)

      const buyTx = await saleContract.buy(state.saleAmount, state.usdcQuote)
      await buyTx.wait()

      await Promise.all([loadBalances(), loadInventory()])

      if (actionId === actionIdRef.current && currentActionRef.current === "buy") {
        setState((prev) => ({
          ...prev,
          isBuying: false,
          coalAmountInput: "",
          saleAmount: null,
          usdcQuote: null,
          buyResult: {
            success: true,
            error: null,
            txHash: buyTx.hash,
            timestamp: Date.now(),
          },
        }))
      }
    } catch (error: any) {
      console.error("Buy error:", error)
      if (actionId === actionIdRef.current && currentActionRef.current === "buy") {
        setState((prev) => ({
          ...prev,
          isBuying: false,
          buyResult: {
            success: false,
            error: error.reason || error.message || "Purchase failed",
            txHash: null,
            timestamp: Date.now(),
          },
        }))
      }

      if (error.reason?.includes("maxPayment") || error.reason?.includes("inventory")) {
        setTimeout(async () => {
          await loadInventory()
          setState((prev) => ({ ...prev, coalAmountInput: prev.coalAmountInput + "" }))
        }, 1000)
      }
    }
  }

  const dismissResult = (resultType: "approve" | "buy") => {
    setState((prev) => ({
      ...prev,
      [resultType === "approve" ? "approveResult" : "buyResult"]: null,
    }))
  }

  const formatUSDCAmount = (amount: bigint) => {
    const formatted = formatUnits(amount, TOKENS.USDC.decimals)
    return Number.parseFloat(formatted).toFixed(3)
  }

  const inputTokens = isValidInteger(state.coalAmountInput) ? Number.parseInt(state.coalAmountInput) : 0
  const isValidInput = inputTokens > 0 && inputTokens <= state.availableTokensInt
  const canApprove = isOnBase && state.usdcQuote && state.allowance < state.usdcQuote && isValidInput
  const canBuy =
    isOnBase &&
    state.usdcQuote &&
    state.allowance >= state.usdcQuote &&
    state.usdcBalance >= state.usdcQuote &&
    isValidInput

  const hasInsufficientBalance = state.usdcQuote && state.usdcBalance < state.usdcQuote

  return {
    state,
    setCOALAmount,
    approveUSDC,
    buyCOAL,
    dismissResult,
    formatUSDCAmount,
    canApprove,
    canBuy,
    hasInsufficientBalance,
    isValidInput,
    clearResults,
  }
}
