export interface ContactMessage {
  id?: number | string
  senderName: string
  senderEmail: string
  recipientDevId: number | string
  recipientDevName: string
  message: string
  createdAt: string
}

export interface ContactFormData {
  senderName: string
  senderEmail: string
  message: string
}
