import type { InertiaProps } from '~/types'
import { router } from '@inertiajs/react'
import { DoorOpen, MagnifyingGlass, Plus } from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDateTime, formatPlate } from '~/lib/format'
import VisitorModal, { type Visitor } from '~/components/visitor_modal'

type PageProps = InertiaProps<{
  filters: { q: string; status: string }
  visitors: Visitor[]
  pastVisitors: Visitor[]
}>

export default function VisitorsIndex({ filters, visitors, pastVisitors }: PageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q') as string
    const status = formData.get('status') as string
    router.get('/visitantes', { q, status }, { preserveState: true })
  }

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('redepark_items_per_page')
      return saved ? Number(saved) : 10
    }
    return 10
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [exitingId, setExitingId] = useState<number | null>(null)

  const handleExit = useCallback((visitorId: number) => {
    setExitingId(visitorId)
    router.post(
      `/visitantes/${visitorId}/saida`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          router.reload({ only: ['visitors', 'pastVisitors'] })
        },
        onFinish: () => setExitingId(null),
      }
    )
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.q, filters.status])

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value)
    setItemsPerPage(val)
    setCurrentPage(1)
    if (typeof window !== 'undefined') {
      localStorage.setItem('redepark_items_per_page', String(val))
    }
  }

  const totalPages = Math.ceil(visitors.length / itemsPerPage)

  const paginatedVisitors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return visitors.slice(start, start + itemsPerPage)
  }, [visitors, currentPage, itemsPerPage])

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
          <h1>Visitantes</h1>
          <p>Registro rápido de entrada e saída.</p>
        </div>
      </header>

      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <button type="button" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Novo Visitante
        </button>
      </div>

      <VisitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pastVisitors={pastVisitors}
      />

      <section className="panel">
        <form className="toolbar" onSubmit={handleFilterSubmit}>
          <div className="field">
            <label htmlFor="visitor-search">Buscar</label>
            <input
              id="visitor-search"
              name="q"
              defaultValue={filters.q}
              placeholder="Nome, CPF ou placa"
            />
          </div>
          <div className="field">
            <label htmlFor="visitor-status">Status</label>
            <select id="visitor-status" name="status" defaultValue={filters.status}>
              <option value="inside">No pátio</option>
              <option value="all">Todos</option>
            </select>
          </div>
          <button type="submit">
            <MagnifyingGlass size={18} />
            Filtrar
          </button>
        </form>

        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th>Visitante</th>
                <th>Veículo</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVisitors.map((visitor) => (
                <tr key={visitor.id}>
                  <td>
                    <strong>{visitor.fullName}</strong>
                    <div className="small muted">CPF: {visitor.cpf}</div>
                    <div className="small muted">
                      {visitor.companyName || 'Empresa não informada'}
                    </div>
                  </td>
                  <td>
                    <strong>{formatPlate(visitor.licensePlate)}</strong>
                    <div className="small muted">
                      {[visitor.manufacturer, visitor.model, visitor.year]
                        .filter(Boolean)
                        .join(' ') || 'Sem detalhes'}
                    </div>
                  </td>
                  <td>{formatDateTime(visitor.enteredAt)}</td>
                  <td>
                    {visitor.exitedAt ? (
                      formatDateTime(visitor.exitedAt)
                    ) : (
                      <span className="status warning">Em aberto</span>
                    )}
                  </td>
                  <td>
                    {!visitor.exitedAt && (
                      <button
                        type="button"
                        className="secondary compact"
                        disabled={exitingId === visitor.id}
                        onClick={() => handleExit(visitor.id)}
                      >
                        <DoorOpen size={18} />
                        {exitingId === visitor.id ? 'Registrando...' : 'Registrar saída'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {visitors.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-size-selector">
              <label htmlFor="items-per-page-visitors">Itens por página:</label>
              <select
                id="items-per-page-visitors"
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
    </>
  )
}
