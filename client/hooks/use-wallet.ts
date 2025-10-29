"use client"

import { useState, useEffect } from "react"
import { useAppState } from "./use-app-state"

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
  const { resetState } = useAppState()
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
    const isInstalled = typeof window !== 'undefined' && Math.random() > 0.1
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
          const savedAddress = localStorage.getItem('orbitSave_wallet_address')
          
          if (savedConnection === 'true' && savedAddress) {
            // Simulate reconnection
            await new Promise(resolve => setTimeout(resolve, 500))
            setState(prev => ({
              ...prev,
              isConnected: true,
              address: savedAddress,
              balance: parseFloat(localStorage.getItem('orbitSave_wallet_balance') || '25.5'),
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
      const mockBalance = Math.floor(Math.random() * 100) + 50
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        address: mockAddress,
        balance: mockBalance,
        isLoading: false
      }))

      // Save to localStorage
      localStorage.setItem('orbitSave_wallet_connected', 'true')
      localStorage.setItem('orbitSave_wallet_address', mockAddress)
      localStorage.setItem('orbitSave_wallet_balance', mockBalance.toString())
      
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
    
    // Clear localStorage
    localStorage.removeItem('orbitSave_wallet_connected')
    localStorage.removeItem('orbitSave_wallet_address')
    localStorage.removeItem('orbitSave_wallet_balance')
    
    // Reset app state when disconnecting
    resetState()
  }

  const updateBalance = (newBalance: number) => {
    setState(prev => ({ ...prev, balance: newBalance }))
    localStorage.setItem('orbitSave_wallet_balance', newBalance.toString())
  }

  const installFreighter = () => {
    window.open('https://freighter.app/', '_blank')
  }

  return {
    ...state,
    connect,
    disconnect,
    updateBalance,
    installFreighter,
    checkFreighterInstallation,
  }
}
