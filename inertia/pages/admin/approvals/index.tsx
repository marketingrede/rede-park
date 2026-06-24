import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Check, X, User, Car, Camera, Eye } from '@phosphor-icons/react'
import { formatDate, formatPhone, formatPlate } from '~/lib/format'

type Employee = {
  id: number
  fullName: string
  birthDate: string | null
  cpf: string | null
  phone: string | null
  alternatePhone: string | null
  email: string | null
  photoData: string | null
  photoMime: string | null
  companyName: string | null
  roleName: string | null
}

type ApprovalRequest = {
  id: number
  employeeId: number | null
  cpf: string
  normalizedCpf: string
  fullName: string
  birthDate: string | null
  phone: string | null
  alternatePhone: string | null
  email: string | null
  photoData: string | null
  photoMime: string | null
  companyName: string | null
  roleName: string | null

  // Vehicle details
  vehiclePlate: string | null
  vehicleManufacturer: string | null
  vehicleModel: string | null
  vehicleColor: string | null
  vehicleYear: number | null
  vehicleType: string | null

  status: 'pending' | 'approved' | 'rejected'
  rejectionReason: string | null
  createdAt: string
  employee?: Employee
}

type PageProps = {
  approvals: ApprovalRequest[]
}

export default function ApprovalsIndex({ approvals }: PageProps) {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null)
  const [rejectingApproval, setRejectingApproval] = useState<ApprovalRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleApprove = (id: number) => {
    if (
      !confirm(
        'Deseja realmente aprovar esta solicitação? Os dados do colaborador serão atualizados imediatamente.'
      )
    ) {
      return
    }

    setProcessing(true)
    router.post(
      `/usuarios/aprovacoes/${id}/aprovar`,
      {},
      {
        onSuccess: () => {
          toast.success('Solicitação aprovada com sucesso!')
          setSelectedApproval(null)
        },
        onError: (errors: any) => {
          toast.error(errors.message || 'Erro ao aprovar solicitação.')
        },
        onFinish: () => setProcessing(false),
      }
    )
  }

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingApproval) return

    setProcessing(true)
    router.post(
      `/usuarios/aprovacoes/${rejectingApproval.id}/rejeitar`,
      { reason: rejectionReason },
      {
        onSuccess: () => {
          toast.success('Solicitação rejeitada com sucesso.')
          setRejectingApproval(null)
          setRejectionReason('')
          setSelectedApproval(null)
        },
        onError: (errors: any) => {
          toast.error(errors.message || 'Erro ao rejeitar solicitação.')
        },
        onFinish: () => setProcessing(false),
      }
    )
  }

  // Helper to highlight changes in a diff view
  const renderDiff = (
    current: string | null | undefined,
    updated: string | null | undefined,
    label: string
  ) => {
    const isDifferent =
      current !== updated && updated !== undefined && updated !== null && updated !== ''
    return (
      <div
        className="detail-line"
        style={{ borderLeft: isDifferent ? '3px solid var(--success)' : '1px solid var(--border)' }}
      >
        <div style={{ flex: 1 }}>
          <span className="small muted">{label}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {current && isDifferent && (
              <span
                className="small muted"
                style={{ textDecoration: 'line-through', color: 'var(--danger)' }}
              >
                {current}
              </span>
            )}
            <strong style={{ color: isDifferent ? 'var(--success)' : 'inherit' }}>
              {updated || 'Não informado'}
            </strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head title="Aprovações Pendentes | Rede Park" />

      <header className="topbar">
        <div className="page-title">
          <h1>Fila de Aprovações</h1>
          <p>Revise os dados enviados pelos colaboradores e aprove ou rejeite as alterações.</p>
        </div>
      </header>

      <section className="panel">
        {approvals.length === 0 ? (
          <div className="empty-state">
            <Check
              size={48}
              weight="duotone"
              style={{ color: 'var(--success)', marginBottom: '1rem' }}
            />
            <p>Nenhuma solicitação pendente no momento.</p>
            <span className="small muted">
              Todos os dados de colaboradores e veículos estão em dia.
            </span>
          </div>
        ) : (
          <div className="table-panel">
            <table>
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Tipo</th>
                  <th>Contato</th>
                  <th>Data de Envio</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr key={approval.id}>
                    <td>
                      <div className="person-main">
                        {approval.photoData ? (
                          <img
                            className="avatar"
                            src={`/media/employees/${approval.id}.png`}
                            alt=""
                          />
                        ) : (
                          <span className="photo-fallback" aria-hidden="true">
                            {approval.fullName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <strong>{approval.fullName}</strong>
                          <span className="small muted">
                            {approval.roleName || 'Cargo não informado'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status ${approval.employeeId ? 'warning' : 'success'}`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {approval.employeeId ? 'Atualização' : 'Novo Cadastro'}
                      </span>
                    </td>
                    <td>
                      <div>{formatPhone(approval.phone)}</div>
                      <div className="small muted">{approval.email || 'Sem email'}</div>
                      <div className="small muted">{approval.companyName || 'Sem empresa'}</div>
                    </td>
                    <td>
                      <div>{formatDate(approval.createdAt)}</div>
                      <div className="small muted">
                        {new Date(approval.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="secondary compact"
                          onClick={() => setSelectedApproval(approval)}
                        >
                          <Eye size={16} />
                          Revisar
                        </button>
                        <button
                          type="button"
                          className="compact"
                          disabled={processing}
                          onClick={() => handleApprove(approval.id)}
                        >
                          <Check size={16} />
                          Aprovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Review Modal */}
      {selectedApproval && (
        <div className="modal-backdrop" onClick={() => setSelectedApproval(null)}>
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            style={{ width: 'min(860px, 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="review-title">Revisar Solicitação</h2>
                <p>
                  {selectedApproval.employeeId
                    ? `Atualização de cadastro para o colaborador ID #${selectedApproval.employeeId}`
                    : 'Solicitação de novo cadastro de colaborador'}
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedApproval(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </header>

            <div className="modal-body stack" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                }}
              >
                {/* Profile photos comparison */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Camera size={18} />
                    Foto de Perfil
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      gap: '24px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--surface-soft)',
                    }}
                  >
                    {selectedApproval.employee?.photoData && (
                      <img
                        className="avatar"
                        src={`/media/employees/${selectedApproval.employee.id}.png`}
                        alt="Foto atual"
                        style={{
                          width: '96px',
                          height: '96px',
                          borderRadius: 'var(--radius-lg)',
                          objectFit: 'cover',
                          border: '1px solid var(--border)',
                        }}
                      />
                    )}
                    <div style={{ textAlign: 'center' }}>
                      <span
                        className="small muted"
                        style={{ display: 'block', marginBottom: '8px' }}
                      >
                        Proposta
                      </span>
                      {selectedApproval.photoData ? (
                        <img
                          className="avatar"
                          src={`/media/employees/${selectedApproval.id}.png`}
                          alt="Nova foto"
                          style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: 'var(--radius-lg)',
                            objectFit: 'cover',
                            border: '2px solid var(--success)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px dashed var(--border)',
                            display: 'grid',
                            placeItems: 'center',
                            color: 'var(--muted)',
                            background: 'var(--surface)',
                          }}
                        >
                          Sem Foto
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal & company data diffs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <User size={18} />
                    Informações Pessoais / Empresa
                  </h3>
                  <div className="stack" style={{ gap: '12px' }}>
                    {renderDiff(
                      selectedApproval.employee?.fullName,
                      selectedApproval.fullName,
                      'Nome Completo'
                    )}
                    {renderDiff(selectedApproval.employee?.cpf, selectedApproval.cpf, 'CPF')}
                    {renderDiff(
                      selectedApproval.employee?.birthDate
                        ? formatDate(selectedApproval.employee.birthDate)
                        : null,
                      selectedApproval.birthDate ? formatDate(selectedApproval.birthDate) : null,
                      'Data de Nascimento'
                    )}
                    {renderDiff(
                      selectedApproval.employee?.phone
                        ? formatPhone(selectedApproval.employee.phone)
                        : null,
                      selectedApproval.phone ? formatPhone(selectedApproval.phone) : null,
                      'Telefone'
                    )}
                    {renderDiff(
                      selectedApproval.employee?.alternatePhone
                        ? formatPhone(selectedApproval.employee.alternatePhone)
                        : null,
                      selectedApproval.alternatePhone
                        ? formatPhone(selectedApproval.alternatePhone)
                        : null,
                      'Telefone Alternativo'
                    )}
                    {renderDiff(selectedApproval.employee?.email, selectedApproval.email, 'E-mail')}
                    {renderDiff(
                      selectedApproval.employee?.companyName,
                      selectedApproval.companyName,
                      'Empresa'
                    )}
                    {renderDiff(
                      selectedApproval.employee?.roleName,
                      selectedApproval.roleName,
                      'Cargo'
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle details */}
              {selectedApproval.vehiclePlate && (
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '24px',
                    marginTop: '12px',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <Car size={18} />
                    Dados do Veículo Proposto
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div className="detail-line">
                      <div>
                        <span className="small muted">Placa</span>
                        <strong>{formatPlate(selectedApproval.vehiclePlate)}</strong>
                      </div>
                    </div>
                    <div className="detail-line">
                      <div>
                        <span className="small muted">Fabricante</span>
                        <strong>{selectedApproval.vehicleManufacturer || 'Não informado'}</strong>
                      </div>
                    </div>
                    <div className="detail-line">
                      <div>
                        <span className="small muted">Modelo</span>
                        <strong>{selectedApproval.vehicleModel || 'Não informado'}</strong>
                      </div>
                    </div>
                    <div className="detail-line">
                      <div>
                        <span className="small muted">Cor</span>
                        <strong>{selectedApproval.vehicleColor || 'Não informado'}</strong>
                      </div>
                    </div>
                    <div className="detail-line">
                      <div>
                        <span className="small muted">Ano</span>
                        <strong>{selectedApproval.vehicleYear || 'Não informado'}</strong>
                      </div>
                    </div>
                    <div className="detail-line">
                      <div>
                        <span className="small muted">Tipo</span>
                        <strong>
                          {selectedApproval.vehicleType === 'car' && 'Carro'}
                          {selectedApproval.vehicleType === 'motorcycle' && 'Moto'}
                          {selectedApproval.vehicleType === 'van' && 'Van'}
                          {selectedApproval.vehicleType === 'truck' && 'Caminhão'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div
                className="modal-actions"
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '20px',
                  marginTop: '16px',
                }}
              >
                <button
                  type="button"
                  className="danger"
                  style={{ marginRight: 'auto' }}
                  onClick={() => setRejectingApproval(selectedApproval)}
                >
                  <X size={16} />
                  Rejeitar Solicitação
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setSelectedApproval(null)}
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleApprove(selectedApproval.id)}
                >
                  <Check size={16} />
                  {processing ? 'Aprovando...' : 'Aprovar Alterações'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingApproval && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 50 }}
          onClick={() => setRejectingApproval(null)}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-title"
            style={{ width: 'min(480px, 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="reject-title" style={{ color: 'var(--danger)' }}>
                  Rejeitar Solicitação
                </h2>
                <p>
                  Explique o motivo pelo qual o cadastro de {rejectingApproval.fullName} está sendo
                  recusado.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setRejectingApproval(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleRejectSubmit}>
              <div className="modal-body">
                <div className="field">
                  <label htmlFor="reason">Motivo da Rejeição</label>
                  <textarea
                    id="reason"
                    rows={4}
                    placeholder="Ex: Foto de perfil embaçada. Por favor, envie uma nova foto nítida."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div
                className="modal-footer"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setRejectingApproval(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="danger" disabled={processing}>
                  Confirmar Rejeição
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}
