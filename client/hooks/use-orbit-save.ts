"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./use-wallet"
import { useWalletContext } from "@/providers/wallet-provider"
import { useAppState } from "./use-app-state"

// Types for pool data
interface PoolData {
  totalDeposited: number
  totalParticipants: number
  nextPrizeAmount: number
  nextDrawDate: Date
  userDeposit: number
  userTickets: number
  userProbability: number
  isLoading: boolean
  error: string | null
}

// Types for transaction
interface Transaction {
  id: string
  type: 'deposit' | 'withdraw' | 'prize'
  amount: number
  date: Date
  status: 'pending' | 'confirmed' | 'failed'
  hash?: string
}

export function useOrbitSavePool() {
  const { isConnected, address, updateBalance, balance } = useWallet()
  const { contract, isContractReady } = useWalletContext()
  const { state: appState, addTransaction, updateTransactionStatus } = useAppState()
  const [poolData, setPoolData] = useState<PoolData>({
    totalDeposited: 0,
    totalParticipants: 0,
    nextPrizeAmount: 0,
    nextDrawDate: new Date(),
    userDeposit: 0,
    userTickets: 0,
    userProbability: 0,
    isLoading: false,
    error: null
  })

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  // Load pool data from contract and app state
  useEffect(() => {
    const loadPoolData = async () => {
      if (!isConnected || !isContractReady) return

      setPoolData(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        // Llamada real al contrato Soroban
        if (contract && typeof contract.getPoolInfo === "function" && typeof contract.getUserInfo === "function") {
          const poolInfo = await contract.getPoolInfo()
          console.log("[Soroban] getPoolInfo result:", poolInfo)
          let userInfo = { deposited: "0", tickets: 0, lastDepositTime: 0 }
          if (address) {
            userInfo = await contract.getUserInfo(address)
            console.log("[Soroban] getUserInfo result:", userInfo)
          }
          const totalParticipants = Number(poolInfo.totalParticipants) || 0
          const userDeposit = parseFloat(userInfo.deposited) || 0
          const userTickets = userInfo.tickets || 0
          const userProbability = userTickets > 0 && totalParticipants > 0
            ? (userTickets / Math.max(totalParticipants, 1)) * 100
            : 0

          setPoolData(prev => ({
            ...prev,
            totalDeposited: parseFloat(poolInfo.totalDeposited) || 0,
            totalParticipants,
            nextPrizeAmount: parseFloat(poolInfo.prizeAmount) || 0,
            nextDrawDate: poolInfo.nextDrawDate ? new Date(Number(poolInfo.nextDrawDate)) : new Date(),
            userDeposit,
            userTickets,
            userProbability: Math.min(userProbability, 100),
            isLoading: false,
            error: null
          }))
        }

        // Map appState transactions to recentTransactions
        const appTransactions = appState.transactions.map(tx => ({
          id: tx.id,
          type: tx.type === 'prize_won' ? 'prize' as const : (tx.type === 'deposit' ? 'deposit' as const : 'withdraw' as const),
          amount: tx.amount,
          date: tx.date,
          status: tx.status,
          hash: tx.hash
        }))

        setRecentTransactions(appTransactions.slice(0, 50))

      } catch (err: any) {
        setPoolData(prev => ({ ...prev, isLoading: false, error: String(err?.message || err) }))
      }
    }

    loadPoolData()

    // Optionally poll every 30 seconds for updates
    const interval = setInterval(loadPoolData, 30_000)
    return () => clearInterval(interval)
  }, [isConnected, isContractReady, contract, appState])

  // Simulated deposit function: replace with real contract call
  const deposit = async (amount: number) => {
    if (!isConnected) throw new Error("Wallet not connected")
    const txId = addTransaction({
      type: 'deposit',
      amount,
      status: 'pending'
    })
    try {
      if (contract && typeof contract.deposit === "function" && address) {
        // El contrato espera amount como string
        const res = await contract.deposit(address, amount.toString())
        updateTransactionStatus(txId, 'confirmed', res || undefined)
        // Actualizar balance local si es necesario
        setPoolData(prev => ({ ...prev, userDeposit: prev.userDeposit + amount, totalDeposited: prev.totalDeposited + amount }))
        return true
      } else {
        throw new Error("Método deposit no disponible en el contrato o address inválida")
      }
    } catch (err: any) {
      updateTransactionStatus(txId, 'failed')
      setPoolData(prev => ({ ...prev, error: err?.message ? String(err.message) : String(err) }))
      return false
    }
  }

  const withdraw = async (amount: number) => {
    if (!isConnected) throw new Error("Wallet not connected")
    const txId = addTransaction({
      type: 'withdraw',
      amount,
      status: 'pending'
    })
    try {
      if (contract && typeof contract.withdraw === "function" && address) {
        // El contrato espera address y amount como string
        const res = await contract.withdraw(address, amount.toString())
        updateTransactionStatus(txId, 'confirmed', res || undefined)
        setPoolData(prev => ({ ...prev, userDeposit: Math.max(0, prev.userDeposit - amount), totalDeposited: Math.max(0, prev.totalDeposited - amount) }))
        return true
      } else {
        throw new Error("Método withdraw no disponible en el contrato o address inválida")
      }
    } catch (err: any) {
      updateTransactionStatus(txId, 'failed')
      setPoolData(prev => ({ ...prev, error: err?.message ? String(err.message) : String(err) }))
      return false
    }
  }

  const getPoolHistory = async () => {
    if (!contract || typeof contract.getDrawHistory !== "function") {
      return { draws: [] }
    }
    
    try {
      const history = await contract.getDrawHistory()
      return {
        draws: history.map((draw: any) => ({
          date: new Date(draw.date),
          prize: parseFloat(draw.prizeAmount),
          winners: draw.winnersCount,
          id: draw.id
        }))
      }
    } catch (error) {
      console.error('Error getting pool history:', error)
      return { draws: [] }
    }
  }

  // Helper function to get recent activity summary
  const getActivitySummary = () => {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentTxs = appState.transactions.filter(tx => tx.date >= last7Days)
    
    return {
      totalTransactions: appState.transactions.length,
      recentTransactions: recentTxs.length,
      totalPrizesWon: appState.transactions
        .filter(tx => tx.type === 'prize_won' && tx.status === 'confirmed')
        .reduce((sum, tx) => sum + tx.amount, 0),
      lastActivity: appState.lastActivityUpdate
    }
  }

  return {
    poolData,
    recentTransactions,
    deposit,
    withdraw,
    getPoolHistory,
    getActivitySummary,
  }
}