import { apiRequest } from '../../../lib/api'
import type { ContactMessage } from '../types/contact.types'

export async function sendMessage(message: ContactMessage): Promise<ContactMessage> {
  return apiRequest<ContactMessage>('/messages', {
    method: 'POST',
    body: JSON.stringify(message),
  })
}
