import { Form } from '@adonisjs/inertia/react'
import { SignIn } from '@phosphor-icons/react'

export default function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <img src="/logo-rede-trilha.svg" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </span>
          <span>Rede Park</span>
        </div>

        <h1 id="login-title">Entrar no sistema</h1>
        <p>Acesse com o usuário criado pelo administrador.</p>

        <Form route="session.store">
          {({ errors, processing }) => (
            <>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="username"
                  placeholder="seu@email.com"
                  data-invalid={errors.email ? 'true' : undefined}
                />
                {errors.email && <div className="alert-error">{errors.email}</div>}
              </div>

              <div className="field">
                <label htmlFor="password">Senha</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  data-invalid={errors.password ? 'true' : undefined}
                />
                {errors.password && <div className="alert-error">{errors.password}</div>}
              </div>

              <button type="submit" disabled={processing}>
                <SignIn size={18} />
                Entrar
              </button>
            </>
          )}
        </Form>
      </section>
    </main>
  )
}
