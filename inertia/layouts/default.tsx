import { toast, Toaster } from 'sonner'
import { Link, usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'
import { Form } from '@adonisjs/inertia/react'
import {
  AddressBook,
  Car,
  ChartBar,
  IdentificationBadge,
  SignOut,
  UploadSimple,
  UserGear,
  Users,
  WhatsappLogo,
} from '@phosphor-icons/react'
import { type Data } from '@generated/data'

type SharedUser = {
  fullName?: string | null
  email: string
  initials: string
  role: 'admin' | 'operator'
}

const publicPages = new Set([
  'auth/login',
  'auth/signup',
  'errors/not_found',
  'errors/server_error',
])

const navigationItems = [
  { href: '/operacao', label: 'Operação', icon: AddressBook, roles: ['admin', 'operator'] },
  {
    href: '/visitantes',
    label: 'Visitantes',
    icon: IdentificationBadge,
    roles: ['admin', 'operator'],
  },
  { href: '/dashboard', label: 'Dashboard', icon: ChartBar, roles: ['admin'] },
  { href: '/colaboradores', label: 'Colaboradores', icon: Users, roles: ['admin'] },
  { href: '/veiculos', label: 'Veículos', icon: Car, roles: ['admin'] },
  { href: '/importacoes', label: 'Importações', icon: UploadSimple, roles: ['admin'] },
  { href: '/usuarios', label: 'Usuários', icon: UserGear, roles: ['admin'] },
] as const

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, component } = usePage()
  const user = children.props.user as SharedUser | undefined
  const pathName = url.split('?')[0]
  const isPublicPage = publicPages.has(component)

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (children.props.flash.error) {
      toast.error(children.props.flash.error)
    }
    if (children.props.flash.success) {
      toast.success(children.props.flash.success)
    }
  }, [children.props.flash.error, children.props.flash.success])

  if (isPublicPage || !user) {
    return (
      <>
        {children}
        <Toaster position="top-center" richColors />
      </>
    )
  }

  const mainItems = navigationItems.slice(0, 2).filter((item) =>
    (item.roles as readonly string[]).includes(user.role)
  )

  const adminItems = navigationItems.slice(2).filter((item) =>
    (item.roles as readonly string[]).includes(user.role)
  )

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <Link className="brand" href="/operacao">
          <img src="/logo-rede-trilha.svg" alt="Rede Park" style={{ width: '80px', height: 'auto', objectFit: 'contain' }} />
          <span>Rede Park</span>
        </Link>

        <nav className="nav-section" aria-label="Áreas do sistema">
          <div className="nav-label">Principal</div>
          {mainItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                className={`nav-link${pathName === item.href ? ' active' : ''}`}
                href={item.href}
              >
                <Icon size={18} weight="duotone" />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {adminItems.length > 0 && (
            <>
              <div className="nav-divider" role="separator" />
              <div className="nav-label">Administração</div>
              {adminItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    className={`nav-link${pathName === item.href ? ' active' : ''}`}
                    href={item.href}
                  >
                    <Icon size={18} weight="duotone" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="user-row">
            <span className="avatar" aria-hidden="true">
              {user.initials}
            </span>
            <div>
              <strong>{user.fullName || user.email}</strong>
              <div className="small muted">{user.role === 'admin' ? 'Admin' : 'Operador'}</div>
            </div>
          </div>
          <Form route="session.destroy">
            <button type="submit" className="secondary full">
              <SignOut size={16} />
              Sair
            </button>
          </Form>
        </div>
      </aside>

      <main className="app-content">
        {children}
        <Toaster position="top-center" richColors />
      </main>

      <span hidden>
        <WhatsappLogo />
      </span>
    </div>
  )
}
