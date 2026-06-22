import type { InertiaProps } from '~/types'
import { Car, IdentificationBadge, UploadSimple, Users } from '@phosphor-icons/react'
import { formatDateTime } from '~/lib/format'

type ImportRecord = {
  id: number
  sourceFileName: string | null
  status: string
  importedCount: number
  updatedCount: number
  errorCount: number
  createdAt: string
}

type ContactAttempt = {
  id: number
  targetPhone: string
  status: string
  createdAt: string
}

type PageProps = InertiaProps<{
  metrics: {
    employees: number
    vehicles: number
    activeVisitors: number
    imports: number
  }
  recentImports: ImportRecord[]
  recentContacts: ContactAttempt[]
}>

const metricDefinitions = [
  { key: 'employees', label: 'Colaboradores', icon: Users },
  { key: 'vehicles', label: 'Veículos', icon: Car },
  { key: 'activeVisitors', label: 'Visitantes agora', icon: IdentificationBadge },
  { key: 'imports', label: 'Importações', icon: UploadSimple },
] as const

function importStatusLabel(status: string) {
  if (status === 'completed') return 'Concluída'
  if (status === 'completed_with_errors') return 'Com erros'
  if (status === 'failed') return 'Falhou'
  return status
}

export default function Dashboard({
  metrics: metricValues,
  recentImports,
  recentContacts,
}: PageProps) {
  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Visão rápida para administração do estacionamento.</p>
        </div>
      </header>

      <section className="metrics-grid" aria-label="Indicadores">
        {metricDefinitions.map((metric) => {
          const Icon = metric.icon
          return (
            <article className="metric-card" key={metric.key}>
              <span className="metric-icon" aria-hidden="true">
                <Icon size={20} weight="duotone" />
              </span>
              <div className="metric-info">
                <span>{metric.label}</span>
                <strong>{metricValues[metric.key]}</strong>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid-two">
        <div className="panel">
          <div className="section-heading">
            <div>
              <h2>Importações recentes</h2>
              <p>Arquivos lidos do Senior.</p>
            </div>
          </div>
          {recentImports.length === 0 ? (
            <div className="empty-state">Nenhuma importação registrada.</div>
          ) : (
            <div className="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Arquivo</th>
                    <th>Status</th>
                    <th>Novos</th>
                    <th>Atualizados</th>
                    <th>Erros</th>
                  </tr>
                </thead>
                <tbody>
                  {recentImports.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <strong>{record.sourceFileName || `Importação ${record.id}`}</strong>
                        <div className="small muted">{formatDateTime(record.createdAt)}</div>
                      </td>
                      <td>
                        <span className={`status ${record.errorCount > 0 ? 'warning' : 'success'}`}>
                          {importStatusLabel(record.status)}
                        </span>
                      </td>
                      <td>{record.importedCount}</td>
                      <td>{record.updatedCount}</td>
                      <td>{record.errorCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-heading">
            <div>
              <h2>Contatos WhatsApp</h2>
              <p>Tentativas abertas pelo painel.</p>
            </div>
          </div>
          {recentContacts.length === 0 ? (
            <div className="empty-state">Nenhum contato registrado.</div>
          ) : (
            <div className="stack">
              {recentContacts.map((contact) => (
                <div className="person-card" key={contact.id}>
                  <strong>{contact.targetPhone}</strong>
                  <span className="small muted">{formatDateTime(contact.createdAt)}</span>
                  <span className="status success">Aberto</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
