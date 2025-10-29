"use client"

import { useState, useEffect } from "react"
import { useWallet } from "./use-wallet"
import { useWalletContext } from "@/providers/wallet-provider"

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
  const { isConnected, address } = useWallet()
  const { contract, isContractReady } = useWalletContext()
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

  // Load pool data from contract
  useEffect(() => {
    const loadPoolData = async () => {
      if (!isConnected || !contract || !isContractReady) return

      setPoolData(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        // Get pool info from contract
        const poolInfo = await contract.getPoolInfo()
        
        // Get user info if connected
        let userInfo = { deposited: '0', tickets: 0, lastDepositTime: 0 }
        if (address) {
          userInfo = await contract.getUserInfo(address)
        }

        const userDeposit = parseFloat(userInfo.deposited)
        const userTickets = userInfo.tickets
        const totalDeposited = parseFloat(poolInfo.totalDeposited)
        const userProbability = userTickets > 0 ? (userTickets / (poolInfo.totalParticipants * 10)) * 100 : 0

        setPoolData(prev => ({
          ...prev,
          totalDeposited,
          totalParticipants: poolInfo.totalParticipants,
          nextPrizeAmount: parseFloat(poolInfo.prizeAmount),
          nextDrawDate: new Date(poolInfo.nextDrawDate),
          userDeposit,
          userTickets,
          userProbability: Math.min(userProbability, 100),
          isLoading: false
        }))

        // Load transaction history
        if (userDeposit > 0) {
          const mockTransactions: Transaction[] = [
            {
              id: '1',
              type: 'deposit',
              amount: userDeposit * 0.5,
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              status: 'confirmed',
              hash: 'a7b8c9...def123'
            },
            {
              id: '2',
              type: 'deposit',
              amount: userDeposit * 0.5,
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              status: 'confirmed',
              hash: 'x1y2z3...abc456'
            }
          ]

          // Add a prize if user has been active
          if (Math.random() > 0.7) {
            mockTransactions.unshift({
              id: '3',
              type: 'prize',
              amount: Math.floor(Math.random() * 20) + 5,
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              status: 'confirmed',
              hash: 'p7r8i9...zxy012'
            })
          }

          setRecentTransactions(mockTransactions)
        }

      } catch (error) {
        setPoolData(prev => ({
          ...prev,
          error: "Error loading pool data from contract",
          isLoading: false
        }))
      }
    }

    loadPoolData()
  }, [isConnected, address, contract, isContractReady])

  const deposit = async (amount: number): Promise<boolean> => {
    if (!isConnected || !contract || !address || amount <= 0) return false

    setPoolData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Create pending transaction
      const pendingTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount,
        date: new Date(),
        status: 'pending',
        hash: 'pending...'
      }

      setRecentTransactions(prev => [pendingTransaction, ...prev])

      // Call contract deposit method
      const result = await contract.deposit(address, amount.toString())

      if (result.success) {
        // Update transaction status
        setRecentTransactions(prev => 
          prev.map(tx => 
            tx.id === pendingTransaction.id 
              ? { ...tx, status: 'confirmed' as const, hash: result.txHash || 'confirmed' }
              : tx
          )
        )

        // Update pool data
        setPoolData(prev => {
          const newUserDeposit = prev.userDeposit + amount
          const newUserTickets = Math.floor(newUserDeposit / 5)
          const newTotalDeposited = prev.totalDeposited + amount
          const newProbability = (newUserTickets / (prev.totalParticipants * 10)) * 100

          return {
            ...prev,
            userDeposit: newUserDeposit,
            userTickets: newUserTickets,
            userProbability: Math.min(newProbability, 100),
            totalDeposited: newTotalDeposited,
            isLoading: false
          }
        })

        return true
      } else {
        // Update transaction as failed
        setRecentTransactions(prev => 
          prev.map(tx => 
            tx.id === pendingTransaction.id 
              ? { ...tx, status: 'failed' as const }
              : tx
          )
        )
        
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
      // Create pending transaction
      const pendingTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'withdraw',
        amount,
        date: new Date(),
        status: 'pending',
        hash: 'pending...'
      }

      setRecentTransactions(prev => [pendingTransaction, ...prev])

      // Call contract withdraw method
      const result = await contract.withdraw(address, amount.toString())

      if (result.success) {
        // Update transaction status
        setRecentTransactions(prev => 
          prev.map(tx => 
            tx.id === pendingTransaction.id 
              ? { ...tx, status: 'confirmed' as const, hash: result.txHash || 'confirmed' }
              : tx
          )
        )

        // Update pool data
        setPoolData(prev => {
          const newUserDeposit = prev.userDeposit - amount
          const newUserTickets = Math.floor(newUserDeposit / 5)
          const newTotalDeposited = prev.totalDeposited - amount
          const newProbability = newUserTickets > 0 ? (newUserTickets / (prev.totalParticipants * 10)) * 100 : 0

          return {
            ...prev,
            userDeposit: newUserDeposit,
            userTickets: newUserTickets,
            userProbability: Math.min(newProbability, 100),
            totalDeposited: newTotalDeposited,
            isLoading: false
          }
        })

        return true
      } else {
        // Update transaction as failed
        setRecentTransactions(prev => 
          prev.map(tx => 
            tx.id === pendingTransaction.id 
              ? { ...tx, status: 'failed' as const }
              : tx
          )
        )
        
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
          winners: draw.winnersCount
        }))
      }
    } catch (error) {
      console.error('Error getting pool history:', error)
      return { draws: [] }
    }
  }

  return {
    poolData,
    recentTransactions,
    deposit,
    withdraw,
    getPoolHistory,
  }
}