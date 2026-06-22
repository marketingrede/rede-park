import type { InertiaProps } from '~/types'
import { Form } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { Camera, MagnifyingGlass, PencilSimple, Plus, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { formatDate, formatPhone, formatPlate, makeInitials } from '~/lib/format'

type Employee = {
  id: number
  fullName: string
  birthDate: string | null
  costCenterCode: string | null
  costCenterDescription: string | null
  roleName: string | null
  companyName: string | null
  phone: string | null
  alternatePhone: string | null
  email: string | null
  photoPath: string | null
  status: string
  notes: string | null
}

type Vehicle = {
  id: number
  employeeId: number | null
  licensePlate: string
  manufacturer: string | null
  model: string | null
  year: number | null
}

type PageProps = InertiaProps<{
  filters: { q: string; status: string; company?: string }
  employees: Employee[]
  vehicles: Vehicle[]
  companies: string[]
}>

function EmployeeFields({ employee }: { employee?: Employee }) {
  const [preview, setPreview] = useState<string | null>(employee?.photoPath ?? null)

  useEffect(() => {
    setPreview(employee?.photoPath ?? null)
  }, [employee])

  // Clean up object URL when preview or component changes
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  return (
    <div className="form-grid">
      <div className="field wide">
        <label htmlFor={employee ? `fullName-${employee.id}` : 'fullName'}>Nome</label>
        <input
          id={employee ? `fullName-${employee.id}` : 'fullName'}
          name="fullName"
          defaultValue={employee?.fullName}
          required
        />
      </div>
      <div className="field">
        <label>Data de nascimento</label>
        <input
          type="date"
          name="birthDate"
          defaultValue={employee?.birthDate?.slice(0, 10) ?? ''}
        />
      </div>
      <div className="field">
        <label>Empresa</label>
        <input name="companyName" defaultValue={employee?.companyName ?? ''} />
      </div>
      <div className="field">
        <label>Telefone</label>
        <input name="phone" defaultValue={employee?.phone ?? ''} />
      </div>
      <div className="field">
        <label>Telefone extra</label>
        <input name="alternatePhone" defaultValue={employee?.alternatePhone ?? ''} />
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" name="email" defaultValue={employee?.email ?? ''} />
      </div>
      <div className="field">
        <label>Status</label>
        <select name="status" defaultValue={employee?.status ?? 'active'}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <div className="field">
        <label>Centro de custo</label>
        <input name="costCenterCode" defaultValue={employee?.costCenterCode ?? ''} />
      </div>
      <div className="field">
        <label>Cargo</label>
        <input name="roleName" defaultValue={employee?.roleName ?? ''} />
      </div>
      <div className="field wide">
        <label>Descrição do centro de custo</label>
        <input name="costCenterDescription" defaultValue={employee?.costCenterDescription ?? ''} />
      </div>
      <div className="field wide">
        <label>Foto</label>
        <div className="photo-upload-field">
          {preview ? (
            <img className="photo-upload-preview" src={preview} alt="Prévia" />
          ) : (
            <span className="photo-upload-placeholder" aria-hidden="true">
              <Camera size={24} weight="duotone" />
            </span>
          )}
          <div style={{ flex: 1 }}>
            <input
              type="file"
              name="photo"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />
            <p className="small muted" style={{ marginTop: 4 }}>
              Formatos recomendados: JPG, PNG ou WebP. Máx. 3MB.
            </p>
          </div>
        </div>
      </div>
      <div className="field wide">
        <label>Observações</label>
        <textarea name="notes" defaultValue={employee?.notes ?? ''} />
      </div>
    </div>
  )
}

export default function EmployeesIndex({ filters, employees, vehicles, companies }: PageProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q') as string
    const status = formData.get('status') as string
    const company = formData.get('company') as string
    router.get('/colaboradores', { q, status, company }, { preserveState: true })
  }

  const [sortField, setSortField] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('redepark_employees_sort_field') || 'fullName'
    }
    return 'fullName'
  })
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('redepark_employees_sort_order') as 'asc' | 'desc') || 'asc'
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
      localStorage.setItem('redepark_employees_sort_field', field)
      localStorage.setItem('redepark_employees_sort_order', newOrder)
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? ' ▲' : ' ▼'
  }

  const [itemsPerPage, setItemsPerPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('redepark_items_per_page')
      return saved ? Number(saved) : 10
    }
    return 10
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.q, filters.status, filters.company])

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value)
    setItemsPerPage(val)
    setCurrentPage(1)
    if (typeof window !== 'undefined') {
      localStorage.setItem('redepark_items_per_page', String(val))
    }
  }

  const sortedEmployees = useMemo(() => {
    const sorted = [...employees]
    sorted.sort((a, b) => {
      let valA = a[sortField as keyof Employee] || ''
      let valB = b[sortField as keyof Employee] || ''

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
  }, [employees, sortField, sortOrder])

  const totalPages = Math.ceil(employees.length / itemsPerPage)
  
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

  const vehiclesByEmployee = new Map<number, Vehicle[]>()
  for (const vehicle of vehicles) {
    if (!vehicle.employeeId) continue
    vehiclesByEmployee.set(vehicle.employeeId, [
      ...(vehiclesByEmployee.get(vehicle.employeeId) ?? []),
      vehicle,
    ])
  }

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const isAllSelected =
    paginatedEmployees.length > 0 &&
    paginatedEmployees.every((e) => selectedIds.includes(e.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedEmployees.map((e) => e.id).includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedEmployees.map((e) => e.id)])))
    }
  }

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleBulkDelete = () => {
    if (
      confirm(
        `Tem certeza que deseja excluir os ${selectedIds.length} colaboradores selecionados? Todos os seus veículos também serão removidos permanentemente do sistema.`
      )
    ) {
      router.post(
        '/colaboradores/excluir-lote',
        { ids: selectedIds },
        {
          onSuccess: () => setSelectedIds([]),
        }
      )
    }
  }

  useEffect(() => {
    setSelectedIds([])
  }, [currentPage, filters])

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <h1>Colaboradores</h1>
          <p>Cadastro vindo do Senior, contatos e foto.</p>
        </div>
      </header>

      <details className="collapsible-section">
        <summary>
          <Plus size={16} />
          Novo colaborador — ajuste manual fora da importação Senior
        </summary>
        <div className="collapsible-body">
          <Form action={{ url: '/colaboradores', method: 'post' }}>
            {({ processing }) => (
              <>
                <EmployeeFields />
                <button type="submit" disabled={processing} style={{ marginTop: 16 }}>
                  <Plus size={18} />
                  Salvar colaborador
                </button>
              </>
            )}
          </Form>
        </div>
      </details>

      <section className="panel">
        <form className="toolbar" onSubmit={handleFilterSubmit}>
          <div className="field">
            <label htmlFor="employee-search">Buscar</label>
            <input
              id="employee-search"
              name="q"
              defaultValue={filters.q}
              placeholder="Nome, cargo, telefone ou centro de custo"
            />
          </div>
          <div className="field">
            <label htmlFor="employee-status">Status</label>
            <select id="employee-status" name="status" defaultValue={filters.status}>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="all">Todos</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="employee-company">Empresa</label>
            <select id="employee-company" name="company" defaultValue={filters.company || 'all'}>
              <option value="all">Todas</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">
            <MagnifyingGlass size={18} />
            Filtrar
          </button>
        </form>

        {selectedIds.length > 0 && (
          <div
            className="alert-warning"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--warning-soft)',
              border: '1px solid var(--warning)',
            }}
          >
            <span style={{ fontWeight: 600 }}>
              {selectedIds.length} colaborador(es) selecionado(s)
            </span>
            <button type="button" className="danger compact" onClick={handleBulkDelete}>
              Apagar selecionados
            </button>
          </div>
        )}

        <div className="table-panel">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Selecionar todos os colaboradores desta página"
                  />
                </th>
                <th
                  onClick={() => handleSort('fullName')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Colaborador{renderSortIcon('fullName')}
                </th>
                <th
                  onClick={() => handleSort('companyName')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Contato{renderSortIcon('companyName')}
                </th>
                <th
                  onClick={() => handleSort('roleName')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Senior{renderSortIcon('roleName')}
                </th>
                <th>Veículos</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(employee.id)}
                      onChange={() => handleToggleSelect(employee.id)}
                      aria-label={`Selecionar ${employee.fullName}`}
                    />
                  </td>
                  <td>
                    <div className="person-main">
                      {employee.photoPath ? (
                        <img className="avatar" src={employee.photoPath} alt="" />
                      ) : (
                        <span className="photo-fallback" aria-hidden="true">
                          {makeInitials(employee.fullName)}
                        </span>
                      )}
                      <div>
                        <strong>{employee.fullName}</strong>
                        <div className="small muted">
                          {employee.roleName || 'Cargo não informado'}
                        </div>
                        <span
                          className={`status ${employee.status === 'active' ? 'success' : 'danger'}`}
                        >
                          {employee.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{formatPhone(employee.phone)}</div>
                    <div className="small muted">{employee.email || 'Sem email'}</div>
                    <div className="small muted">{employee.companyName || 'Sem empresa'}</div>
                  </td>
                  <td>
                    <div>{employee.costCenterCode || 'Sem CC'}</div>
                    <div className="small muted">
                      {employee.costCenterDescription || 'Sem descrição'}
                    </div>
                    <div className="small muted">Nascimento: {formatDate(employee.birthDate)}</div>
                  </td>
                  <td>
                    <div className="chips">
                      {(vehiclesByEmployee.get(employee.id) ?? []).map((vehicle) => (
                        <span className="chip" key={vehicle.id}>
                          {formatPlate(vehicle.licensePlate)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="secondary compact"
                      onClick={() => setEditingEmployee(employee)}
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
        {employees.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-size-selector">
              <label htmlFor="items-per-page-employees">Itens por página:</label>
              <select
                id="items-per-page-employees"
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
      </section>

      {editingEmployee && (
        <div className="modal-backdrop" onClick={() => setEditingEmployee(null)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-employee-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="edit-employee-title">Editar colaborador</h2>
                <p>{editingEmployee.fullName}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fechar"
                onClick={() => setEditingEmployee(null)}
              >
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <Form action={{ url: `/colaboradores/${editingEmployee.id}`, method: 'post' }}>
                {({ processing }) => (
                  <>
                    <EmployeeFields employee={editingEmployee} />
                    <div className="modal-actions">
                      <button type="submit" disabled={processing}>
                        Salvar alterações
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingEmployee(null)}
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
