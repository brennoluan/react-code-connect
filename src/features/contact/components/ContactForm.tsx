import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { sendMessage } from '../services/contactService'
import type { ContactFormData } from '../types/contact.types'

interface ContactFormProps {
  devId: number | string
  devName: string
}

export function ContactForm({ devId, devName }: ContactFormProps) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ContactFormData>({
    senderName: '',
    senderEmail: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validação simples
    if (!formData.senderName.trim()) {
      setError('Por favor, preencha seu nome')
      return
    }

    if (!formData.senderEmail.trim() || !formData.senderEmail.includes('@')) {
      setError('Por favor, insira um email válido')
      return
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setError('A mensagem deve ter no mínimo 10 caracteres')
      return
    }

    try {
      setLoading(true)

      await sendMessage({
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        recipientDevId: devId,
        recipientDevName: devName,
        message: formData.message,
        createdAt: new Date().toISOString(),
      })

      setSuccess(true)
      setFormData({ senderName: '', senderEmail: '', message: '' })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-green-900/20 border border-highlight-green rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="font-prompt text-3xl font-semibold text-highlight-green mb-4">
            Mensagem Enviada!
          </h2>
          <p className="font-prompt text-lg text-medium-gray mb-6">
            Sua mensagem foi enviada com sucesso para {devName}.
          </p>
          <button
            onClick={() => navigate('/')}
            className="font-prompt bg-highlight-green text-graphite px-8 py-3 rounded-lg font-semibold hover:bg-pastel-green transition-colors"
          >
            Voltar para o Feed
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="font-prompt text-4xl font-semibold text-highlight-green mb-2">
        Entrar em Contato
      </h1>
      <p className="font-prompt text-lg text-medium-gray mb-8">
        Envie uma mensagem para {devName}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Para (readonly) */}
        <div>
          <label className="font-prompt text-sm text-medium-gray block mb-2">
            Para
          </label>
          <input
            type="text"
            value={devName}
            readOnly
            className="w-full font-prompt bg-dark-gray border border-gray rounded-lg px-4 py-3 text-white cursor-not-allowed opacity-75"
          />
        </div>

        {/* Campo Nome */}
        <div>
          <label htmlFor="senderName" className="font-prompt text-sm text-medium-gray block mb-2">
            Seu Nome *
          </label>
          <input
            type="text"
            id="senderName"
            value={formData.senderName}
            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
            className="w-full font-prompt bg-graphite border border-gray rounded-lg px-4 py-3 text-white focus:border-highlight-green focus:outline-none transition-colors"
            placeholder="Digite seu nome completo"
            disabled={loading}
          />
        </div>

        {/* Campo Email */}
        <div>
          <label htmlFor="senderEmail" className="font-prompt text-sm text-medium-gray block mb-2">
            Seu Email *
          </label>
          <input
            type="email"
            id="senderEmail"
            value={formData.senderEmail}
            onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
            className="w-full font-prompt bg-graphite border border-gray rounded-lg px-4 py-3 text-white focus:border-highlight-green focus:outline-none transition-colors"
            placeholder="seu@email.com"
            disabled={loading}
          />
        </div>

        {/* Campo Mensagem */}
        <div>
          <label htmlFor="message" className="font-prompt text-sm text-medium-gray block mb-2">
            Mensagem *
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={6}
            className="w-full font-prompt bg-graphite border border-gray rounded-lg px-4 py-3 text-white focus:border-highlight-green focus:outline-none transition-colors resize-none"
            placeholder="Escreva sua mensagem aqui... (mínimo 10 caracteres)"
            disabled={loading}
          />
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="font-prompt text-red-400">{error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-prompt bg-dark-gray border border-gray text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 font-prompt bg-highlight-green text-graphite px-6 py-3 rounded-lg font-semibold hover:bg-pastel-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Mensagem'}
          </button>
        </div>
      </form>
    </div>
  )
}
