"use client"

import { createContext, useContext, type ReactNode } from "react"

const WalletContext = createContext({})

export function WalletProvider({ children }: { children: ReactNode }) {
  return <WalletContext.Provider value={{}}>{children}</WalletContext.Provider>
}

export const useWalletContext = () => useContext(WalletContext)
