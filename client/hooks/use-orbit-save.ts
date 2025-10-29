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
  const { state: appState } = useAppState()
  const [poolData, setPoolData] = useState<PoolData>({
    totalDeposited: 8420.50,
    totalParticipants: 187,
    nextPrizeAmount: 24.7,
    nextDrawDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
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
      if (!isConnected || !contract || !isContractReady) return

      setPoolData(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        // Get pool info from contract
        const poolInfo = await contract.getPoolInfo()
        
        // Calculate user stats from app state
        const userDeposit = appState.totalDeposited
        const userTickets = appState.totalTickets
        const totalParticipants = poolInfo.totalParticipants
        const userProbability = userTickets > 0 && totalParticipants > 0 
          ? (userTickets / (totalParticipants * 5)) * 100  // Assume average of 5 tickets per participant
          : 0

        setPoolData(prev => ({
          ...prev,
          totalDeposited: parseFloat(poolInfo.totalDeposited),
          totalParticipants,
          nextPrizeAmount: parseFloat(poolInfo.prizeAmount),
          nextDrawDate: new Date(poolInfo.nextDrawDate),
          userDeposit,
          userTickets,
          userProbability: Math.min(userProbability, 100),
          isLoading: false
        }))

        // Load transaction history from app state
        const appTransactions = appState.transactions.map(tx => ({
          id: tx.id,
          type: tx.type === 'prize_won' ? 'prize' as const : tx.type as 'deposit' | 'withdraw',
          amount: tx.amount,
          date: tx.date,
          status: tx.status,
          hash: tx.hash
        }))

        setRecentTransactions(appTransactions)

      } catch (error) {
        setPoolData(prev => ({
          ...prev,
          error: "Error loading pool data from contract",
          isLoading: false
        }))
      }
    }

    loadPoolData()
  }, [isConnected, address, contract, isContractReady, appState.totalDeposited, appState.totalTickets, appState.transactions])

  const deposit = async (amount: number): Promise<boolean> => {
    if (!isConnected || !contract || !address || amount <= 0) return false

    setPoolData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Call contract deposit method
      const result = await contract.deposit(address, amount.toString())

      if (result.success) {
        // Update pool data optimistically
        setPoolData(prev => {
          const newUserDeposit = prev.userDeposit + amount
          const newUserTickets = Math.floor(newUserDeposit)
          const newTotalDeposited = prev.totalDeposited + amount
          const newProbability = newUserTickets > 0 ? (newUserTickets / (prev.totalParticipants * 5)) * 100 : 0

          return {
            ...prev,
            userDeposit: newUserDeposit,
            userTickets: newUserTickets,
            userProbability: Math.min(newProbability, 100),
            totalDeposited: newTotalDeposited,
            isLoading: false
          }
        })

        // Update wallet balance
        updateBalance(balance - amount)

        return true
      } else {
        setPoolData(prev => ({
          ...prev,
          error: result.error || "Deposit failed",
          isLoading: false
        }))
        
        return false
      }
    } catch (error) {
      setPoolData(prev => ({
        ...prev,
        error: "Error processing deposit",
        isLoading: false
      }))
      return false
    }
  }

  const withdraw = async (amount: number): Promise<boolean> => {
    if (!isConnected || !contract || !address || amount <= 0 || amount > poolData.userDeposit) return false

    setPoolData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Call contract withdraw method
      const result = await contract.withdraw(address, amount.toString())

      if (result.success) {
        // Update pool data optimistically
        setPoolData(prev => {
          const newUserDeposit = prev.userDeposit - amount
          const newUserTickets = Math.floor(newUserDeposit)
          const newTotalDeposited = prev.totalDeposited - amount
          const newProbability = newUserTickets > 0 ? (newUserTickets / (prev.totalParticipants * 5)) * 100 : 0

          return {
            ...prev,
            userDeposit: newUserDeposit,
            userTickets: newUserTickets,
            userProbability: Math.min(newProbability, 100),
            totalDeposited: newTotalDeposited,
            isLoading: false
          }
        })

        // Update wallet balance
        updateBalance(balance + amount)

        return true
      } else {
        setPoolData(prev => ({
          ...prev,
          error: result.error || "Withdrawal failed",
          isLoading: false
        }))
        
        return false
      }
    } catch (error) {
      setPoolData(prev => ({
        ...prev,
        error: "Error processing withdrawal",
        isLoading: false
      }))
      return false
    }
  }

  const getPoolHistory = async () => {
    if (!contract) return { draws: [] }
    
    try {
      const history = await contract.getDrawHistory()
      return {
        draws: history.map(draw => ({
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