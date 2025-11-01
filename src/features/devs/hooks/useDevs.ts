import { useContext } from 'react'
import { DevsContext } from '../contexts/DevsContext'

export function useDevs() {
  const context = useContext(DevsContext)

  if (context === undefined) {
    throw new Error('useDevs must be used within a DevsProvider')
  }

  return context
}
