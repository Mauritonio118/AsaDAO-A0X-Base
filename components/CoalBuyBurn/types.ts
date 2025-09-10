export type Tab = "buy" | "burn"

export interface TokenPurchaseState {
  coalAmountInput: string
  saleAmount: bigint | null
  usdcQuote: bigint | null
  tokenPrice: bigint | null
  allowance: bigint
  usdcBalance: bigint
  coalBalance: bigint
  availableInventory: bigint
  availableTokensInt: number
  isQuoting: boolean

  // Separate pending states
  isApproving: boolean
  isBuying: boolean

  // Separate result states that persist independently
  approveResult: {
    success: boolean
    error: string | null
    txHash: string | null
    timestamp: number
  } | null

  buyResult: {
    success: boolean
    error: string | null
    txHash: string | null
    timestamp: number
  } | null

  // Validation errors (separate from transaction results)
  validationError: string | null
}

export interface COALBurnState {
  burnAmountInput: string
  userBalance: bigint
  totalSupply: bigint

  // Pending state
  isBurning: boolean

  // Result state that persists independently
  burnResult: {
    success: boolean
    error: string | null
    txHash: string | null
    timestamp: number
  } | null

  // Validation errors (separate from transaction results)
  validationError: string | null
}
