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

  const initializeApp = async () => {
    try {
      setError(null)
      
      // Initialize contract
      const contractInstance = new OrbitSaveContract(TESTNET_CONFIG)
      const contractReady = await contractInstance.initializeContract()
      
      if (contractReady) {
        setContract(contractInstance)
        setIsContractReady(true)
        setIsInitialized(true)
      } else {
        throw new Error("Failed to initialize contract")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize app")
      setIsInitialized(false)
    }
  }

  const resetError = () => {
    setError(null)
  }

  // Initialize on mount
  useEffect(() => {
    initializeApp()
  }, [])

  const value: WalletContextType = {
    contract,
    isContractReady,
    isInitialized,
    error,
    initializeApp,
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
