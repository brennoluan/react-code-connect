import { Link } from 'react-router'
import { useDevs } from '../features/devs/hooks/useDevs'

export function HomePage() {
  const { devs, loading, error } = useDevs()

  return (
    <div className="p-8">
      <h1 className="font-prompt text-4xl font-semibold text-highlight-green mb-6">
        Feed
      </h1>

      {loading && (
        <p className="font-prompt text-lg text-medium-gray">Carregando desenvolvedores...</p>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <p className="font-prompt text-red-400">Erro: {error}</p>
          <p className="font-prompt text-sm text-medium-gray mt-2">
            Certifique-se de que o JSON Server está rodando (npm run api)
          </p>
        </div>
      )}

      {!loading && !error && devs.length === 0 && (
        <p className="font-prompt text-lg text-medium-gray">
          Nenhum desenvolvedor encontrado.
        </p>
      )}

      {!loading && !error && devs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devs.map((dev) => (
            <div
              key={dev.id}
              className="bg-dark-gray rounded-lg p-6 border border-gray/20 hover:border-highlight-green/50 transition-all flex flex-col"
            >
              <h3 className="font-prompt text-xl font-semibold text-white mb-2">
                {dev.name}
              </h3>

              <div className="flex gap-2 mb-4 flex-wrap">
                {dev.categories.map((category) => (
                  <span
                    key={category}
                    className="font-prompt text-xs px-3 py-1 bg-petrol-green text-highlight-green rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <p className="font-prompt text-sm text-medium-gray mb-4">
                {dev.description}
              </p>

              <p className="font-prompt text-sm text-gray mb-4">
                {dev.email}
              </p>

              <Link
                to={`/contact/${dev.id}`}
                className="mt-auto font-prompt bg-highlight-green text-graphite px-4 py-2 rounded-lg font-semibold hover:bg-pastel-green transition-colors text-center"
              >
                Entrar em contato
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
