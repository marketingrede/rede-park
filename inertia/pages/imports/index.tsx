import type { InertiaProps } from '~/types'
import { Form } from '@adonisjs/inertia/react'
import { router } from '@inertiajs/react'
import { DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, useRef } from 'react'
import { formatDateTime } from '~/lib/format'

type ImportRecord = {
  id: number
  sourceType: string
  sourceFileName: string | null
  status: string
  detectedHeaderRow: number | null
  totalRows: number
  importedCount: number
  updatedCount: number
  skippedCount: number
  errorCount: number
  errorsJson: string | null
  createdAt: string
  finishedAt: string | null
}

type PageProps = InertiaProps<{
  imports: ImportRecord[]
}>

function statusClass(status: string) {
  if (status === 'failed') return 'danger'
  if (status === 'completed_with_errors') return 'warning'
  if (status === 'completed') return 'success'
  return ''
}

function statusLabel(status: string) {
  if (status === 'failed') return 'Falhou'
  if (status === 'completed_with_errors') return 'Com erros'
  if (status === 'completed') return 'Concluída'
  if (status === 'running') return 'Rodando'
  return status
}

function parseErrors(errorsJson: string | null) {
  if (!errorsJson) return []
  try {
    const parsed = JSON.parse(errorsJson) as unknown
    return Array.isArray(parsed) ? parsed.map((error) => String(error)) : []
  } catch {
    return ['Não foi possível ler os erros.']
  }
}

export default function ImportsIndex({ imports }: PageProps) {
  const seniorFileRef = useRef<HTMLInputElement>(null)
  const auxiliaryFileRef = useRef<HTMLInputElement>(null)
  const [seniorFileName, setSeniorFileName] = useState<string | null>(null)
  const [auxiliaryFileName, setAuxiliaryFileName] = useState<string | null>(null)
  const [activeImportForErrors, setActiveImportForErrors] = useState<ImportRecord | null>(null)
  const [isProcessingGlobal, setIsProcessingGlobal] = useState(false)

  useEffect(() => {
    const unbindStart = router.on('start', () => setIsProcessingGlobal(true))
    const unbindFinish = router.on('finish', () => setIsProcessingGlobal(false))

    return () => {
      unbindStart()
      unbindFinish()
    }
  }, [])

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

  const totalPages = Math.ceil(imports.length / itemsPerPage)

  const paginatedImports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return imports.slice(start, start + itemsPerPage)
  }, [imports, currentPage, itemsPerPage])

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

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const isAllSelected =
    paginatedImports.length > 0 && paginatedImports.every((r) => selectedIds.includes(r.id))

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !paginatedImports.map((r) => r.id).includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...paginatedImports.map((r) => r.id)])))
    }
  }

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSingleDelete = (id: number) => {
    if (
      confirm(
        'Tem certeza que deseja excluir esta importação? Todos os colaboradores e veículos importados por ela serão removidos permanentemente da base de dados.'
      )
    ) {
      router.post(
        '/importacoes/excluir-lote',
        { ids: [id] },
        {
          onSuccess: () => setSelectedIds((prev) => prev.filter((x) => x !== id)),
        }
      )
    }
  }

  const handleBulkDelete = () => {
    if (
      confirm(
        `Tem certeza que deseja excluir as ${selectedIds.length} importações selecionadas? Todos os colaboradores e veículos importados por elas serão removidos permanentemente da base de dados.`
      )
    ) {
      router.post(
        '/importacoes/excluir-lote',
        { ids: selectedIds },
        {
          onSuccess: () => setSelectedIds([]),
        }
      )
    }
  }

  useEffect(() => {
    setSelectedIds([])
  }, [currentPage])

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <h1>Importações Senior</h1>
          <p>Upload manual e histórico da sincronização.</p>
        </div>
      </header>

      <div className="grid-equal">
        <section className="panel">
          <div
            className="section-heading"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <h2>Cadastro Senior</h2>
              <p>Planilha principal de colaboradores (XLSX, CSV, JSON).</p>
            </div>
            <a
              href="/importacoes/modelos/senior"
              className="button secondary compact"
              style={{ fontSize: '11px', height: '32px', minHeight: 'auto', gap: '4px' }}
              title="Baixar planilha de exemplo para Cadastro Senior"
            >
              <DownloadSimple size={14} />
              Exemplo
            </a>
          </div>
          <Form action={{ url: '/importacoes', method: 'post' }}>
            {({ processing }) => (
              <div
                className="upload-area"
                style={{ cursor: 'pointer' }}
                onClick={() => seniorFileRef.current?.click()}
              >
                <div className="upload-icon" aria-hidden="true">
                  <UploadSimple size={32} />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {seniorFileName ? `📄 ${seniorFileName}` : 'Clique para selecionar o arquivo'}
                </p>
                <p className="small muted" style={{ marginTop: 4 }}>
                  {seniorFileName
                    ? 'Clique novamente para alterar'
                    : 'Arraste o arquivo ou clique aqui'}
                </p>
                <input
                  ref={seniorFileRef}
                  id="seniorFile"
                  type="file"
                  name="seniorFile"
                  accept=".xlsx,.xls,.csv,.json"
                  required
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setSeniorFileName(file ? file.name : null)
                  }}
                />
                <button
                  type="submit"
                  disabled={processing || !seniorFileName}
                  style={{ marginTop: 16 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <UploadSimple size={18} />
                  Importar Cadastro
                </button>
              </div>
            )}
          </Form>
        </section>

        <section className="panel">
          <div
            className="section-heading"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <h2>Planilha Auxiliar (Veículos/Contatos)</h2>
              <p>Placa, modelo, cor de carro e telefone (XLSX, CSV, JSON).</p>
            </div>
            <a
              href="/importacoes/modelos/auxiliary"
              className="button secondary compact"
              style={{ fontSize: '11px', height: '32px', minHeight: 'auto', gap: '4px' }}
              title="Baixar planilha de exemplo para Veículos/Contatos"
            >
              <DownloadSimple size={14} />
              Exemplo
            </a>
          </div>
          <Form action={{ url: '/importacoes/auxiliar', method: 'post' }}>
            {({ processing }) => (
              <div
                className="upload-area"
                style={{ cursor: 'pointer' }}
                onClick={() => auxiliaryFileRef.current?.click()}
              >
                <div className="upload-icon" aria-hidden="true">
                  <UploadSimple size={32} />
                </div>
                <p style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {auxiliaryFileName
                    ? `📄 ${auxiliaryFileName}`
                    : 'Clique para selecionar o arquivo'}
                </p>
                <p className="small muted" style={{ marginTop: 4 }}>
                  {auxiliaryFileName
                    ? 'Clique novamente para alterar'
                    : 'Arraste o arquivo ou clique aqui'}
                </p>
                <input
                  ref={auxiliaryFileRef}
                  id="auxiliaryFile"
                  type="file"
                  name="auxiliaryFile"
                  accept=".xlsx,.xls,.csv,.json"
                  required
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setAuxiliaryFileName(file ? file.name : null)
                  }}
                />
                <button
                  type="submit"
                  disabled={processing || !auxiliaryFileName}
                  style={{ marginTop: 16 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <UploadSimple size={18} />
                  Importar Veículos/Contatos
                </button>
              </div>
            )}
          </Form>
        </section>
      </div>

      <section className="panel mt-section">
        <div className="section-heading">
          <div>
            <h2>Histórico</h2>
            <p>Últimas 30 importações.</p>
          </div>
        </div>

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
              {selectedIds.length} importação(ões) selecionada(s)
            </span>
            <button type="button" className="danger compact" onClick={handleBulkDelete}>
              Apagar selecionadas
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
                    aria-label="Selecionar todas as importações desta página"
                  />
                </th>
                <th>Arquivo</th>
                <th>Status</th>
                <th>Linhas</th>
                <th>Novos</th>
                <th>Atualizados</th>
                <th>Erros</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {paginatedImports.map((record) => {
                const errors = parseErrors(record.errorsJson)
                return (
                  <tr key={record.id}>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(record.id)}
                        onChange={() => handleToggleSelect(record.id)}
                        aria-label={`Selecionar importação ${record.id}`}
                      />
                    </td>
                    <td>
                      <strong>{record.sourceFileName || `Importação ${record.id}`}</strong>
                      <div
                        className="small muted"
                        style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}
                      >
                        <span
                          className="status"
                          style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: record.sourceType.startsWith('auxiliary_')
                              ? 'var(--accent-soft)'
                              : 'var(--success-soft)',
                            color: record.sourceType.startsWith('auxiliary_')
                              ? 'var(--accent)'
                              : 'var(--success)',
                            borderColor: 'transparent',
                            fontWeight: 700,
                          }}
                        >
                          {record.sourceType.startsWith('auxiliary_')
                            ? 'Veículos/Contatos'
                            : 'Cadastro Senior'}
                        </span>
                        <span>{record.sourceType.replace('auxiliary_', '').toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatDateTime(record.createdAt)}</span>
                      </div>
                      {record.detectedHeaderRow && (
                        <div className="small muted" style={{ marginTop: 2 }}>
                          Cabeçalho: linha {record.detectedHeaderRow}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status ${statusClass(record.status)}`}>
                        {statusLabel(record.status)}
                      </span>
                    </td>
                    <td>
                      <div>{record.totalRows}</div>
                      <div className="small muted">Ignoradas: {record.skippedCount}</div>
                    </td>
                    <td>{record.importedCount}</td>
                    <td>{record.updatedCount}</td>
                    <td>
                      <strong>{record.errorCount}</strong>
                      {(record.errorCount > 0 || errors.length > 0) && (
                        <button
                          type="button"
                          className="secondary compact"
                          style={{
                            display: 'block',
                            marginTop: 4,
                            fontSize: '11px',
                            padding: '2px 6px',
                            minHeight: 'auto',
                          }}
                          onClick={() => setActiveImportForErrors(record)}
                        >
                          Ver Detalhes
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="danger compact"
                        onClick={() => handleSingleDelete(record.id)}
                        title="Excluir importação e dados associados"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {imports.length > 0 && (
          <div className="pagination-controls">
            <div className="pagination-size-selector">
              <label htmlFor="items-per-page-imports">Itens por página:</label>
              <select
                id="items-per-page-imports"
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

      {/* Diagnostics / Errors Details Modal */}
      {activeImportForErrors && (
        <div className="modal-backdrop" onClick={() => setActiveImportForErrors(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(640px, 100%)' }}
          >
            <div className="modal-header">
              <div>
                <h2>Detalhes da Importação</h2>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--muted)',
                  }}
                >
                  {activeImportForErrors.sourceFileName ||
                    `Importação #${activeImportForErrors.id}`}
                </p>
              </div>
              <button
                type="button"
                className="secondary compact"
                style={{ minHeight: 'auto', padding: '4px 8px' }}
                onClick={() => setActiveImportForErrors(null)}
              >
                Fechar
              </button>
            </div>
            <div className="modal-body" style={{ gap: '16px', padding: 'var(--spacing-xl)' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  background: 'var(--surface-soft)',
                  padding: '12px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Total Linhas
                  </span>
                  <strong
                    style={{
                      fontSize: '16px',
                      color: 'var(--text)',
                      display: 'block',
                      marginTop: '4px',
                    }}
                  >
                    {activeImportForErrors.totalRows}
                  </strong>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Novos
                  </span>
                  <strong
                    style={{
                      fontSize: '16px',
                      color: 'var(--success)',
                      display: 'block',
                      marginTop: '4px',
                    }}
                  >
                    {activeImportForErrors.importedCount}
                  </strong>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Atualizados
                  </span>
                  <strong
                    style={{
                      fontSize: '16px',
                      color: 'var(--accent)',
                      display: 'block',
                      marginTop: '4px',
                    }}
                  >
                    {activeImportForErrors.updatedCount}
                  </strong>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      fontWeight: 600,
                      display: 'block',
                    }}
                  >
                    Erros/Pulos
                  </span>
                  <strong
                    style={{
                      fontSize: '16px',
                      color: 'var(--danger)',
                      display: 'block',
                      marginTop: '4px',
                    }}
                  >
                    {activeImportForErrors.errorCount + activeImportForErrors.skippedCount}
                  </strong>
                </div>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                    color: 'var(--text)',
                  }}
                >
                  Log de Diagnóstico e Erros ({activeImportForErrors.errorCount})
                </h3>
                {activeImportForErrors.errorCount === 0 &&
                parseErrors(activeImportForErrors.errorsJson).length === 0 ? (
                  <p
                    style={{
                      color: 'var(--success)',
                      margin: 0,
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 500,
                    }}
                  >
                    Nenhum erro encontrado nesta importação.
                  </p>
                ) : (
                  <div
                    style={{
                      maxHeight: '260px',
                      overflowY: 'auto',
                      background: 'var(--danger-soft)',
                      border: '1px solid var(--danger)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '12px',
                    }}
                  >
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: '16px',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--danger)',
                        lineHeight: '1.6',
                      }}
                    >
                      {parseErrors(activeImportForErrors.errorsJson || '').map((err, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div
              className="modal-actions"
              style={{
                padding: '0 var(--spacing-xl) var(--spacing-xl) var(--spacing-xl)',
                borderTop: 'none',
              }}
            >
              <button
                type="button"
                className="secondary"
                onClick={() => setActiveImportForErrors(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Processing Backdrop Overlay */}
      {isProcessingGlobal && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <h2 className="loading-text">Processando Planilha</h2>
          <p className="loading-subtext">
            Isso pode levar alguns minutos para planilhas grandes. Por favor, aguarde.
          </p>
        </div>
      )}
    </>
  )
}
