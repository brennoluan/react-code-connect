import { apiRequest } from '../../../lib/api'
import type { Dev } from '../types/devs.types'

export async function getDevs(): Promise<Dev[]> {
  return apiRequest<Dev[]>('/devs')
}
