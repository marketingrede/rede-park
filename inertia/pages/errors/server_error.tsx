import { ArrowLeft } from '@phosphor-icons/react'
import { Link } from '@inertiajs/react'

export default function ServerError() {
  return (
    <main className="error-page">
      <div>
        <div className="error-code">500</div>
        <h1>Erro interno</h1>
        <p>Algo deu errado no servidor. Tente novamente em alguns instantes.</p>
        <Link className="button secondary" href="/operacao">
          <ArrowLeft size={18} />
          Voltar ao sistema
        </Link>
      </div>
    </main>
  )
}

