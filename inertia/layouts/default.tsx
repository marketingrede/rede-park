import { toast, Toaster } from 'sonner'
import { Link, usePage } from '@inertiajs/react'
import { type ReactElement, useEffect, useState } from 'react'
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
  ClipboardText,
  List,
  X,
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
  'public/collaborator_register',
  'public/privacy_policy',
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
  { href: '/usuarios/aprovacoes', label: 'Aprovações', icon: ClipboardText, roles: ['admin'] },
] as const

export default function Layout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const { url, component } = usePage()
  const user = children.props.user as SharedUser | undefined
  const pathName = url.split('?')[0]
  const isPublicPage = publicPages.has(component)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    setIsMoreOpen(false)
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
      {/* Mobile Top Bar */}
      <header className="mobile-top-bar">
        <Link className="brand-title" href="/operacao">
          <img src="/logo-rede-trilha.svg" alt="" />
          <span>Rede Park</span>
        </Link>
        <div className="profile-avatar" aria-hidden="true">
          {user.initials}
        </div>
      </header>

      {/* Desktop Sidebar */}
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

      {/* Main Content Area */}
      <main className="app-content">
        {children}
        <Toaster position="top-center" richColors />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Navegação inferior">
        <Link className={`mobile-nav-link${pathName === '/operacao' ? ' active' : ''}`} href="/operacao">
          <AddressBook size={20} weight={pathName === '/operacao' ? 'fill' : 'regular'} />
          <span>Operação</span>
        </Link>
        <Link className={`mobile-nav-link${pathName === '/visitantes' ? ' active' : ''}`} href="/visitantes">
          <IdentificationBadge size={20} weight={pathName === '/visitantes' ? 'fill' : 'regular'} />
          <span>Visitantes</span>
        </Link>
        {user.role === 'admin' && (
          <Link className={`mobile-nav-link${pathName === '/usuarios/aprovacoes' ? ' active' : ''}`} href="/usuarios/aprovacoes">
            <ClipboardText size={20} weight={pathName === '/usuarios/aprovacoes' ? 'fill' : 'regular'} />
            <span>Aprovações</span>
          </Link>
        )}
        <button type="button" className={`mobile-nav-link${isMoreOpen ? ' active' : ''}`} onClick={() => setIsMoreOpen(true)}>
          <List size={20} weight={isMoreOpen ? 'fill' : 'regular'} />
          <span>Mais</span>
        </button>
      </nav>

      {/* Mobile More Drawer Sheet */}
      <div className={`mobile-drawer-overlay${isMoreOpen ? ' open' : ''}`} onClick={() => setIsMoreOpen(false)} aria-hidden="true" />
      <section className={`mobile-drawer-content${isMoreOpen ? ' open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu Administrativo">
        <div className="drawer-handle" aria-hidden="true" />
        <header className="drawer-header">
          <div className="drawer-user-info">
            <div className="drawer-user-avatar" aria-hidden="true">
              {user.initials}
            </div>
            <div className="drawer-user-meta">
              <strong>{user.fullName || user.email}</strong>
              <span>{user.role === 'admin' ? 'Administrador' : 'Operador'}</span>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={() => setIsMoreOpen(false)} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </header>

        <div className="drawer-menu-grid">
          {user.role === 'admin' && (
            <>
              <Link className={`drawer-menu-item${pathName === '/dashboard' ? ' active' : ''}`} href="/dashboard">
                <ChartBar size={24} weight="duotone" />
                <span>Dashboard</span>
              </Link>
              <Link className={`drawer-menu-item${pathName === '/colaboradores' ? ' active' : ''}`} href="/colaboradores">
                <Users size={24} weight="duotone" />
                <span>Colaboradores</span>
              </Link>
              <Link className={`drawer-menu-item${pathName === '/veiculos' ? ' active' : ''}`} href="/veiculos">
                <Car size={24} weight="duotone" />
                <span>Veículos</span>
              </Link>
              <Link className={`drawer-menu-item${pathName === '/importacoes' ? ' active' : ''}`} href="/importacoes">
                <UploadSimple size={24} weight="duotone" />
                <span>Importações</span>
              </Link>
              <Link className={`drawer-menu-item${pathName === '/usuarios' ? ' active' : ''}`} href="/usuarios">
                <UserGear size={24} weight="duotone" />
                <span>Usuários</span>
              </Link>
            </>
          )}
        </div>

        <Form route="session.destroy" className="drawer-logout">
          <button type="submit" className="secondary full drawer-logout-btn">
            <SignOut size={16} />
            Sair da Conta
          </button>
        </Form>
      </section>

      <span hidden>
        <WhatsappLogo />
      </span>
    </div>
  )
}
