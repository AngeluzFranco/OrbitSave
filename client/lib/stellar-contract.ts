// Stellar and Soroban contract utilities for OrbitSave

import { Contract, SorobanRpc } from "soroban-client"

export interface ContractConfig {
  contractId: string
  networkPassphrase: string
  rpcUrl: string
}

export interface PoolContractMethods {
  // Pool management
  deposit: (amount: string) => Promise<string>
  withdraw: (amount: string) => Promise<string>
  
  // Pool information
  getPoolInfo: () => Promise<{
    totalDeposited: string
    totalParticipants: number
    nextDrawDate: number
    prizeAmount: string
  }>
  
  // User information
  getUserInfo: (address: string) => Promise<{
    deposited: string
    tickets: number
    lastDepositTime: number
  }>
  
  // Draw methods
  triggerDraw: () => Promise<string>
  claimPrize: (drawId: string) => Promise<string>
  getDrawHistory: () => Promise<Array<{
    id: string
    date: number
    prizeAmount: string
    winnersCount: number
    winners: string[]
  }>>
}

export class OrbitSaveContract {
  private config: ContractConfig;
  contract: Contract;
  rpc: SorobanRpc;

  constructor(config: ContractConfig) {
    this.config = config;
    this.contract = new Contract(config.contractId);
    this.rpc = new SorobanRpc(config.rpcUrl);
  }

  async withdraw(address: string, amount: string) {
    try {
      const result = await this.rpc.sendTransaction({
        contractId: this.contract.contractId,
        function: 'withdraw',
        args: [address, amount]
      });
      return result;
    } catch (err) {
      throw new Error('Error al retirar: ' + err);
    }
  }

      async getPoolInfo() {
    try {
      const result = await this.rpc.callContractFunction({
        contractId: this.contract.contractId,
        function: 'get_pool_info',
        args: []
      });
      return result;
    } catch (err) {
      throw new Error('Error al obtener info del pool: ' + err);
    }
      }

      async deposit(address: string, amount: string) {
        try {
          const result = await this.rpc.sendTransaction({
            contractId: this.contract.contractId,
            function: 'deposit',
            args: [address, amount]
          })
          return result
        } catch (err) {
          throw new Error('Error al depositar: ' + err)
        }
      }



  async getUserInfo(userAddress: string): Promise<{
    deposited: string
    tickets: number
    lastDepositTime: number
  }> {
    // Simulate contract read
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const deposited = (Math.random() * 100 + 25).toFixed(2)
    const tickets = Math.floor(parseFloat(deposited) / 5)
    
    return {
      deposited,
      tickets,
      lastDepositTime: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
    }
  }

  async getDrawHistory(): Promise<Array<{
    id: string
    date: number
    prizeAmount: string
    winnersCount: number
    winners: string[]
  }>> {
    // Simulate contract read
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return [
      {
        id: 'draw_001',
        date: Date.now() - (7 * 24 * 60 * 60 * 1000),
        prizeAmount: '18.5',
        winnersCount: 3,
        winners: ['GA7Q...X5D9', 'GBKM...A2L8', 'GCVN...M9Q3']
      },
      {
        id: 'draw_002',
        date: Date.now() - (14 * 24 * 60 * 60 * 1000),
        prizeAmount: '31.2',
        winnersCount: 5,
        winners: ['GDAB...C4E5', 'GEFF...G6H7', 'GIIJ...K8L9', 'GMNO...P0Q1', 'GRST...U2V3']
      }
    ]
  }
}

// Contract configuration for different networks
export const TESTNET_CONFIG: ContractConfig = {
  contractId: 'CBQHNAXSI55GX2GN6D67GK7BHVPSLJUGZQEU7WJ5LKR5PNUCGLIMAO4K', // Mock contract ID
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org'
}

export const MAINNET_CONFIG: ContractConfig = {
  contractId: 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Real contract ID would go here
  networkPassphrase: 'Public Global Stellar Network ; September 2015',
  rpcUrl: 'https://soroban-mainnet.stellar.org'
}

// Utility functions
export function formatStellarAmount(amount: string): string {
  return (parseFloat(amount) / 10000000).toFixed(7) // Convert from stroops
}

export function parseStellarAmount(amount: string): string {
  return (parseFloat(amount) * 10000000).toString() // Convert to stroops
}

export function shortenAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}