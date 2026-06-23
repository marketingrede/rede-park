import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { toast } from 'sonner'
import type { InertiaProps } from '~/types'
import {
  User,
  Phone,
  Envelope,
  Building,
  Briefcase,
  IdentificationCard,
  Camera,
  CheckCircle,
  CalendarBlank,
} from '@phosphor-icons/react'

type PageProps = InertiaProps<{
  csrfToken: string
}>

type LookupResponse = {
  found?: boolean
  message?: string
  employee?: {
    id: number
    fullName: string
    companyName: string | null
    roleName: string | null
    email: string | null
    phone: string | null
  }
}

type SubmitResponse = {
  success?: boolean
  message?: string
}

async function readApiResponse<T extends { message?: string }>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text) {
    return {} as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    const message = text
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    return { message: message || 'Resposta inesperada do servidor.' } as T
  }
}

export default function CollaboratorRegister({ csrfToken }: PageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Lookup, 2: Registration details, 3: Success
  const [lookupName, setLookupName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [isNewEmployee, setIsNewEmployee] = useState(false)
  const [employeeId, setEmployeeId] = useState<number | null>(null)

  // Registration form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [alternatePhone, setAlternatePhone] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [roleName, setRoleName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Vehicle form state
  const [hasVehicle, setHasVehicle] = useState(false)
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleManufacturer, setVehicleManufacturer] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleColor, setVehicleColor] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleType, setVehicleType] = useState('car')

  const [loading, setLoading] = useState(false)

  // Mask Phone input ((00) 00000-0000)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'alt') => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
      if (field === 'phone') setPhone(value)
      else setAlternatePhone(value)
    }
  }

  // Mask Vehicle Plate (AAA-0000 or AAA0A00)
  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 8)
    setVehiclePlate(value)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupName.trim()) {
      toast.error('Preencha seu nome completo.')
      return
    }
    if (!birthDate) {
      toast.error('Preencha a data de nascimento.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/public/employees/lookup', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify({ fullName: lookupName, birthDate, _csrf: csrfToken }),
      })

      const data = await readApiResponse<LookupResponse>(response)

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao consultar cadastro.')
      }

      if (data.found && data.employee) {
        setEmployeeId(data.employee.id)
        setFullName(data.employee.fullName) // Masked name
        setCompanyName(data.employee.companyName || '')
        setRoleName(data.employee.roleName || '')
        setEmail(data.employee.email || '')
        setPhone(data.employee.phone || '')
        setIsNewEmployee(false)
        toast.success('Cadastro localizado! Preencha as informações complementares.')
      } else {
        setEmployeeId(null)
        setFullName('')
        setCompanyName('')
        setRoleName('')
        setEmail('')
        setPhone('')
        setIsNewEmployee(true)
        toast.info(
          'Cadastro não localizado. Preencha todos os campos para solicitar um novo cadastro.'
        )
      }
      setStep(2)
    } catch (err: any) {
      toast.error(err.message || 'Erro ao validar cadastro.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName) {
      toast.error('O nome completo é obrigatório.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('_csrf', csrfToken)
      formData.append('employeeId', employeeId ? String(employeeId) : '')
      formData.append('birthDate', birthDate)
      formData.append('fullName', fullName)
      formData.append('phone', phone)
      formData.append('alternatePhone', alternatePhone)
      formData.append('email', email)
      formData.append('companyName', companyName)
      formData.append('roleName', roleName)

      if (photo) {
        formData.append('photo', photo)
      }

      if (hasVehicle && vehiclePlate) {
        formData.append('vehiclePlate', vehiclePlate)
        formData.append('vehicleManufacturer', vehicleManufacturer)
        formData.append('vehicleModel', vehicleModel)
        formData.append('vehicleColor', vehicleColor)
        formData.append('vehicleYear', vehicleYear)
        formData.append('vehicleType', vehicleType)
      }

      const response = await fetch('/api/public/employees/submit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        credentials: 'same-origin',
        body: formData,
      })

      const data = await readApiResponse<SubmitResponse>(response)

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar cadastro.')
      }

      setStep(3)
      toast.success('Solicitação enviada com sucesso!')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar formulário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head title="Cadastro de Colaborador | Rede Park" />
      <main className="auth-page">
        <section
          className="auth-card"
          style={{ width: step === 2 ? 'min(640px, 100%)' : 'min(440px, 100%)' }}
        >
          <div className="auth-brand">
            <span className="brand-mark" aria-hidden="true">
              <img
                src="/logo-rede-trilha.svg"
                alt=""
                style={{ width: 32, height: 32, objectFit: 'contain' }}
              />
            </span>
            <span>Rede Park</span>
          </div>

          {step === 1 && (
            <>
              <h1>Validação de Colaborador</h1>
              <p>
                Insira seu nome completo e data de nascimento para iniciar seu cadastro ou atualizar
                seus dados.
              </p>

              <form onSubmit={handleVerify}>
                <div className="field">
                  <label htmlFor="lookupName">Nome Completo</label>
                  <input
                    type="text"
                    id="lookupName"
                    placeholder="Seu nome completo"
                    value={lookupName}
                    onChange={(e) => setLookupName(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label htmlFor="birthDate">Data de Nascimento</label>
                  <input
                    type="date"
                    id="birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', marginTop: '1.5rem' }}
                >
                  <IdentificationCard size={18} />
                  {loading ? 'Verificando...' : 'Verificar Cadastro'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1>Dados Cadastrais</h1>
              <p>
                {isNewEmployee
                  ? 'Preencha o formulário para solicitar seu cadastro de colaborador.'
                  : 'Atualize seus dados de contato e foto de perfil nos campos abaixo.'}
              </p>

              <form onSubmit={handleSubmit} className="stack">
                <div
                  className="form-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {/* Personal details */}
                  <div className="field">
                    <label htmlFor="fullName">Nome Completo</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isNewEmployee}
                        required
                        placeholder="Seu nome completo"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <User
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="birthDateStep2">Data de Nascimento</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="date"
                        id="birthDateStep2"
                        value={birthDate}
                        disabled={!isNewEmployee}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <CalendarBlank
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="email">E-mail</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Envelope
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Telefone Principal</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="phone"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e, 'phone')}
                        placeholder="(00) 00000-0000"
                        required
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Phone
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="alternatePhone">Telefone Alternativo</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="alternatePhone"
                        value={alternatePhone}
                        onChange={(e) => handlePhoneChange(e, 'alt')}
                        placeholder="(00) 00000-0000"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Phone
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="companyName">Empresa</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        disabled={!isNewEmployee}
                        required
                        placeholder="Nome da empresa"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Building
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="roleName">Cargo</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        id="roleName"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        disabled={!isNewEmployee}
                        placeholder="Seu cargo na empresa"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                      <Briefcase
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--muted)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Photo upload with preview */}
                <div className="field" style={{ marginTop: '1rem' }}>
                  <label>Foto de Perfil</label>
                  <div className="photo-upload-field">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Previsão" className="photo-upload-preview" />
                    ) : (
                      <div className="photo-upload-placeholder">
                        <Camera size={24} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        id="photoFile"
                      />
                      <span className="small muted">
                        Selecione uma foto sua nítida (JPG ou PNG, máx. 4MB)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vehicle option */}
                <div
                  style={{
                    margin: '1.5rem 0 0.5rem 0',
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--surface-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="vehicleCheckbox"
                      checked={hasVehicle}
                      onChange={(e) => setHasVehicle(e.target.checked)}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <label
                      htmlFor="vehicleCheckbox"
                      style={{ fontWeight: 600, cursor: 'pointer', margin: 0 }}
                    >
                      Possuo veículo de acesso ao estacionamento
                    </label>
                  </div>

                  {hasVehicle && (
                    <div
                      className="stack"
                      style={{
                        marginTop: '1rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '1rem',
                      }}
                    >
                      <div className="field">
                        <label htmlFor="vehiclePlate">Placa do Veículo</label>
                        <input
                          type="text"
                          id="vehiclePlate"
                          placeholder="ABC1D23 ou ABC1234"
                          value={vehiclePlate}
                          onChange={handlePlateChange}
                          required
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="vehicleManufacturer">Marca/Fabricante</label>
                        <input
                          type="text"
                          id="vehicleManufacturer"
                          placeholder="Ex: Chevrolet"
                          value={vehicleManufacturer}
                          onChange={(e) => setVehicleManufacturer(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="vehicleModel">Modelo</label>
                        <input
                          type="text"
                          id="vehicleModel"
                          placeholder="Ex: Onix"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="vehicleColor">Cor</label>
                        <input
                          type="text"
                          id="vehicleColor"
                          placeholder="Ex: Preto"
                          value={vehicleColor}
                          onChange={(e) => setVehicleColor(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="vehicleYear">Ano</label>
                        <input
                          type="number"
                          id="vehicleYear"
                          placeholder="Ex: 2022"
                          value={vehicleYear}
                          onChange={(e) => setVehicleYear(e.target.value)}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor="vehicleType">Tipo de Veículo</label>
                        <select
                          id="vehicleType"
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                        >
                          <option value="car">Carro</option>
                          <option value="motorcycle">Moto</option>
                          <option value="van">Van/Furgão</option>
                          <option value="truck">Caminhão</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <p
                  className="small muted"
                  style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}
                >
                  Ao enviar este cadastro, você declara estar ciente e concordar com a nossa{' '}
                  <Link
                    href="/politica-privacidade"
                    style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                  >
                    Política de Uso, Segurança e Armazenamento dos Dados do Colaborador
                  </Link>
                  .
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setStep(1)}
                    style={{ flex: 1 }}
                  >
                    Voltar
                  </button>
                  <button type="submit" disabled={loading} style={{ flex: 2 }}>
                    {loading ? 'Enviando...' : 'Enviar para Aprovação'}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle
                size={64}
                color="var(--success)"
                weight="duotone"
                style={{ margin: '0 auto 1.5rem auto' }}
              />
              <h1>Solicitação Enviada!</h1>
              <p style={{ margin: '1rem 0 2rem 0' }}>
                Seu cadastro foi enviado com sucesso para a fila de análise. O administrador do
                sistema revisará os dados e, assim que aprovados, você terá acesso liberado ao
                estacionamento.
              </p>
              <button
                onClick={() => {
                  setStep(1)
                  setLookupName('')
                  setBirthDate('')
                }}
                style={{ width: '100%' }}
              >
                Entendi
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
