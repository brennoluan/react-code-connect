import { createContext, useState, useEffect, ReactNode } from 'react'
import type { DevsContextData, Dev } from '../types/devs.types'
import { getDevs } from '../services/devsService'

export const DevsContext = createContext<DevsContextData | undefined>(undefined)

interface DevsProviderProps {
  children: ReactNode
}

export function DevsProvider({ children }: DevsProviderProps) {
  const [devs, setDevs] = useState<Dev[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDevs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDevs()
      setDevs(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar desenvolvedores'
      setError(errorMessage)
      console.error('Erro ao buscar desenvolvedores:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevs()
  }, [])

  const value: DevsContextData = {
    devs,
    loading,
    error,
    fetchDevs,
  }

  return <DevsContext.Provider value={value}>{children}</DevsContext.Provider>
}
