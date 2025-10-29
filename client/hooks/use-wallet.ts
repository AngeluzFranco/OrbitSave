"use client"

import { useState, useEffect } from "react"

// Types for wallet state
interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  network: string
  isLoading: boolean
  error: string | null
  isFreighterInstalled: boolean
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    network: "Testnet",
    isLoading: false,
    error: null,
    isFreighterInstalled: false,
  })

  // Check if Freighter wallet is installed
  const checkFreighterInstallation = () => {
    // In real implementation, check for window.freighter
    // For now, randomly simulate installation status
    const isInstalled = typeof window !== 'undefined' && Math.random() > 0.3
    setState(prev => ({ ...prev, isFreighterInstalled: isInstalled }))
    return isInstalled
  }

  // Initialize wallet check
  useEffect(() => {
    const initWallet = async () => {
      setState(prev => ({ ...prev, isLoading: true }))
      
      try {
        const isFreighterInstalled = checkFreighterInstallation()
        
        if (isFreighterInstalled) {
          // Check if already connected
          const savedConnection = localStorage.getItem('orbitSave_wallet_connected')
          if (savedConnection === 'true') {
            // Simulate reconnection
            await new Promise(resolve => setTimeout(resolve, 500))
            setState(prev => ({
              ...prev,
              isConnected: true,
              address: "GA7Q...X5D9",
              balance: 25.5,
              isLoading: false
            }))
          } else {
            setState(prev => ({ ...prev, isLoading: false }))
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: "Error checking wallet connection",
          isLoading: false
        }))
      }
    }

    initWallet()
  }, [])

  const connect = async () => {
    if (!state.isFreighterInstalled) {
      setState(prev => ({
        ...prev,
        error: "Freighter wallet is not installed"
      }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate Freighter connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation:
      // const result = await window.freighter.connect()
      // const account = await window.freighter.getPublicKey()
      
      const mockAddress = "GA7Q" + Math.random().toString(36).substr(2, 9).toUpperCase() + "X5D9"
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        address: mockAddress,
        balance: Math.floor(Math.random() * 100) + 10,
        isLoading: false
      }))

      localStorage.setItem('orbitSave_wallet_connected', 'true')
      return true
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to connect to Freighter wallet",
        isLoading: false
      }))
      return false
    }
  }

  const disconnect = () => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      balance: 0,
      error: null
    }))
    localStorage.removeItem('orbitSave_wallet_connected')
  }

  const installFreighter = () => {
    window.open('https://freighter.app/', '_blank')
  }

  return {
    ...state,
    connect,
    disconnect,
    installFreighter,
    checkFreighterInstallation,
  }
}
