"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/hooks/use-wallet"
import { TOKENS, SALE, BURN_CONFIG } from "@/lib/contracts"
import { useTokenSale } from "./useTokenSale"
import { useTokenBurn } from "./useTokenBurn"
import type { Tab } from "./types"

export function CoalBuyBurn() {
  const [activeTab, setActiveTab] = useState<Tab>("buy")
  const { address, isConnected, connectWallet, switchToBase, isOnBase, disconnectWallet } = useWallet()

  const {
    state: purchaseState,
    setCOALAmount,
    approveUSDC,
    buyCOAL,
    dismissResult: dismissPurchaseResult,
    formatUSDCAmount,
    canApprove,
    canBuy,
    hasInsufficientBalance,
    clearResults: clearPurchaseResults,
  } = useTokenSale()

  const {
    state: burnState,
    setBurnAmount,
    setMaxAmount,
    burnCOAL,
    dismissResult: dismissBurnResult,
    formatCOALAmount,
    calculateBurnedPercentage,
    getTotalBurned,
    canBurn,
    maxTokens,
    clearResults: clearBurnResults,
  } = useTokenBurn()

  useEffect(() => {
    clearPurchaseResults()
    clearBurnResults()
  }, [activeTab, address, isOnBase, clearPurchaseResults, clearBurnResults])

  const getExplorerLink = (hash: string) => `https://basescan.org/tx/${hash}`

  const addTokenToWallet = async () => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: TOKENS.COAL.address,
            symbol: TOKENS.COAL.symbol,
            decimals: TOKENS.COAL.decimals,
            image: "",
          },
        },
      })
    } catch (error) {
      console.error("Failed to add token to wallet:", error)
    }
  }

  const renderWalletStatus = () => {
    if (!isConnected || !isOnBase) return null

    return (
      <div className="mb-6 text-center">
        <div className="text-green-400 text-sm font-semibold flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Wallet Connected
        </div>
      </div>
    )
  }

  const renderValidationError = (error: string) => (
    <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl shadow-lg shadow-red-500/10">
      <div className="text-red-400 font-semibold flex items-center gap-3">
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </div>
    </div>
  )

  const renderTransactionResult = (
    result: { success: boolean; error: string | null; txHash: string | null; timestamp: number },
    onDismiss: () => void,
    successMessage: string,
    successDescription?: string,
    showAddToken?: boolean,
  ) => {
    if (result.success) {
      return (
        <div className="mb-6 p-5 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl shadow-lg shadow-green-500/10 animate-in fade-in duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="text-green-400 font-semibold flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
            </div>
            <button
              onClick={onDismiss}
              className="text-green-400 hover:text-green-300 ml-2 p-1 rounded-lg hover:bg-green-500/10 transition-all duration-200"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {successDescription && (
            <div className="text-green-300 text-sm mb-3 leading-relaxed">{successDescription}</div>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            {result.txHash && (
              <a
                href={getExplorerLink(result.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline text-sm flex items-center gap-2 hover:scale-105 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View on BaseScan
              </a>
            )}
            {showAddToken && (
              <button
                onClick={addTokenToWallet}
                className="text-green-400 hover:text-green-300 underline text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg p-1 hover:scale-105 transition-all duration-200"
                aria-label="Add COAL token to wallet"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add COAL to wallet
              </button>
            )}
          </div>
        </div>
      )
    } else {
      return (
        <div className="mb-6 p-5 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl shadow-lg shadow-red-500/10 animate-in fade-in duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className="text-red-400 font-semibold flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {result.error?.includes("Fire failed")
                ? "Fire failed to light"
                : result.error?.includes("Purchase failed")
                  ? "Purchase failed"
                  : result.error?.includes("Approval failed")
                    ? "Approval failed"
                    : "Transaction failed"}
            </div>
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-300 ml-2 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-red-300 text-sm mb-3 leading-relaxed">
            {result.error?.includes("gas")
              ? "Insufficient gas fee"
              : result.error?.includes("Network")
                ? "Network congestion"
                : "Unknown error"}
          </div>
          {result.txHash && (
            <a
              href={getExplorerLink(result.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline text-sm flex items-center gap-2 hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View failed transaction
            </a>
          )}
        </div>
      )
    }
  }

  const renderBuyView = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl border border-amber-500/30 shadow-lg shadow-orange-500/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-amber-200 font-semibold text-lg">Coal Price</span>
          </div>
          <span className="text-amber-100 font-bold text-xl">
            {!purchaseState.tokenPrice ? "Loading..." : `$${formatUSDCAmount(purchaseState.tokenPrice)} USDC`}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-white font-semibold mb-3 text-lg">Amount to buy</label>
        <div className="relative">
          <input
            type="text"
            value={purchaseState.coalAmountInput}
            onChange={(e) => setCOALAmount(e.target.value)}
            placeholder="Enter amount"
            inputMode="numeric"
            pattern="^[0-9]+$"
            step="1"
            className="w-full p-5 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800/80"
          />
          <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">COAL</span>
        </div>
      </div>

      {purchaseState.coalAmountInput && purchaseState.tokenPrice && (
        <div className="p-5 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-lg shadow-slate-900/20">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Total Cost:</span>
            <span className="text-green-400 font-bold text-xl">
              {purchaseState.usdcQuote ? formatUSDCAmount(purchaseState.usdcQuote) : "0.000"} USDC
            </span>
          </div>
        </div>
      )}

      {purchaseState.validationError && renderValidationError(purchaseState.validationError)}

      {purchaseState.buyResult &&
        !purchaseState.isBuying &&
        renderTransactionResult(
          purchaseState.buyResult,
          () => dismissPurchaseResult("buy"),
          purchaseState.buyResult.success ? "🎉 COAL purchased successfully!" : "Purchase failed",
          purchaseState.buyResult.success ? "Welcome to ASADAO! Ready to meet some people? ✅" : undefined,
          purchaseState.buyResult.success,
        )}

      {purchaseState.approveResult &&
        !purchaseState.buyResult &&
        !purchaseState.isApproving &&
        renderTransactionResult(
          purchaseState.approveResult,
          () => dismissPurchaseResult("approve"),
          "✅ USDC Spending Approved",
        )}

      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="w-full p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-orange-500/25 text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Connect Wallet
        </button>
      ) : !isOnBase ? (
        <button
          onClick={switchToBase}
          className="w-full p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold text-lg shadow-lg shadow-blue-600/25"
        >
          Switch Chain to Base
        </button>
      ) : (
        <div className="space-y-3">
          {canApprove ? (
            <button
              onClick={approveUSDC}
              disabled={purchaseState.isApproving || !purchaseState.usdcQuote}
              className="w-full p-5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold text-lg shadow-lg shadow-yellow-500/25"
            >
              {purchaseState.isApproving ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Approve USDC"
              )}
            </button>
          ) : (
            <button
              onClick={buyCOAL}
              disabled={!canBuy || purchaseState.isBuying || hasInsufficientBalance}
              className="w-full p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-orange-500/25 text-lg"
            >
              {purchaseState.isBuying ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Buy COAL"
              )}
            </button>
          )}
        </div>
      )}

      {renderWalletStatus()}
    </div>
  )

  const renderBurnView = () => (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl border border-green-500/30 text-center shadow-lg shadow-green-500/10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <svg className="w-7 h-7 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-green-200 font-semibold text-xl">COAL Burned</span>
        </div>
        <div className="text-4xl font-bold text-white mb-2">{getTotalBurned().toLocaleString()}</div>
        <div className="text-green-300 text-base font-medium">
          {calculateBurnedPercentage()}% burned for community asados
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-lg shadow-slate-900/20">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-slate-300 text-sm font-medium">Your Remaining</span>
          </div>
          <div className="text-xl font-bold text-white">{formatCOALAmount(burnState.userBalance)}</div>
          <div className="text-slate-400 text-xs font-medium mt-1">COAL</div>
        </div>
        <div className="p-5 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl shadow-lg shadow-slate-900/20">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-slate-300 text-sm font-medium">Initial Supply</span>
          </div>
          <div className="text-xl font-bold text-white">{BURN_CONFIG.INITIAL_MAX_SUPPLY_HUMAN.toLocaleString()}</div>
          <div className="text-slate-400 text-xs font-medium mt-1">COAL</div>
        </div>
      </div>

      <div>
        <label className="block text-white font-semibold mb-3 text-lg">COAL to burn for the barbecue</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={burnState.burnAmountInput}
              onChange={(e) => setBurnAmount(e.target.value)}
              placeholder="Enter amount"
              inputMode="numeric"
              className="w-full p-5 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800/80"
            />
            <span className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">
              COAL
            </span>
          </div>
          <button
            onClick={setMaxAmount}
            disabled={maxTokens === 0}
            className="px-8 py-5 bg-slate-700/80 backdrop-blur-sm text-slate-300 rounded-2xl hover:bg-slate-600/80 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
          >
            MAX
          </button>
        </div>
      </div>

      {burnState.validationError && renderValidationError(burnState.validationError)}

      {burnState.burnResult &&
        !burnState.isBurning &&
        renderTransactionResult(
          burnState.burnResult,
          dismissBurnResult,
          burnState.burnResult.success ? "🔥 Fire is lit! Let's asado!" : "Fire failed to light",
          burnState.burnResult.success ? "Your COAL is burning bright! The community thanks you. 🥩⚡" : undefined,
        )}

      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="w-full p-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-green-500/25 text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Connect Wallet
        </button>
      ) : !isOnBase ? (
        <button
          onClick={switchToBase}
          className="w-full p-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold text-lg shadow-lg shadow-blue-600/25"
        >
          Switch Chain to Base
        </button>
      ) : (
        <button
          onClick={burnCOAL}
          disabled={!canBurn || burnState.isBurning}
          className="w-full p-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg shadow-green-500/25 text-lg"
        >
          {burnState.isBurning ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Lighting...
            </span>
          ) : (
            "Light the Fire! 🔥"
          )}
        </button>
      )}

      {renderWalletStatus()}
    </div>
  )

  return (
    <div className="max-w-lg mx-auto bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">
      <div className="flex bg-gray-800/80 backdrop-blur-sm rounded-t-2xl overflow-hidden">
        <button
          onClick={() => setActiveTab("buy")}
          className={`flex-1 p-5 font-semibold transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
            activeTab === "buy"
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
              : "bg-gray-800/60 text-gray-400 hover:text-gray-300 hover:bg-gray-700/60 backdrop-blur-sm"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Buy COAL
        </button>
        <button
          onClick={() => setActiveTab("burn")}
          className={`flex-1 p-5 font-semibold transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
            activeTab === "burn"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
              : "bg-gray-800/60 text-gray-400 hover:text-gray-300 hover:bg-gray-700/60 backdrop-blur-sm"
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          Burn COAL
        </button>
      </div>

      <div className="p-8 bg-gray-900/95 backdrop-blur-xl">
        {activeTab === "buy" ? renderBuyView() : renderBurnView()}

        <div className="mt-8 pt-6 border-t border-gray-700/50 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a
              href={TOKENS.COAL.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-300 underline font-medium flex items-center gap-2 hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              COAL
            </a>
            {activeTab === "buy" && (
              <a
                href={SALE.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-300 underline font-medium flex items-center gap-2 hover:scale-105 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Sale Contract
              </a>
            )}
          </div>
          {isConnected && (
            <button
              onClick={disconnectWallet}
              className="text-gray-400 hover:text-gray-300 text-sm font-medium transition-all duration-200 hover:scale-105 px-3 py-1 rounded-lg hover:bg-gray-800/50"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
