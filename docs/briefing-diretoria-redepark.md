# Briefing para Diretoria - RedePark

Data: 24/06/2026

## Resumo executivo

O RedePark é um sistema interno para organizar a rotina da portaria e da recepção.

Ele centraliza informações de colaboradores, veículos e visitantes em uma única tela de operação. A equipe passa a consultar placas, nomes, contatos, veículos vinculados e visitantes presentes no pátio com mais rapidez e menos dependência de planilhas, mensagens soltas ou memória operacional.

O projeto também cria uma base preparada para novos módulos, como controle de encomendas dos Correios, entregas de transportadoras, notificações, relatórios e integrações futuras.

## Problema que o projeto resolve

Hoje, a portaria e a recepção tendem a lidar com informações espalhadas:

- planilhas de colaboradores;
- contatos desatualizados;
- veículos sem vínculo claro com o responsável;
- visitantes registrados de forma manual;
- dificuldade para saber quem está no pátio em tempo real;
- pouca rastreabilidade sobre contatos e atendimentos.

Isso gera perda de tempo, retrabalho e risco de erro em uma área crítica para segurança, atendimento e fluxo de pessoas.

## Solução proposta

Implementar o RedePark como painel central da portaria e recepção.

Na prática, a equipe passa a ter uma ferramenta única para:

- buscar colaborador por nome, cargo, empresa, centro de custo ou placa;
- consultar veículos vinculados aos colaboradores;
- registrar entrada e saída de visitantes;
- manter histórico de visitantes;
- abrir contato por WhatsApp com mensagem pronta;
- importar dados vindos do Senior;
- manter usuários e permissões por perfil;
- acompanhar indicadores básicos em dashboard.

## Funcionalidades atuais do projeto

### 1. Operação da portaria

Tela principal para o uso diário da portaria.

Permite:

- busca rápida por nome, placa, cargo, empresa ou veículo;
- visualização de colaboradores ativos;
- consulta de veículos vinculados;
- acesso a detalhes do colaborador;
- envio de mensagem via WhatsApp com texto preenchido;
- visualização de visitantes que estão no pátio.

Benefício direto:

- reduz o tempo de consulta;
- evita ligações e perguntas repetidas;
- melhora a agilidade no atendimento de entrada e saída.

### 2. Gestão de visitantes

Permite registrar visitantes, veículos e horários de entrada e saída.

Permite:

- cadastro de visitante com nome, CPF, empresa, motivo da visita e veículo;
- controle de quem ainda está dentro;
- registro de saída;
- busca por nome, CPF ou placa;
- reaproveitamento de dados de visitantes anteriores.

Benefício direto:

- aumenta o controle de acesso;
- cria histórico consultável;
- reduz registros manuais e informações incompletas.

### 3. Cadastro de colaboradores

Mantém uma base de colaboradores com dados importantes para recepção e portaria.

Permite:

- cadastro e edição de colaboradores;
- foto do colaborador;
- telefone, e-mail e telefone alternativo;
- empresa, cargo e centro de custo;
- status ativo/inativo;
- busca por nome, cargo, telefone, empresa e centro de custo.

Benefício direto:

- facilita identificação;
- melhora comunicação;
- reduz dependência de listas antigas.

### 4. Cadastro de veículos

Vincula veículos aos colaboradores.

Permite:

- cadastro de placa, marca, modelo, cor, ano e tipo de veículo;
- vínculo com colaborador;
- foto do veículo;
- status ativo/inativo;
- busca por placa, modelo, fabricante, ano ou colaborador.

Benefício direto:

- melhora o controle de entrada;
- facilita identificação de veículos no estacionamento;
- reduz dúvidas sobre proprietário ou responsável.

### 5. Importação de dados do Senior

O sistema importa dados de colaboradores a partir de arquivos XLSX, CSV ou JSON.

Também aceita planilha auxiliar de veículos e contatos.

Permite:

- importar cadastro vindo do Senior;
- importar veículos e contatos;
- baixar modelos de planilha;
- acompanhar histórico de importações;
- ver quantidade de registros importados, atualizados, ignorados e com erro.

Benefício direto:

- evita digitação manual em massa;
- acelera implantação;
- mantém a base mais próxima dos dados oficiais da empresa.

### 6. Cadastro público do colaborador

Existe uma tela pública para o próprio colaborador complementar dados.

Permite:

- validar cadastro por nome e data de nascimento;
- enviar telefone, e-mail, foto e dados do veículo;
- criar solicitação para aprovação administrativa.

Benefício direto:

- distribui o esforço de atualização cadastral;
- reduz carga da recepção;
- melhora qualidade dos dados recebidos.

### 7. Fila de aprovações

Administradores podem revisar solicitações enviadas pelos colaboradores.

Permite:

- aprovar atualização de cadastro;
- aprovar novo cadastro;
- vincular ou atualizar veículo;
- rejeitar solicitação com motivo;
- manter rastreabilidade da decisão.

Benefício direto:

- evita atualização automática sem conferência;
- mantém controle administrativo;
- reduz risco de dados incorretos na operação.

### 8. Usuários, perfis e auditoria

O sistema separa usuários comuns e administradores.

Permite:

- criação e edição de usuários;
- controle de perfil;
- status ativo/inativo;
- registro de ações relevantes em auditoria.

Benefício direto:

- aumenta segurança;
- separa rotina operacional de gestão;
- permite acompanhar quem realizou ações importantes.

## Benefícios para a diretoria

### Mais segurança operacional

A portaria trabalha com base atualizada, pesquisável e com histórico.

Isso reduz decisões baseadas em memória, papel ou mensagens antigas.

### Mais velocidade no atendimento

A busca por colaborador, placa ou visitante fica centralizada.

A equipe encontra a informação em poucos segundos.

### Menos retrabalho

A importação do Senior e o formulário público reduzem digitação manual.

Os dados podem ser atualizados com mais frequência e menos esforço.

### Melhor experiência para colaboradores e visitantes

O atendimento fica mais organizado, com menos espera e menos perguntas repetidas.

### Melhor gestão

O dashboard e os históricos dão visão sobre:

- quantidade de colaboradores;
- quantidade de veículos;
- visitantes ativos;
- importações realizadas;
- contatos por WhatsApp.

### Base preparada para expansão

O projeto já nasce com estrutura de usuários, cadastros, histórico, importação, auditoria e telas administrativas.

Isso facilita a criação de novos módulos sem começar do zero.

## Proposta de implantação

### Fase 1 - Implantação controlada

Objetivo: colocar a portaria e recepção usando o sistema na rotina real.

Ações:

- validar base inicial de colaboradores;
- importar dados do Senior;
- importar veículos e contatos;
- criar usuários da recepção, portaria e administração;
- treinar equipe em fluxo de busca, visitante e WhatsApp;
- rodar piloto com acompanhamento próximo.

Resultado esperado:

- operação diária usando uma tela central;
- redução de consulta manual;
- início do histórico digital.

### Fase 2 - Ajuste fino

Objetivo: melhorar o sistema com base no uso real.

Ações:

- ajustar campos necessários para a portaria;
- revisar permissões;
- melhorar relatórios;
- revisar dados incompletos;
- padronizar processo de atualização cadastral.

Resultado esperado:

- sistema mais aderente à rotina interna;
- menor dependência de correções manuais.

### Fase 3 - Expansão de módulos

Objetivo: usar a mesma base para resolver novos fluxos da recepção.

Possíveis módulos:

- encomendas dos Correios;
- entregas de transportadoras;
- protocolo de retirada;
- aviso ao colaborador por WhatsApp;
- histórico de recebimento e entrega;
- painel de pendências;
- relatórios por período.

Resultado esperado:

- recepção mais organizada;
- menor risco de extravio;
- histórico claro de recebimento e retirada.

## Módulos futuros sugeridos

### Controle de encomendas e Correios

Permite registrar encomendas recebidas na recepção.

Campos possíveis:

- destinatário;
- empresa/setor;
- transportadora ou Correios;
- código de rastreio;
- data e hora de recebimento;
- foto da etiqueta;
- responsável pelo recebimento;
- status: recebido, aguardando retirada, entregue, devolvido;
- pessoa que retirou;
- assinatura ou confirmação de retirada.

Benefícios:

- reduz extravio;
- cria prova de recebimento;
- facilita localização de encomendas;
- permite avisar o colaborador rapidamente.

### Pré-cadastro de visitantes

Permite que áreas internas cadastrem visitas antes da chegada.

Benefícios:

- entrada mais rápida;
- menos filas;
- melhor previsibilidade para a portaria.

### Relatórios gerenciais

Relatórios por dia, semana ou mês.

Exemplos:

- visitantes por período;
- horários de maior movimento;
- veículos cadastrados;
- encomendas pendentes;
- importações realizadas;
- atendimentos por operador.

Benefícios:

- melhora tomada de decisão;
- ajuda a dimensionar equipe e processos.

### Integração com controle de acesso

Possibilidade futura de integração com catracas, cancelas, QR Code ou sistemas de terceiros.

Benefícios:

- reduz etapas manuais;
- aproxima cadastro, autorização e acesso físico.

### Notificações automatizadas

Possibilidade de evoluir o contato por WhatsApp para notificações mais automáticas.

Exemplos:

- aviso de visitante aguardando;
- aviso de encomenda recebida;
- lembrete de retirada;
- confirmação de saída ou entrega.

Benefícios:

- melhora comunicação;
- reduz ligações;
- aumenta rastreabilidade.

## Mensagem central para a apresentação

O RedePark transforma a portaria e a recepção em uma operação mais rápida, segura e organizada.

O projeto começa resolvendo o controle de colaboradores, veículos e visitantes. Depois, pode crescer para módulos de encomendas, entregas, notificações e relatórios, usando a mesma base operacional.

## Roteiro sugerido de slides

### Slide 1 - Nome do projeto

RedePark

Sistema de apoio à portaria, recepção e controle de acesso.

### Slide 2 - Problema atual

Informações espalhadas, consultas manuais, dados desatualizados e pouco histórico.

### Slide 3 - Solução

Uma tela central para consultar colaboradores, veículos, visitantes e contatos.

### Slide 4 - Funcionalidades principais

- operação da portaria;
- visitantes;
- colaboradores;
- veículos;
- importação do Senior;
- WhatsApp;
- aprovações;
- usuários e auditoria.

### Slide 5 - Benefícios imediatos

- mais segurança;
- atendimento mais rápido;
- menos retrabalho;
- melhor controle;
- histórico consultável.

### Slide 6 - Benefícios para gestão

- indicadores;
- rastreabilidade;
- padronização;
- base única de dados.

### Slide 7 - Implantação sugerida

Piloto controlado, ajuste fino e expansão por módulos.

### Slide 8 - Expansões futuras

- encomendas dos Correios;
- entregas de transportadoras;
- pré-cadastro de visitantes;
- relatórios;
- notificações;
- integração com controle de acesso.

### Slide 9 - Decisão solicitada

Aprovar o piloto do RedePark na portaria e recepção.

Definir responsáveis, prazo de implantação e critérios de sucesso.

## Critérios de sucesso sugeridos

Após o piloto, avaliar:

- tempo médio para localizar colaborador ou placa;
- número de visitantes registrados digitalmente;
- quantidade de contatos feitos via sistema;
- percentual de colaboradores com dados completos;
- quantidade de veículos vinculados corretamente;
- redução de planilhas paralelas;
- feedback da portaria e recepção.

## Fechamento

O RedePark não é apenas um cadastro.

Ele é uma base operacional para melhorar segurança, atendimento, rastreabilidade e gestão da recepção.

Começa com portaria, colaboradores, veículos e visitantes.

Depois pode evoluir para encomendas, entregas, notificações e integrações.
