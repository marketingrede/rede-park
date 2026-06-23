import type { InertiaProps } from '~/types'
import { Form } from '@adonisjs/inertia/react'
import { PencilSimple, Plus, UserGear, X } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { formatDateTime } from '~/lib/format'

type ManagedUser = {
  id: number
  fullName: string | null
  email: string
  role: 'admin' | 'operator'
  status: 'active' | 'inactive'
  createdAt: string
}

type PageProps = InertiaProps<{
  users: ManagedUser[]
}>

function UserFields({ user, requirePassword }: { user?: ManagedUser; requirePassword?: boolean }) {
  return (
    <div className="form-grid">
      <div className="field">
        <label>Nome</label>
        <input name="fullName" defaultValue={user?.fullName ?? ''} required />
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" name="email" defaultValue={user?.email ?? ''} required />
      </div>
      <div className="field">
        <label>Senha</label>
        <input
          type="password"
          name="password"
          minLength={8}
          required={requirePassword}
          placeholder={requirePassword ? 'Senha inicial' : 'Preencha para trocar'}
        />
      </div>
      <div className="field">
        <label>Papel</label>
        <select name="role" defaultValue={user?.role ?? 'operator'}>
          <option value="operator">Operador</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="field">
        <label>Status</label>
        <select name="status" defaultValue={user?.status ?? 'active'}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
    </div>
  )
}

export default function UsersIndex({ users }: PageProps) {
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null)

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('redepark_items_per_page')
      return saved ? Number(saved) : 10
    }
    return 10
  })
  const [currentPage, setCurrentPage] = useState(1)

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value)
    setItemsPerPage(val)
    setCurrentPage(1)
    if (typeof window !== 'undefined') {
      localStorage.setItem('redepark_items_per_page', String(val))
    }
  }

  const totalPages = Math.ceil(users.length / itemsPerPage)

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return users.slice(start, start + itemsPerPage)
  }, [users, currentPage, itemsPerPage])

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <h1>Usuários</h1>
          <p>Admins gerenciam tudo. Operadores usam portaria e visitantes.</p>
        </div>
      </header>

      <details className="collapsible-section">
        <summary>
          <Plus size={16} />
          Novo usuário — crie contas para portaria ou administração
        </summary>
        <div className="collapsible-body">
          <Form action={{ url: '/usuarios', method: 'post' }}>
            {({ processing }) => (
              <>
                <UserFields requirePassword />
                <button type="submit" disabled={processing} style={{ marginTop: 16 }}>
                  <Plus size={18} />
                  Criar usuário
                </button>
              </>
            )}
          </Form>
        </div>
      </details>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Contas</h2>
            <p>{users.length} usuário(s)</p>
          </div>
        </div>
        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Papel</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.fullName || user.email}</strong>
                    <div className="small muted">{user.email}</div>
                  </td>
                  <td>
                    <span className="status">
                      <UserGear size={14} />
                      {user.role === 'admin' ? 'Admin' : 'Operador'}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${user.status === 'active' ? 'success' : 'danger'}`}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{formatDateTime(user.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="secondary compact"
                      onClick={() => setEditingUser(user)}
                    >
                      <PencilSimple size={16} />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {users.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-size-selector">
              <label htmlFor="items-per-page-users">Itens por página:</label>
              <select
                id="items-per-page-users"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Anterior
                </button>
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="pagination-info"
                        style={{ minWidth: 'auto' }}
                      >
                        ...
                      </span>
                    )
                  }
                  return (
                    <button
                      key={page}
                      type="button"
                      data-active={currentPage === page}
                      onClick={() => setCurrentPage(page as number)}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="edit-user-title">Editar usuário</h2>
                <p>{editingUser.fullName || editingUser.email}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fechar"
                onClick={() => setEditingUser(null)}
              >
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <Form action={{ url: `/usuarios/${editingUser.id}`, method: 'post' }}>
                {({ processing }) => (
                  <>
                    <UserFields user={editingUser} />
                    <div className="modal-actions">
                      <button type="submit" disabled={processing}>
                        Salvar usuário
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                )}
              </Form>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
