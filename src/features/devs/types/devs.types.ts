export interface Dev {
  id: number | string  // JSON Server pode retornar string ou number
  name: string
  categories: string[]
  email: string
  description: string
}

export interface DevsContextData {
  devs: Dev[]
  loading: boolean
  error: string | null
  fetchDevs: () => Promise<void>
}
