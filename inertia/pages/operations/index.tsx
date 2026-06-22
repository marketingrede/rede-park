import type { InertiaProps } from '~/types'
import {
  Briefcase,
  Buildings,
  CalendarBlank,
  Car,
  DoorOpen,
  EnvelopeSimple,
  Hash,
  IdentificationCard,
  Info,
  List,
  MagnifyingGlass,
  NotePencil,
  Phone,
  Plus,
  SquaresFour,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { formatDate, formatDateTime, formatPhone, formatPlate, makeInitials } from '~/lib/format'
import VisitorModal, { Visitor } from '~/components/visitor_modal'

// Limites removidos em favor de paginação local dinâmica

type Vehicle = {
  id: number
  licensePlate: string
  manufacturer: string | null
  model: string | null
  year: number | null
  color: string | null
  vehicleType: string
  notes: string | null
  photoPath: string | null
}

type EmployeeCard = {
  id: number
  fullName: string
  birthDate: string | null
  roleName: string | null
  companyName: string | null
  costCenterCode: string | null
  costCenterDescription: string | null
  phone: string | null
  alternatePhone: string | null
  email: string | null
  photoPath: string | null
  notes: string | null
  status: string
  vehicles: Vehicle[]
  message: string
}

type PageProps = InertiaProps<{
  csrfToken: string
  queryText: string
  employees: EmployeeCard[]
  visitors: Visitor[]
  pastVisitors: Visitor[]
}>

function formatElapsedTime(enteredAtStr: string, now: Date) {
  const enteredAt = new Date(enteredAtStr)
  const diffMs = now.getTime() - enteredAt.getTime()
  if (diffMs < 0) return '0m'
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

type WhatsAppResponse = {
  whatsappUrl?: string
  error?: string
}

function employeePhone(employee: EmployeeCard) {
  return employee.phone || employee.alternatePhone || ''
}

function normalizeForSearch(value: string | number | null | undefined) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toUpperCase()
}

function searchTokens(value: string) {
  return normalizeForSearch(value).split(' ').filter(Boolean)
}

function matchesTokens(searchIndex: string, tokens: string[]) {
  return tokens.length === 0 || tokens.every((token) => searchIndex.includes(token))
}

function compactPlate(value: string | null | undefined) {
  return String(value ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

function employeeSearchIndex(employee: EmployeeCard) {
  return normalizeForSearch(
    [
      employee.fullName,
      employee.roleName,
      employee.companyName,
      employee.costCenterCode,
      employee.costCenterDescription,
      employee.phone,
      employee.alternatePhone,
      employee.email,
      employee.notes,
      ...employee.vehicles.flatMap((vehicle) => [
        vehicle.licensePlate,
        compactPlate(vehicle.licensePlate),
        vehicle.manufacturer,
        vehicle.model,
        vehicle.year,
        vehicle.color,
        vehicle.vehicleType,
        vehicle.notes,
      ]),
    ].join(' ')
  )
}

function visitorSearchIndex(visitor: Visitor) {
  return normalizeForSearch(
    [
      visitor.fullName,
      visitor.cpf,
      visitor.licensePlate,
      compactPlate(visitor.licensePlate),
      visitor.visitReason,
    ].join(' ')
  )
}

function vehicleLabel(vehicle: Vehicle) {
  return [vehicle.manufacturer, vehicle.model, vehicle.year].filter(Boolean).join(' ')
}

function vehicleTypeLabel(type: string) {
  const labels: Record<string, string> = {
    car: 'Carro',
    motorcycle: 'Moto',
    truck: 'Caminhão',
    van: 'Van',
    other: 'Outro',
  }

  return labels[type] ?? type
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    ? Boolean(target.closest('button, a, input, textarea, select, form'))
    : false
}

function DetailLine({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="detail-line">
      <span className="detail-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <span>{label}</span>
        <strong>{value || 'Não informado'}</strong>
      </div>
    </div>
  )
}

export default function OperationIndex({ csrfToken, queryText, employees, visitors, pastVisitors }: PageProps) {
  const [searchText, setSearchText] = useState(queryText)
  const [selectedCompany, setSelectedCompany] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeCard | null>(null)
  const [pendingContactEmployeeId, setPendingContactEmployeeId] = useState<number | null>(null)
  const [contactError, setContactError] = useState<string | null>(null)

  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const handleExitVisitor = (id: number) => {
    router.post(`/visitantes/${id}/saida`, {}, {
      preserveState: true,
    })
  }

  const companies = useMemo(() => {
    const list = employees
      .map((e) => e.companyName)
      .filter(Boolean) as string[]
    return Array.from(new Set(list)).sort()
  }, [employees])

  const [sortField, setSortField] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('redepark_ops_sort_field') || 'fullName'
    }
    return 'fullName'
  })
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('redepark_ops_sort_order') as 'asc' | 'desc') || 'asc'
    }
    return 'asc'
  })

  const handleSort = (field: string) => {
    let newOrder: 'asc' | 'desc' = 'asc'
    if (sortField === field) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc'
    }
    setSortField(field)
    setSortOrder(newOrder)
    if (typeof window !== 'undefined') {
      localStorage.setItem('redepark_ops_sort_field', field)
      localStorage.setItem('redepark_ops_sort_order', newOrder)
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? ' ▲' : ' ▼'
  }

  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('redepark_ops_view_mode')
      return saved === 'card' ? 'card' : 'list'
    }
    return 'list'
  })

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('redepark_items_per_page')
      return saved ? Number(saved) : 10
    }
    return 10
  })
  const [currentPage, setCurrentPage] = useState(1)

  const tokens = useMemo(() => searchTokens(searchText), [searchText])
  const isSearching = tokens.length > 0 || selectedCompany !== 'all'

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesCompany = selectedCompany === 'all' || employee.companyName === selectedCompany
      const matchesSearch = matchesTokens(employeeSearchIndex(employee), tokens)
      return matchesCompany && matchesSearch
    })
  }, [employees, tokens, selectedCompany])

  const sortedEmployees = useMemo(() => {
    const sorted = [...filteredEmployees]
    sorted.sort((a, b) => {
      let valA = a[sortField as keyof EmployeeCard] || ''
      let valB = b[sortField as keyof EmployeeCard] || ''

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc'
          ? valA.localeCompare(valB, 'pt-BR')
          : valB.localeCompare(valA, 'pt-BR')
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredEmployees, sortField, sortOrder])

  const filteredVisitors = useMemo(
    () => visitors.filter((visitor) => matchesTokens(visitorSearchIndex(visitor), tokens)),
    [visitors, tokens]
  )

  // Reset page when search or company changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, selectedCompany])

  // Sync viewMode to localStorage
  useEffect(() => {
    localStorage.setItem('redepark_ops_view_mode', viewMode)
  }, [viewMode])

  // Sync itemsPerPage to localStorage
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value)
    setItemsPerPage(val)
    setCurrentPage(1)
    if (typeof window !== 'undefined') {
      localStorage.setItem('redepark_items_per_page', String(val))
    }
  }

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedEmployees.slice(start, start + itemsPerPage)
  }, [sortedEmployees, currentPage, itemsPerPage])

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

  useEffect(() => {
    if (!selectedEmployee) {
      return
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedEmployee(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedEmployee])

  const openEmployee = (employee: EmployeeCard) => {
    setSelectedEmployee(employee)
  }

  const openEmployeeFromCard = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
    employee: EmployeeCard
  ) => {
    if ('key' in event && event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    if (isInteractiveTarget(event.target)) {
      return
    }

    event.preventDefault()
    openEmployee(employee)
  }

  const handleWhatsApp = async (employee: EmployeeCard) => {
    const phone = employeePhone(employee)
    if (!phone) {
      setContactError('Este colaborador ainda não tem telefone.')
      return
    }

    setContactError(null)
    setPendingContactEmployeeId(employee.id)

    const formData = new FormData()
    formData.append('_csrf', csrfToken)
    formData.append('employeeId', String(employee.id))
    formData.append('targetPhone', phone)
    formData.append('message', employee.message)

    try {
      const response = await fetch('/contatos/whatsapp', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
        credentials: 'same-origin',
      })
      const data = (await response.json().catch(() => ({}))) as WhatsAppResponse

      if (!response.ok || !data.whatsappUrl) {
        throw new Error(data.error || 'Não foi possível abrir o WhatsApp.')
      }

      window.location.assign(data.whatsappUrl)
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Não foi possível abrir o WhatsApp.')
      setPendingContactEmployeeId(null)
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <h1>Operação da portaria</h1>
          <p>Busque por nome, placa, cargo, empresa, modelo ou ano.</p>
        </div>
      </header>

      <section className="panel" aria-labelledby="global-search-title">
        <div className="section-heading">
          <div>
            <h2 id="global-search-title">Busca e Filtros</h2>
            <p>Busque colaboradores e filtre por empresa.</p>
          </div>
        </div>
        <form className="operations-toolbar" onSubmit={(e) => e.preventDefault()}>
          <div className="field field-search">
            <label htmlFor="q">Buscar</label>
            <div className="search-prominent">
              <span className="search-icon" aria-hidden="true">
                <MagnifyingGlass size={18} />
              </span>
              <input
                id="q"
                name="q"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                autoComplete="off"
                placeholder="Ex.: ABC1234, João, Toyota, 2020"
              />
            </div>
          </div>
          <div className="field field-company">
            <label htmlFor="op-company">Empresa</label>
            <select
              id="op-company"
              value={selectedCompany}
              onChange={(event) => setSelectedCompany(event.target.value)}
            >
              <option value="all">Todas as empresas</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {(searchText || selectedCompany !== 'all') && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setSearchText('')
                setSelectedCompany('all')
              }}
            >
              <X size={16} />
              Limpar
            </button>
          )}
        </form>
        {contactError && (
          <div className="alert-error" role="alert" style={{ marginTop: 12 }}>
            {contactError}
          </div>
        )}
      </section>

      <section className="grid-two mt-section">
        <div className="panel">
          <div className="section-heading">
            <div>
              <h2>Colaboradores</h2>
              <p>
                {isSearching
                  ? `${filteredEmployees.length} resultado(s)`
                  : `Mostrando ${paginatedEmployees.length} de ${filteredEmployees.length}`}
              </p>
            </div>
            <div className="view-toggle">
              <button
                type="button"
                className="view-toggle-button"
                data-active={viewMode === 'card'}
                onClick={() => setViewMode('card')}
                title="Visualização em grade"
              >
                <SquaresFour size={20} weight="duotone" />
              </button>
              <button
                type="button"
                className="view-toggle-button"
                data-active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                title="Visualização em lista"
              >
                <List size={20} weight="duotone" />
              </button>
            </div>
          </div>

          {paginatedEmployees.length === 0 ? (
            <div className="empty-state">Nenhum colaborador encontrado.</div>
          ) : (
            <>
              {viewMode === 'card' ? (
                <div className="employee-cards-grid">
                  {paginatedEmployees.map((employee) => {
                    const phone = employeePhone(employee)
                    const isPendingContact = pendingContactEmployeeId === employee.id
                    return (
                      <article
                        className="employee-card"
                        key={employee.id}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => openEmployeeFromCard(event, employee)}
                        onKeyDown={(event) => openEmployeeFromCard(event, employee)}
                        aria-label={`Abrir detalhes de ${employee.fullName}`}
                      >
                        <div className="employee-card-header">
                          {employee.photoPath ? (
                            <img className="employee-card-photo" src={employee.photoPath} alt="" />
                          ) : (
                            <span className="employee-card-photo-fallback" aria-hidden="true">
                              {makeInitials(employee.fullName)}
                            </span>
                          )}
                          <div className="employee-card-info">
                            <h3>{employee.fullName}</h3>
                            <p className="employee-card-role">
                              <Briefcase size={14} weight="duotone" />
                              {employee.roleName || 'Cargo não informado'}
                            </p>
                            <p className="employee-card-company">
                              <Buildings size={14} weight="duotone" />
                              {employee.companyName ||
                                employee.costCenterDescription ||
                                'Empresa não informada'}
                            </p>
                          </div>
                        </div>

                        <div className="employee-card-body">
                          <div className="chips">
                            <span className="chip">
                              <Phone size={13} weight="duotone" />
                              {formatPhone(phone)}
                            </span>
                            {employee.vehicles.map((vehicle) => (
                              <span className="chip" key={vehicle.id}>
                                <Car size={13} weight="duotone" />
                                {formatPlate(vehicle.licensePlate)}
                              </span>
                            ))}
                          </div>
                          {employee.vehicles.length > 0 && (
                            <div className="small muted" style={{ marginTop: 8 }}>
                              {employee.vehicles.map((vehicle) => vehicleLabel(vehicle)).join(' | ')}
                            </div>
                          )}
                        </div>

                        <div className="employee-card-footer" onClick={(event) => event.stopPropagation()}>
                          <button
                            className="secondary compact"
                            type="button"
                            onClick={() => openEmployee(employee)}
                          >
                            <Info size={16} weight="duotone" />
                            Detalhes
                          </button>

                          <button
                            className="compact"
                            type="button"
                            disabled={isPendingContact || !phone}
                            onClick={() => void handleWhatsApp(employee)}
                          >
                            <WhatsappLogo size={17} weight="duotone" />
                            {isPendingContact ? 'Abrindo' : 'Enviar'}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="employee-list">
                  <div className="employee-list-header">
                    <div aria-hidden="true"></div>
                    <div
                      onClick={() => handleSort('fullName')}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Colaborador{renderSortIcon('fullName')}
                    </div>
                    <div
                      onClick={() => handleSort('companyName')}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      Contato / Empresa{renderSortIcon('companyName')}
                    </div>
                    <div>Veículos</div>
                    <div>Ações</div>
                  </div>
                  {paginatedEmployees.map((employee) => {
                    const phone = employeePhone(employee)
                    const isPendingContact = pendingContactEmployeeId === employee.id
                    return (
                      <article
                        className="employee-list-item"
                        key={employee.id}
                        role="button"
                        tabIndex={0}
                        onClick={(event) => openEmployeeFromCard(event, employee)}
                        onKeyDown={(event) => openEmployeeFromCard(event, employee)}
                        aria-label={`Abrir detalhes de ${employee.fullName}`}
                      >
                        {employee.photoPath ? (
                          <img className="employee-list-photo" src={employee.photoPath} alt="" />
                        ) : (
                          <span className="employee-list-photo-fallback" aria-hidden="true">
                            {makeInitials(employee.fullName)}
                          </span>
                        )}

                        <div className="employee-list-name">
                          <strong>{employee.fullName}</strong>
                          <span>{employee.roleName || 'Cargo não informado'}</span>
                        </div>

                        <div className="employee-list-contact">
                          <div>{formatPhone(phone)}</div>
                          <div className="small muted">
                            {employee.companyName ||
                              employee.costCenterDescription ||
                              'Sem empresa'}
                          </div>
                        </div>

                        <div className="employee-list-plates">
                          {employee.vehicles.slice(0, 2).map((vehicle) => (
                            <span className="chip" key={vehicle.id}>
                              <Car size={13} weight="duotone" />
                              {formatPlate(vehicle.licensePlate)}
                            </span>
                          ))}
                          {employee.vehicles.length > 2 && (
                            <span className="chip">+{employee.vehicles.length - 2}</span>
                          )}
                        </div>

                        <div className="employee-list-actions" onClick={(event) => event.stopPropagation()}>
                          <button
                            className="secondary compact"
                            type="button"
                            onClick={() => openEmployee(employee)}
                            title="Detalhes"
                          >
                            <Info size={16} weight="duotone" />
                          </button>
                          <button
                            className="compact"
                            type="button"
                            disabled={isPendingContact || !phone}
                            onClick={() => void handleWhatsApp(employee)}
                            title="Enviar WhatsApp"
                          >
                            <WhatsappLogo size={17} weight="duotone" />
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredEmployees.length > 0 && (
                <div className="pagination-controls">
                  <div className="pagination-size-selector">
                    <label htmlFor="items-per-page-ops">Itens por página:</label>
                    <select
                      id="items-per-page-ops"
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
                            <span key={`ellipsis-${index}`} className="pagination-info" style={{ minWidth: 'auto' }}>
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
            </>
          )}
        </div>

        <aside className="panel" aria-labelledby="visitors-now-title">
          <div className="section-heading">
            <div>
              <h2 id="visitors-now-title">Visitantes no pátio</h2>
              <p>
                {isSearching
                  ? `${filteredVisitors.length} resultado(s)`
                  : `${filteredVisitors.length} entrada(s) em aberto`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                type="button" 
                className="compact" 
                onClick={() => setIsVisitorModalOpen(true)}
                style={{ height: '32px', minHeight: 'auto', fontSize: '11px', gap: '4px' }}
              >
                <Plus size={12} />
                Novo
              </button>
              <Link 
                className="button secondary compact" 
                href="/visitantes" 
                style={{ height: '32px', minHeight: 'auto', fontSize: '11px', display: 'flex', alignItems: 'center' }}
              >
                Gerenciar
              </Link>
            </div>
          </div>

          {filteredVisitors.length === 0 ? (
            <div className="empty-state">Nenhum visitante em aberto.</div>
          ) : (
            <div className="stack">
              {filteredVisitors.map((visitor) => {
                const elapsed = formatElapsedTime(visitor.enteredAt, now)
                return (
                  <article className="person-card" key={visitor.id}>
                    <strong>{visitor.fullName}</strong>
                    <div className="chips">
                      <span className="chip">
                        <Car size={14} weight="duotone" />
                        {formatPlate(visitor.licensePlate)}
                      </span>
                      <span className="chip">
                        <IdentificationCard size={14} weight="duotone" />
                        {visitor.cpf}
                      </span>
                      <span className="chip" style={{ background: 'var(--warning-soft)', color: 'var(--warning)', borderColor: 'var(--warning-soft)', fontWeight: 600 }}>
                        ⏱️ {elapsed}
                      </span>
                    </div>
                    <span className="small muted">Entrada: {formatDateTime(visitor.enteredAt)}</span>
                    {visitor.visitReason && (
                      <span className="small muted">Motivo: {visitor.visitReason}</span>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button 
                        type="button" 
                        className="secondary compact" 
                        onClick={() => handleExitVisitor(visitor.id)}
                        style={{ fontSize: '11px', height: '28px', minHeight: 'auto', width: '100%', gap: '4px' }}
                      >
                        <DoorOpen size={14} />
                        Dar Baixa
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </aside>
      </section>

      {selectedEmployee && (
        <div className="modal-backdrop" onClick={() => setSelectedEmployee(null)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div className="person-main">
                {selectedEmployee.photoPath ? (
                  <img className="avatar large" src={selectedEmployee.photoPath} alt="" />
                ) : (
                  <span className="photo-fallback large" aria-hidden="true">
                    {makeInitials(selectedEmployee.fullName)}
                  </span>
                )}
                <div>
                  <h2 id="employee-modal-title">{selectedEmployee.fullName}</h2>
                  <p>{selectedEmployee.roleName || 'Cargo não informado'}</p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fechar detalhes"
                onClick={() => setSelectedEmployee(null)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="modal-body">
              <div className="detail-grid">
                <DetailLine
                  icon={<Buildings size={18} weight="duotone" />}
                  label="Empresa"
                  value={selectedEmployee.companyName}
                />
                <DetailLine
                  icon={<Briefcase size={18} weight="duotone" />}
                  label="Cargo"
                  value={selectedEmployee.roleName}
                />
                <DetailLine
                  icon={<Phone size={18} weight="duotone" />}
                  label="Telefone"
                  value={formatPhone(employeePhone(selectedEmployee))}
                />
                <DetailLine
                  icon={<EnvelopeSimple size={18} weight="duotone" />}
                  label="E-mail"
                  value={selectedEmployee.email}
                />
                <DetailLine
                  icon={<CalendarBlank size={18} weight="duotone" />}
                  label="Nascimento"
                  value={formatDate(selectedEmployee.birthDate)}
                />
                <DetailLine
                  icon={<Hash size={18} weight="duotone" />}
                  label="Centro de custo"
                  value={
                    [selectedEmployee.costCenterCode, selectedEmployee.costCenterDescription]
                      .filter(Boolean)
                      .join(' — ') || null
                  }
                />
              </div>

              <div className="modal-section">
                <h3>
                  <Car size={18} weight="duotone" />
                  Veículos
                </h3>
                {selectedEmployee.vehicles.length === 0 ? (
                  <div className="empty-state compact">Nenhum veículo vinculado.</div>
                ) : (
                  <div className="vehicle-list">
                    {selectedEmployee.vehicles.map((vehicle) => (
                      <article className="vehicle-row" key={vehicle.id}>
                        {vehicle.photoPath ? (
                          <img className="vehicle-thumb" src={vehicle.photoPath} alt="" />
                        ) : (
                          <span className="vehicle-thumb" aria-hidden="true">
                            <Car size={18} weight="duotone" />
                          </span>
                        )}
                        <div>
                          <strong>{formatPlate(vehicle.licensePlate)}</strong>
                          <span>
                            {vehicleLabel(vehicle) || 'Modelo não informado'} —{' '}
                            {vehicleTypeLabel(vehicle.vehicleType)}
                          </span>
                          <span>
                            {[vehicle.color, vehicle.notes].filter(Boolean).join(' — ') ||
                              'Sem observações'}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {selectedEmployee.notes && (
                <div className="modal-section">
                  <h3>
                    <NotePencil size={18} weight="duotone" />
                    Observações
                  </h3>
                  <p className="muted">{selectedEmployee.notes}</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  disabled={
                    pendingContactEmployeeId === selectedEmployee.id ||
                    !employeePhone(selectedEmployee)
                  }
                  onClick={() => void handleWhatsApp(selectedEmployee)}
                >
                  <WhatsappLogo size={18} weight="duotone" />
                  {pendingContactEmployeeId === selectedEmployee.id ? 'Abrindo' : 'Enviar mensagem'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <VisitorModal
        isOpen={isVisitorModalOpen}
        onClose={() => setIsVisitorModalOpen(false)}
        pastVisitors={pastVisitors}
      />
    </>
  )
}
