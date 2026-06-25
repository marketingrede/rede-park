# RedePark

Sistema interno para organizar estacionamento, colaboradores, veiculos e visitantes.

## Stack

- AdonisJS + React/Inertia
- SQLite
- Phosphor Icons
- Importacao Senior por XLSX, CSV ou JSON

## Decisao WhatsApp do MVP

O MVP nao usa WhatsApp API.

O operador abre uma mensagem pronta por link oficial `wa.me`, com telefone e texto preenchidos. O sistema registra a tentativa de contato antes de redirecionar para o WhatsApp.

Conversa embutida dentro do painel fica fora do MVP, porque WhatsApp Web nao e uma superficie estavel para `iframe`.

## Comandos

```bash
npm install
node ace migration:run
npm run dev
```

Por padrao, o ambiente local executa em:

```bash
http://localhost:5175
```

## Deploy na Vercel

O deploy usa uma Function em `api/index.js`, que carrega o build do Adonis em `build/bin/vercel.js`.

Variaveis obrigatorias na Vercel:

- `NODE_ENV=production`
- `APP_KEY`
- `DB_CONNECTION=libsql`
- `LIBSQL_URL`
- `LIBSQL_AUTH_TOKEN`

Variaveis recomendadas:

- `APP_URL=https://seu-dominio`
- `SESSION_DRIVER=cookie`

Em preview da Vercel, `APP_URL` usa `VERCEL_URL` automaticamente se `APP_URL` nao estiver definida.

O projeto fixa `node` em `24.x`, que e o runtime esperado para esta versao do Adonis.

Importar arquivos exportados do Senior:

```bash
node ace senior:sync
```

Importar um arquivo especifico sem mover o original:

```bash
node ace senior:sync --path "M:\05. GRUPO RTC\5. Marketing Interno\Colaboradores - Rede 05 2026.xlsx" --keep-files
```

## Fluxo inicial

1. Abra `/signup` para criar o primeiro admin.
2. Depois disso, novos usuarios devem ser criados em `/usuarios`.
3. Operadores acessam `/operacao` e `/visitantes`.
4. Admins acessam dashboard, colaboradores, veiculos, importacoes e usuarios.

## Validacoes executadas

- `npm run lint`
- `npm run typecheck`
- `npm run test -- --suite=unit`
- `npm run build`
- Importacao real da planilha `Colaboradores - Rede 05 2026.xlsx`: 1.643 linhas processadas, 0 erros.

## Observacao de seguranca

`npm audit` aponta 1 vulnerabilidade baixa em `esbuild`, ligada ao servidor de desenvolvimento. Nao ha vulnerabilidades moderadas, altas ou criticas depois da troca do parser XLSX para `read-excel-file`.
