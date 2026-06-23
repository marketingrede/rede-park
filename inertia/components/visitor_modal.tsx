import { useEffect, useMemo, useState, useRef } from 'react'
import { router } from '@inertiajs/react'
import { X, MagnifyingGlass, Car, Plus } from '@phosphor-icons/react'

export type Visitor = {
  id: number
  fullName: string
  cpf: string
  licensePlate: string
  vehicleType: string | null
  manufacturer: string | null
  model: string | null
  year: number | null
  companyName: string | null
  visitReason: string | null
  notes: string | null
  enteredAt: string
  exitedAt?: string | null
}

type VisitorModalProps = {
  isOpen: boolean
  onClose: () => void
  pastVisitors: Visitor[]
}

export default function VisitorModal({ isOpen, onClose, pastVisitors }: VisitorModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [visitReason, setVisitReason] = useState('')
  const [notes, setNotes] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      handleResetForm()
    }
  }, [isOpen])

  const handleResetForm = () => {
    setFullName('')
    setCpf('')
    setLicensePlate('')
    setCompanyName('')
    setVehicleType('')
    setManufacturer('')
    setModel('')
    setYear('')
    setVisitReason('')
    setNotes('')
    setSearchQuery('')
    setShowSuggestions(false)
    setAlertMessage('')
  }

  // Filter past visitors based on search query
  const filteredPast = useMemo(() => {
    const query = searchQuery.trim()
    if (!query) return []
    const tokens = query
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .filter(Boolean)
    if (tokens.length === 0) return []

    return pastVisitors
      .filter((v) => {
        const targetStr = `${v.fullName} ${v.cpf} ${v.licensePlate}`
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
        return tokens.every((token) => targetStr.includes(token))
      })
      .slice(0, 5)
  }, [searchQuery, pastVisitors])

  const handleSelectVisitor = (v: Visitor) => {
    setFullName(v.fullName || '')
    setCpf(v.cpf || '')
    setLicensePlate(v.licensePlate || '')
    setCompanyName(v.companyName || '')
    setVehicleType(v.vehicleType || '')
    setManufacturer(v.manufacturer || '')
    setModel(v.model || '')
    setYear(v.year ? String(v.year) : '')
    setSearchQuery('')
    setShowSuggestions(false)
    setAlertMessage('Campos preenchidos a partir do histórico do visitante.')
    setTimeout(() => setAlertMessage(''), 4000)
  }

  // Handle click outside suggestions to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)

    router.post(
      '/visitantes',
      {
        fullName,
        cpf,
        licensePlate,
        companyName,
        vehicleType,
        manufacturer,
        model,
        year: year ? Number(year) : null,
        visitReason,
        notes,
      },
      {
        onSuccess: () => {
          setIsProcessing(false)
          handleResetForm()
          onClose()
        },
        onError: () => {
          setIsProcessing(false)
        },
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-modal-title"
        onClick={(event) => event.stopPropagation()}
        style={{ width: 'min(640px, 100%)' }}
      >
        <header className="modal-header">
          <div>
            <h2 id="visitor-modal-title">Registrar Entrada de Visitante</h2>
            <p>CPF, nome completo e placa são obrigatórios</p>
          </div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="modal-body">
          {/* Autocomplete Search input */}
          <div
            className="field search-prominent"
            style={{ position: 'relative', marginBottom: 16 }}
          >
            <label htmlFor="modal-visitor-search">Buscar visitante cadastrado (CPF ou Nome)</label>
            <div style={{ position: 'relative', marginTop: 4 }}>
              <input
                id="modal-visitor-search"
                type="text"
                placeholder="Ex: João da Silva ou 123.456..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <div className="search-icon">
                <MagnifyingGlass size={18} />
              </div>
            </div>

            {showSuggestions && filteredPast.length > 0 && (
              <div
                ref={suggestionsRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 50,
                  marginTop: 4,
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {filteredPast.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      background: 'none',
                      color: 'inherit',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      borderRadius: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onClick={() => handleSelectVisitor(v)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: 'var(--font-size-base)' }}>
                        {v.fullName}
                      </strong>
                      <span className="small muted">CPF: {v.cpf}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="chip" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        <Car size={10} />
                        {v.licensePlate}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {alertMessage && (
            <div
              className="alert-success"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--success-soft)',
                color: 'var(--success)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {alertMessage}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field wide">
                <label htmlFor="v-fullName">Nome completo *</label>
                <input
                  id="v-fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="v-cpf">CPF *</label>
                <input
                  id="v-cpf"
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="v-plate">Placa do veículo *</label>
                <input
                  id="v-plate"
                  type="text"
                  required
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="v-company">Empresa</label>
                <input
                  id="v-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="v-vehicleType">Tipo de veículo</label>
                <select
                  id="v-vehicleType"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="car">Carro</option>
                  <option value="motorcycle">Moto</option>
                  <option value="truck">Caminhão</option>
                  <option value="van">Van</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="v-manufacturer">Fabricante</label>
                <input
                  id="v-manufacturer"
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="v-model">Modelo</label>
                <input
                  id="v-model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="v-year">Ano</label>
                <input
                  id="v-year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>

              <div className="field wide">
                <label htmlFor="v-reason">Motivo da visita</label>
                <input
                  id="v-reason"
                  type="text"
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                />
              </div>

              <div className="field wide">
                <label htmlFor="v-notes">Observações</label>
                <textarea id="v-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="secondary" onClick={onClose} disabled={isProcessing}>
                Cancelar
              </button>
              <button type="submit" disabled={isProcessing}>
                <Plus size={18} />
                Registrar Entrada
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
