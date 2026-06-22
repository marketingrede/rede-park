import { Form } from '@adonisjs/inertia/react'
import { UserPlus } from '@phosphor-icons/react'

export default function Signup() {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <img src="/logo-rede-trilha.svg" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </span>
          <span>Rede Park</span>
        </div>

        <h1 id="signup-title">Criar primeiro admin</h1>
        <p>Use esta tela apenas para iniciar o sistema.</p>

        <Form route="new_account.store">
          {({ errors, processing }) => (
            <>
              <div className="field">
                <label htmlFor="fullName">Nome completo</label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  placeholder="Seu nome"
                  data-invalid={errors.fullName ? 'true' : undefined}
                />
                {errors.fullName && <div className="alert-error">{errors.fullName}</div>}
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  placeholder="admin@redepark.com"
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
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  data-invalid={errors.password ? 'true' : undefined}
                />
                {errors.password && <div className="alert-error">{errors.password}</div>}
              </div>

              <div className="field">
                <label htmlFor="passwordConfirmation">Confirmar senha</label>
                <input
                  type="password"
                  name="passwordConfirmation"
                  id="passwordConfirmation"
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  data-invalid={errors.passwordConfirmation ? 'true' : undefined}
                />
                {errors.passwordConfirmation && (
                  <div className="alert-error">{errors.passwordConfirmation}</div>
                )}
              </div>

              <button type="submit" disabled={processing}>
                <UserPlus size={18} />
                Criar admin
              </button>
            </>
          )}
        </Form>
      </section>
    </main>
  )
}
