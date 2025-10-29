"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"

export interface Transaction {
  id: string
  type: 'deposit' | 'withdraw' | 'prize_won' | 'prize_lost'
  amount: number
  date: Date
  status: 'pending' | 'confirmed' | 'failed'
  hash?: string
  tickets?: number
}

export interface AppState {
  balance: number
  totalDeposited: number
  totalTickets: number
  transactions: Transaction[]
  lastActivityUpdate: Date
}

interface AppStateContextType {
  state: AppState
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => string
  updateTransactionStatus: (id: string, status: Transaction['status'], hash?: string) => void
  resetState: () => void
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

const initialState: AppState = {
  balance: 0,
  totalDeposited: 0,
  totalTickets: 0,
  transactions: [],
  lastActivityUpdate: new Date()
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orbitSaveAppState')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          return {
            ...parsed,
            transactions: parsed.transactions.map((t: any) => ({
              ...t,
              date: new Date(t.date)
            })),
            lastActivityUpdate: new Date(parsed.lastActivityUpdate)
          }
        } catch (e) {
          console.warn('Failed to parse saved state:', e)
        }
      }
    }
    return initialState
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbitSaveAppState', JSON.stringify(state))
    }
  }, [state])

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>): string => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTransaction: Transaction = {
      ...transaction,
      id,
      date: new Date()
    }

    setState(prevState => {
      const newState = { ...prevState }
      newState.transactions = [newTransaction, ...prevState.transactions]
      newState.lastActivityUpdate = new Date()

      // Update balance and totals based on transaction type
      if (transaction.type === 'deposit' && transaction.status === 'confirmed') {
        newState.balance += transaction.amount
        newState.totalDeposited += transaction.amount
        newState.totalTickets += transaction.tickets || Math.floor(transaction.amount)
      } else if (transaction.type === 'withdraw' && transaction.status === 'confirmed') {
        newState.balance -= transaction.amount
        // Note: we don't decrease totalDeposited as it's cumulative
        newState.totalTickets = Math.max(0, newState.totalTickets - Math.floor(transaction.amount))
      } else if (transaction.type === 'prize_won' && transaction.status === 'confirmed') {
        newState.balance += transaction.amount
      }

      return newState
    })

    return id
  }

  const updateTransactionStatus = (id: string, status: Transaction['status'], hash?: string) => {
    setState(prevState => {
      const newState = { ...prevState }
      const transactionIndex = prevState.transactions.findIndex(tx => tx.id === id)
      
      if (transactionIndex === -1) return prevState

      const oldTransaction = prevState.transactions[transactionIndex]
      const updatedTransaction = { 
        ...oldTransaction, 
        status, 
        ...(hash && { hash }) 
      }

      newState.transactions = [...prevState.transactions]
      newState.transactions[transactionIndex] = updatedTransaction
      newState.lastActivityUpdate = new Date()
      
      // If transaction is now confirmed and wasn't before, update balances
      if (status === 'confirmed' && oldTransaction.status !== 'confirmed') {
        if (oldTransaction.type === 'deposit') {
          newState.balance += oldTransaction.amount
          newState.totalDeposited += oldTransaction.amount
          newState.totalTickets += oldTransaction.tickets || Math.floor(oldTransaction.amount)
        } else if (oldTransaction.type === 'withdraw') {
          newState.balance -= oldTransaction.amount
          newState.totalTickets = Math.max(0, newState.totalTickets - Math.floor(oldTransaction.amount))
        } else if (oldTransaction.type === 'prize_won') {
          newState.balance += oldTransaction.amount
        }
      }

      return newState
    })
  }

  const resetState = () => {
    setState(initialState)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orbitSaveAppState')
    }
  }

  return (
    <AppStateContext.Provider value={{
      state,
      addTransaction,
      updateTransactionStatus,
      resetState
    }}>
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}

// Helper hooks for specific data
export function useBalance() {
  const { state } = useAppState()
  return state.balance
}

export function useTransactions() {
  const { state } = useAppState()
  return state.transactions
}

export function usePoolStats() {
  const { state } = useAppState()
  return {
    balance: state.balance,
    totalDeposited: state.totalDeposited,
    totalTickets: state.totalTickets,
    // Mock pool data
    totalParticipants: 247,
    totalPoolValue: 15420.50,
    nextDraw: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    currentPrize: 850.00
  }
}