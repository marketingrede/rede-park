import { ArrowLeft } from '@phosphor-icons/react'
import { Link } from '@inertiajs/react'

export default function NotFound() {
  return (
    <main className="error-page">
      <div>
        <div className="error-code">404</div>
        <h1>Página não encontrada</h1>
        <p>O endereço que você acessou não existe ou foi removido.</p>
        <Link className="button secondary" href="/operacao">
          <ArrowLeft size={18} />
          Voltar ao sistema
        </Link>
      </div>
    </main>
  )
}

