import { useParams, Navigate } from 'react-router'
import { useDevs } from '../features/devs/hooks/useDevs'
import { ContactForm } from '../features/contact/components/ContactForm'

export function ContactPage() {
  const { devId } = useParams<{ devId: string }>()
  const { devs, loading } = useDevs()

  if (loading) {
    return (
      <div className="p-8">
        <p className="font-prompt text-lg text-medium-gray">Carregando...</p>
      </div>
    )
  }

  // Comparar tanto como string quanto como number (JSON Server retorna strings)
  const dev = devs.find((d) => d.id === Number(devId) || String(d.id) === devId)

  if (!dev) {
    return <Navigate to="/" replace />
  }

  return <ContactForm devId={dev.id} devName={dev.name} />
}
