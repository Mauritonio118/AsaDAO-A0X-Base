"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ethers, formatUnits } from "ethers"
import { useWallet } from "@/hooks/use-wallet"
import { getSigner, getProvider, getRpcProvider } from "@/lib/web3"
import { TOKENS, BURN_CONFIG } from "@/lib/contracts"
import type { COALBurnState } from "./types"

const isValidInteger = (value: string): boolean => {
  return /^[1-9]\d*$/.test(value)
}

const filterIntegerInput = (value: string): string => {
  // Remove any non-digit characters
  const digitsOnly = value.replace(/\D/g, "")
  // Remove leading zeros
  return digitsOnly.replace(/^0+/, "") || ""
}

export function useTokenBurn() {
  const { address, isOnBase } = useWallet()
  const actionIdRef = useRef(0)
  const currentActionRef = useRef<"burn" | null>(null)

  const [state, setState] = useState<COALBurnState>({
    burnAmountInput: "",
    userBalance: 0n,
    totalSupply: 0n,
    isBurning: false,
    burnResult: null,
    validationError: null,
  })

  const clearResults = useCallback(() => {
    setState((prev) => ({
      ...prev,
      burnResult: null,
      validationError: null,
    }))
  }, [])

  const startNewAction = useCallback(() => {
    actionIdRef.current += 1
    currentActionRef.current = "burn"
    // Only clear validation errors, keep transaction results
    setState((prev) => ({
      ...prev,
      validationError: null,
    }))
    return actionIdRef.current
  }, [])

  const loadTotalSupply = useCallback(async () => {
    try {
      const provider = getRpcProvider()
      const coalContract = new ethers.Contract(TOKENS.COAL.address, TOKENS.COAL.abi, provider)
      const totalSupply = await coalContract.totalSupply()

      setState((prev) => ({
        ...prev,
        totalSupply,
      }))
    } catch (error) {
      console.error("Total supply loading error:", error)
    }
  }, [])

  const loadUserBalance = useCallback(async () => {
    if (!address || !isOnBase) return

    try {
      const provider = getProvider()
      const coalContract = new ethers.Contract(TOKENS.COAL.address, TOKENS.COAL.abi, provider)
      const userBalance = await coalContract.balanceOf(address)

      setState((prev) => ({
        ...prev,
        userBalance,
      }))
    } catch (error) {
      console.error("User balance loading error:", error)
    }
  }, [address, isOnBase])

  useEffect(() => {
    loadTotalSupply()
  }, [loadTotalSupply])

  useEffect(() => {
    loadUserBalance()
  }, [loadUserBalance])

  const setBurnAmount = (amount: string) => {
    const filteredAmount = filterIntegerInput(amount)
    clearResults() // Clear on user input
    setState((prev) => ({ ...prev, burnAmountInput: filteredAmount }))
  }

  const setMaxAmount = () => {
    const maxInteger = Number(state.userBalance / 10n ** 18n)
    clearResults() // Clear on user action
    setState((prev) => ({ ...prev, burnAmountInput: maxInteger.toString() }))
  }

  const burnCOAL = async () => {
    if (!address || !isValidInteger(state.burnAmountInput)) return

    const inputTokens = Number.parseInt(state.burnAmountInput)
    const maxTokens = Number(state.userBalance / 10n ** 18n)

    if (inputTokens > maxTokens) {
      setState((prev) => ({
        ...prev,
        validationError: "Amount exceeds your balance",
      }))
      return
    }

    const actionId = startNewAction()

    try {
      setState((prev) => ({ ...prev, isBurning: true }))

      const signer = await getSigner()
      const coalContract = new ethers.Contract(TOKENS.COAL.address, TOKENS.COAL.abi, signer)

      const burnAmount = BigInt(inputTokens) * 10n ** 18n
      const burnTx = await coalContract.burn(burnAmount)
      await burnTx.wait()

      await Promise.all([loadTotalSupply(), loadUserBalance()])

      if (actionId === actionIdRef.current && currentActionRef.current === "burn") {
        setState((prev) => ({
          ...prev,
          isBurning: false,
          burnAmountInput: "",
          burnResult: {
            success: true,
            error: null,
            txHash: burnTx.hash,
            timestamp: Date.now(),
          },
        }))
      }
    } catch (error: any) {
      console.error("Burn error:", error)
      if (actionId === actionIdRef.current && currentActionRef.current === "burn") {
        setState((prev) => ({
          ...prev,
          isBurning: false,
          burnResult: {
            success: false,
            error: error.reason || error.message || "Fire failed",
            txHash: null,
            timestamp: Date.now(),
          },
        }))
      }
    }
  }

  const dismissResult = () => {
    setState((prev) => ({
      ...prev,
      burnResult: null,
    }))
  }

  const formatCOALAmount = (amount: bigint) => {
    const formatted = formatUnits(amount, TOKENS.COAL.decimals)
    return Number.parseFloat(formatted).toFixed(0)
  }

  const calculateBurnedPercentage = () => {
    const totalBurned = Math.max(
      0,
      BURN_CONFIG.INITIAL_MAX_SUPPLY_HUMAN - Number.parseFloat(formatUnits(state.totalSupply, 18)),
    )
    if (totalBurned === 0) return "0.00"
    return ((totalBurned / BURN_CONFIG.INITIAL_MAX_SUPPLY_HUMAN) * 100).toFixed(2)
  }

  const getTotalBurned = () => {
    return Math.max(0, BURN_CONFIG.INITIAL_MAX_SUPPLY_HUMAN - Number.parseFloat(formatUnits(state.totalSupply, 18)))
  }

  // Computed values
  const burnInputTokens = isValidInteger(state.burnAmountInput) ? Number.parseInt(state.burnAmountInput) : 0
  const maxTokens = Number(state.userBalance / 10n ** 18n)
  const isValidInput = burnInputTokens > 0 && burnInputTokens <= maxTokens
  const canBurn = isOnBase && isValidInput

  return {
    state,
    setBurnAmount,
    setMaxAmount,
    burnCOAL,
    dismissResult,
    formatCOALAmount,
    calculateBurnedPercentage,
    getTotalBurned,
    canBurn,
    maxTokens,
    clearResults, // For tab/account/network changes
  }
}
