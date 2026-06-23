import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, ShieldCheck, ListBullets, Database, Clock, Key } from '@phosphor-icons/react'

export default function PrivacyPolicy() {
  return (
    <>
      <Head title="Política de Privacidade e Uso de Dados | Rede Park" />
      <main className="auth-page">
        <section className="auth-card" style={{ width: 'min(640px, 100%)', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="auth-brand">
            <span className="brand-mark" aria-hidden="true">
              <img src="/logo-rede-trilha.svg" alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            </span>
            <span>Rede Park</span>
          </div>

          <h1 id="policy-title">Política de Privacidade e Uso de Dados</h1>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            Entenda como a Rede Park coleta, utiliza, armazena e protege os seus dados cadastrais em total conformidade com a LGPD.
          </p>

          <div className="stack" style={{ gap: '1.5rem', textAlign: 'left', fontSize: '0.95rem', lineHeight: '1.6' }} role="document" aria-describedby="policy-title">
            <article>
              <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--text)' }}>
                <ListBullets size={20} color="var(--primary)" weight="duotone" aria-hidden="true" />
                1. Quais dados coletamos?
              </h2>
              <p>
                Coletamos suas informações cadastrais essenciais (Nome completo, CPF, Data de Nascimento, E-mail e Telefone Principal/Alternativo), uma Foto de Perfil (tipo selfie nítida para identificação visual) e, opcionalmente, os dados do seu veículo (Placa, Marca, Modelo, Cor, Ano e Tipo) caso necessite de acesso ao estacionamento.
              </p>
            </article>

            <article>
              <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--text)' }}>
                <ShieldCheck size={20} color="var(--primary)" weight="duotone" aria-hidden="true" />
                2. Para que coletamos? (Finalidade)
              </h2>
              <p>
                A coleta desses dados possui finalidades operacionais e de segurança legítimas:
              </p>
              <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li><strong>Identificação e Acesso:</strong> Permitir que a administração valide que você é um colaborador ativo e autorize seu acesso físico e o de seu veículo ao estacionamento da Rede Park.</li>
                <li><strong>Comunicação e Alertas:</strong> Possibilitar que a equipe da portaria entre em contato rápido via telefone ou WhatsApp caso ocorra algum imprevisto com seu veículo (como faróis acesos, portas abertas, obstrução de vagas ou sinistros).</li>
                <li><strong>Segurança Coletiva:</strong> Garantir a integridade física de todos os colaboradores, prestadores de serviço e visitantes, bem como proteger os patrimônios individuais e da empresa.</li>
              </ul>
            </article>

            <article>
              <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--text)' }}>
                <Database size={20} color="var(--primary)" weight="duotone" aria-hidden="true" />
                3. Como armazenamos e protegemos?
              </h2>
              <p>
                Seus dados são armazenados em banco de dados seguro, com senhas criptografadas. As fotos de perfil enviadas são guardadas em servidores de arquivo protegidos (fora da pasta pública geral) e apenas pessoas autorizadas (administradores logados e operadores) têm permissão para visualizá-las.
              </p>
            </article>

            <article>
              <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--text)' }}>
                <Clock size={20} color="var(--primary)" weight="duotone" aria-hidden="true" />
                4. Tempo de Retenção
              </h2>
              <p>
                As informações são mantidas ativas apenas enquanto perdurar o vínculo profissional ou houver necessidade operacional legítima. 
                Caso sua solicitação de autocadastro seja <strong>rejeitada</strong> pela administração, todos os seus dados e fotos temporários serão <strong>excluídos imediatamente e permanentemente</strong> de nossos servidores.
              </p>
            </article>

            <article>
              <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', color: 'var(--text)' }}>
                <Key size={20} color="var(--primary)" weight="duotone" aria-hidden="true" />
                5. Seus Direitos (LGPD)
              </h2>
              <p>
                Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você possui o direito de confirmar a existência de tratamento, acessar seus dados coletados, solicitar correções de informações inexatas ou incompletas, bem como requerer a exclusão ou portabilidade dos dados, entrando em contato direto com a administração da Rede Park.
              </p>
            </article>
          </div>

          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <Link href="/cadastro-colaborador" className="button secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
              <ArrowLeft size={16} />
              Voltar ao Cadastro
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
