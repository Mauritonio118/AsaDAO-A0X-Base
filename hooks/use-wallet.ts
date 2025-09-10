"use client"

import { useWalletContext } from "@/components/WalletProvider"

export function useWallet() {
  return useWalletContext()
}
