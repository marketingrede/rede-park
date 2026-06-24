import type { InertiaProps } from '~/types'
import { Form } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { MagnifyingGlass, PencilSimple, Plus, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { formatPlate } from '~/lib/format'

type Employee = {
  id: number
  fullName: string
}

type Vehicle = {
  id: number
  employeeId: number | null
  licensePlate: string
  vehicleType: string
  manufacturer: string | null
  model: string | null
  year: number | null
  color: string | null
  photoData: string | null
  photoMime: string | null
  status: string
  notes: string | null
}

type PageProps = InertiaProps<{
  filters: { q: string; status: string }
  vehicles: Vehicle[]
  employees: Employee[]
}>

const vehicleTypes = [
  ['car', 'Carro'],
  ['motorcycle', 'Moto'],
  ['truck', 'Caminhão'],
  ['van', 'Van'],
  ['other', 'Outro'],
] as const

function VehicleFields({ vehicle, employees }: { vehicle?: Vehicle; employees: Employee[] }) {
  return (
    <div className="form-grid">
      <div className="field wide">
        <label>Colaborador</label>
        <select name="employeeId" defaultValue={vehicle?.employeeId ?? ''} required>
          <option value="">Selecione</option>
          {employees.map((employee) => (
            <option value={employee.id} key={employee.id}>
              {employee.fullName}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Placa</label>
        <input name="licensePlate" defaultValue={vehicle?.licensePlate ?? ''} required />
      </div>
      <div className="field">
        <label>Tipo</label>
        <select name="vehicleType" defaultValue={vehicle?.vehicleType ?? 'car'}>
          {vehicleTypes.map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Fabricante</label>
        <input name="manufacturer" defaultValue={vehicle?.manufacturer ?? ''} />
      </div>
      <div className="field">
        <label>Modelo</label>
        <input name="model" defaultValue={vehicle?.model ?? ''} />
      </div>
      <div className="field">
        <label>Ano</label>
        <input type="number" name="year" defaultValue={vehicle?.year ?? ''} />
      </div>
      <div className="field">
        <label>Cor</label>
        <input name="color" defaultValue={vehicle?.color ?? ''} />
      </div>
      <div className="field">
        <label>Status</label>
        <select name="status" defaultValue={vehicle?.status ?? 'active'}>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>
      <div className="field wide">
        <label>Foto do veículo</label>
        <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" />
      </div>
      <div className="field wide">
        <label>Observações</label>
        <textarea name="notes" defaultValue={vehicle?.notes ?? ''} />
      </div>
    </div>
  )
}

export default function VehiclesIndex({ filters, vehicles, employees }: PageProps) {
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q') as string
    const status = formData.get('status') as string
    router.get('/veiculos', { q, status }, { preserveState: true })
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
  }, [filters.q, filters.status])

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value)
    setItemsPerPage(val)
    setCurrentPage(1)
    if (typeof window !== 'undefined') {
      localStorage.setItem('redepark_items_per_page', String(val))
    }
  }

  const totalPages = Math.ceil(vehicles.length / itemsPerPage)

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return vehicles.slice(start, start + itemsPerPage)
  }, [vehicles, currentPage, itemsPerPage])

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

  const employeeMap = new Map(employees.map((employee) => [employee.id, employee.fullName]))

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <h1>Veículos</h1>
          <p>Placas, modelos e vínculo com colaborador.</p>
        </div>
        <button type="button" onClick={() => setIsCreatingVehicle(true)}>
          <Plus size={16} />
          Novo veículo
        </button>
      </header>

      <section className="panel">
        <form className="toolbar" onSubmit={handleFilterSubmit}>
          <div className="field">
            <label htmlFor="vehicle-search">Buscar</label>
            <input
              id="vehicle-search"
              name="q"
              defaultValue={filters.q}
              placeholder="Placa, fabricante, modelo, ano ou colaborador"
            />
          </div>
          <div className="field">
            <label htmlFor="vehicle-status">Status</label>
            <select id="vehicle-status" name="status" defaultValue={filters.status}>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
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
                <th>Veículo</th>
                <th>Colaborador</th>
                <th>Detalhes</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <strong>{formatPlate(vehicle.licensePlate)}</strong>
                    <div className="small muted">
                      {vehicle.manufacturer || 'Fabricante não informado'}
                    </div>
                  </td>
                  <td>
                    {vehicle.employeeId
                      ? employeeMap.get(vehicle.employeeId) || 'Não encontrado'
                      : 'Sem vínculo'}
                  </td>
                  <td>
                    <div>{vehicle.model || 'Modelo não informado'}</div>
                    <div className="small muted">
                      {[vehicle.year, vehicle.color].filter(Boolean).join(' | ') || 'Sem detalhes'}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status ${vehicle.status === 'active' ? 'success' : 'danger'}`}
                    >
                      {vehicle.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="secondary compact"
                      onClick={() => setEditingVehicle(vehicle)}
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
        {vehicles.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-size-selector">
              <label htmlFor="items-per-page-vehicles">Itens por página:</label>
              <select
                id="items-per-page-vehicles"
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

      {isCreatingVehicle && (
        <div className="modal-backdrop" onClick={() => setIsCreatingVehicle(false)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-vehicle-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="new-vehicle-title">Novo veículo</h2>
                <p>Vincule o veículo a um colaborador. A foto é opcional.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fechar"
                onClick={() => setIsCreatingVehicle(false)}
              >
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <Form action={{ url: '/veiculos', method: 'post' }}>
                {({ processing }) => (
                  <>
                    <VehicleFields employees={employees} />
                    <div className="modal-actions">
                      <button type="submit" disabled={processing}>
                        <Plus size={18} />
                        Salvar veículo
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setIsCreatingVehicle(false)}
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

      {editingVehicle && (
        <div className="modal-backdrop" onClick={() => setEditingVehicle(null)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-vehicle-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="edit-vehicle-title">Editar veículo</h2>
                <p>{formatPlate(editingVehicle.licensePlate)}</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fechar"
                onClick={() => setEditingVehicle(null)}
              >
                <X size={18} />
              </button>
            </header>
            <div className="modal-body">
              <Form action={{ url: `/veiculos/${editingVehicle.id}`, method: 'post' }}>
                {({ processing }) => (
                  <>
                    <VehicleFields vehicle={editingVehicle} employees={employees} />
                    <div className="modal-actions">
                      <button type="submit" disabled={processing}>
                        Salvar alterações
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => setEditingVehicle(null)}
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
