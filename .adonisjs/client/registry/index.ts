/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'public.collaborator_register': {
    methods: ["GET","HEAD"],
    pattern: '/cadastro-colaborador',
    tokens: [{"old":"/cadastro-colaborador","type":0,"val":"cadastro-colaborador","end":""}],
    types: placeholder as Registry['public.collaborator_register']['types'],
  },
  'public_collaborators.lookup': {
    methods: ["POST"],
    pattern: '/api/public/employees/lookup',
    tokens: [{"old":"/api/public/employees/lookup","type":0,"val":"api","end":""},{"old":"/api/public/employees/lookup","type":0,"val":"public","end":""},{"old":"/api/public/employees/lookup","type":0,"val":"employees","end":""},{"old":"/api/public/employees/lookup","type":0,"val":"lookup","end":""}],
    types: placeholder as Registry['public_collaborators.lookup']['types'],
  },
  'public_collaborators.submit': {
    methods: ["POST"],
    pattern: '/api/public/employees/submit',
    tokens: [{"old":"/api/public/employees/submit","type":0,"val":"api","end":""},{"old":"/api/public/employees/submit","type":0,"val":"public","end":""},{"old":"/api/public/employees/submit","type":0,"val":"employees","end":""},{"old":"/api/public/employees/submit","type":0,"val":"submit","end":""}],
    types: placeholder as Registry['public_collaborators.submit']['types'],
  },
  'public.privacy_policy': {
    methods: ["GET","HEAD"],
    pattern: '/politica-privacidade',
    tokens: [{"old":"/politica-privacidade","type":0,"val":"politica-privacidade","end":""}],
    types: placeholder as Registry['public.privacy_policy']['types'],
  },
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'operations.index': {
    methods: ["GET","HEAD"],
    pattern: '/operacao',
    tokens: [{"old":"/operacao","type":0,"val":"operacao","end":""}],
    types: placeholder as Registry['operations.index']['types'],
  },
  'visitors.index': {
    methods: ["GET","HEAD"],
    pattern: '/visitantes',
    tokens: [{"old":"/visitantes","type":0,"val":"visitantes","end":""}],
    types: placeholder as Registry['visitors.index']['types'],
  },
  'visitors.store': {
    methods: ["POST"],
    pattern: '/visitantes',
    tokens: [{"old":"/visitantes","type":0,"val":"visitantes","end":""}],
    types: placeholder as Registry['visitors.store']['types'],
  },
  'visitors.exit': {
    methods: ["POST"],
    pattern: '/visitantes/:id/saida',
    tokens: [{"old":"/visitantes/:id/saida","type":0,"val":"visitantes","end":""},{"old":"/visitantes/:id/saida","type":1,"val":"id","end":""},{"old":"/visitantes/:id/saida","type":0,"val":"saida","end":""}],
    types: placeholder as Registry['visitors.exit']['types'],
  },
  'contact_attempts.store': {
    methods: ["POST"],
    pattern: '/contatos/whatsapp',
    tokens: [{"old":"/contatos/whatsapp","type":0,"val":"contatos","end":""},{"old":"/contatos/whatsapp","type":0,"val":"whatsapp","end":""}],
    types: placeholder as Registry['contact_attempts.store']['types'],
  },
  'media.show': {
    methods: ["GET","HEAD"],
    pattern: '/media/:scope/:fileName',
    tokens: [{"old":"/media/:scope/:fileName","type":0,"val":"media","end":""},{"old":"/media/:scope/:fileName","type":1,"val":"scope","end":""},{"old":"/media/:scope/:fileName","type":1,"val":"fileName","end":""}],
    types: placeholder as Registry['media.show']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'dashboard.index': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard.index']['types'],
  },
  'employees.index': {
    methods: ["GET","HEAD"],
    pattern: '/colaboradores',
    tokens: [{"old":"/colaboradores","type":0,"val":"colaboradores","end":""}],
    types: placeholder as Registry['employees.index']['types'],
  },
  'employees.store': {
    methods: ["POST"],
    pattern: '/colaboradores',
    tokens: [{"old":"/colaboradores","type":0,"val":"colaboradores","end":""}],
    types: placeholder as Registry['employees.store']['types'],
  },
  'employees.bulk_destroy': {
    methods: ["POST"],
    pattern: '/colaboradores/excluir-lote',
    tokens: [{"old":"/colaboradores/excluir-lote","type":0,"val":"colaboradores","end":""},{"old":"/colaboradores/excluir-lote","type":0,"val":"excluir-lote","end":""}],
    types: placeholder as Registry['employees.bulk_destroy']['types'],
  },
  'employees.update': {
    methods: ["POST"],
    pattern: '/colaboradores/:id',
    tokens: [{"old":"/colaboradores/:id","type":0,"val":"colaboradores","end":""},{"old":"/colaboradores/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['employees.update']['types'],
  },
  'vehicles.index': {
    methods: ["GET","HEAD"],
    pattern: '/veiculos',
    tokens: [{"old":"/veiculos","type":0,"val":"veiculos","end":""}],
    types: placeholder as Registry['vehicles.index']['types'],
  },
  'vehicles.store': {
    methods: ["POST"],
    pattern: '/veiculos',
    tokens: [{"old":"/veiculos","type":0,"val":"veiculos","end":""}],
    types: placeholder as Registry['vehicles.store']['types'],
  },
  'vehicles.update': {
    methods: ["POST"],
    pattern: '/veiculos/:id',
    tokens: [{"old":"/veiculos/:id","type":0,"val":"veiculos","end":""},{"old":"/veiculos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['vehicles.update']['types'],
  },
  'imports.index': {
    methods: ["GET","HEAD"],
    pattern: '/importacoes',
    tokens: [{"old":"/importacoes","type":0,"val":"importacoes","end":""}],
    types: placeholder as Registry['imports.index']['types'],
  },
  'imports.store': {
    methods: ["POST"],
    pattern: '/importacoes',
    tokens: [{"old":"/importacoes","type":0,"val":"importacoes","end":""}],
    types: placeholder as Registry['imports.store']['types'],
  },
  'imports.download_template': {
    methods: ["GET","HEAD"],
    pattern: '/importacoes/modelos/:type',
    tokens: [{"old":"/importacoes/modelos/:type","type":0,"val":"importacoes","end":""},{"old":"/importacoes/modelos/:type","type":0,"val":"modelos","end":""},{"old":"/importacoes/modelos/:type","type":1,"val":"type","end":""}],
    types: placeholder as Registry['imports.download_template']['types'],
  },
  'imports.store_auxiliary': {
    methods: ["POST"],
    pattern: '/importacoes/auxiliar',
    tokens: [{"old":"/importacoes/auxiliar","type":0,"val":"importacoes","end":""},{"old":"/importacoes/auxiliar","type":0,"val":"auxiliar","end":""}],
    types: placeholder as Registry['imports.store_auxiliary']['types'],
  },
  'imports.bulk_destroy': {
    methods: ["POST"],
    pattern: '/importacoes/excluir-lote',
    tokens: [{"old":"/importacoes/excluir-lote","type":0,"val":"importacoes","end":""},{"old":"/importacoes/excluir-lote","type":0,"val":"excluir-lote","end":""}],
    types: placeholder as Registry['imports.bulk_destroy']['types'],
  },
  'users.index': {
    methods: ["GET","HEAD"],
    pattern: '/usuarios',
    tokens: [{"old":"/usuarios","type":0,"val":"usuarios","end":""}],
    types: placeholder as Registry['users.index']['types'],
  },
  'users.store': {
    methods: ["POST"],
    pattern: '/usuarios',
    tokens: [{"old":"/usuarios","type":0,"val":"usuarios","end":""}],
    types: placeholder as Registry['users.store']['types'],
  },
  'users.update': {
    methods: ["POST"],
    pattern: '/usuarios/:id',
    tokens: [{"old":"/usuarios/:id","type":0,"val":"usuarios","end":""},{"old":"/usuarios/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.update']['types'],
  },
  'admin.approvals.index': {
    methods: ["GET","HEAD"],
    pattern: '/usuarios/aprovacoes',
    tokens: [{"old":"/usuarios/aprovacoes","type":0,"val":"usuarios","end":""},{"old":"/usuarios/aprovacoes","type":0,"val":"aprovacoes","end":""}],
    types: placeholder as Registry['admin.approvals.index']['types'],
  },
  'admin.approvals.approve': {
    methods: ["POST"],
    pattern: '/usuarios/aprovacoes/:id/aprovar',
    tokens: [{"old":"/usuarios/aprovacoes/:id/aprovar","type":0,"val":"usuarios","end":""},{"old":"/usuarios/aprovacoes/:id/aprovar","type":0,"val":"aprovacoes","end":""},{"old":"/usuarios/aprovacoes/:id/aprovar","type":1,"val":"id","end":""},{"old":"/usuarios/aprovacoes/:id/aprovar","type":0,"val":"aprovar","end":""}],
    types: placeholder as Registry['admin.approvals.approve']['types'],
  },
  'admin.approvals.reject': {
    methods: ["POST"],
    pattern: '/usuarios/aprovacoes/:id/rejeitar',
    tokens: [{"old":"/usuarios/aprovacoes/:id/rejeitar","type":0,"val":"usuarios","end":""},{"old":"/usuarios/aprovacoes/:id/rejeitar","type":0,"val":"aprovacoes","end":""},{"old":"/usuarios/aprovacoes/:id/rejeitar","type":1,"val":"id","end":""},{"old":"/usuarios/aprovacoes/:id/rejeitar","type":0,"val":"rejeitar","end":""}],
    types: placeholder as Registry['admin.approvals.reject']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
