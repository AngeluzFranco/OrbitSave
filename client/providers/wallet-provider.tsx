"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import { OrbitSaveContract, TESTNET_CONFIG } from "@/lib/stellar-contract"

interface WalletContextType {
  // Contract instance
  contract: OrbitSaveContract | null
  isContractReady: boolean
  
  // App state
  isInitialized: boolean
  error: string | null
  
  // Methods
  initializeApp: () => Promise<void>
  resetError: () => void
}

const WalletContext = createContext<WalletContextType>({
  contract: null,
  isContractReady: false,
  isInitialized: false,
  error: null,
  initializeApp: async () => {},
  resetError: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [contract, setContract] = useState<OrbitSaveContract | null>(null)
  const [isContractReady, setIsContractReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setError(null)
      // Obtener datos de entorno
      const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID || ''
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet-rpc.stellar.org'
      // Instanciar wrapper real
      const contractInstance = new OrbitSaveContract(contractId, rpcUrl)
      setContract(contractInstance)
      setIsContractReady(true)
      setIsInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract')
      setIsInitialized(false)
    }
  }, [])

  const resetError = () => setError(null)

  const value: WalletContextType = {
    contract,
    isContractReady,
    isInitialized,
    error,
    initializeApp: async () => {},
    resetError,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider")
  }
  return context
}
