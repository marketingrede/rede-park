/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
    }
  }
  'public.collaborator_register': {
    methods: ["GET","HEAD"]
    pattern: '/cadastro-colaborador'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_collaborators_controller').default['showForm']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_collaborators_controller').default['showForm']>>>
    }
  }
  'public_collaborators.lookup': {
    methods: ["POST"]
    pattern: '/api/public/employees/lookup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_collaborators_controller').default['lookup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_collaborators_controller').default['lookup']>>>
    }
  }
  'public_collaborators.submit': {
    methods: ["POST"]
    pattern: '/api/public/employees/submit'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_collaborators_controller').default['submit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_collaborators_controller').default['submit']>>>
    }
  }
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'operations.index': {
    methods: ["GET","HEAD"]
    pattern: '/operacao'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/operations_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/operations_controller').default['index']>>>
    }
  }
  'visitors.index': {
    methods: ["GET","HEAD"]
    pattern: '/visitantes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/visitors_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/visitors_controller').default['index']>>>
    }
  }
  'visitors.store': {
    methods: ["POST"]
    pattern: '/visitantes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').visitorValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').visitorValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/visitors_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/visitors_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'visitors.exit': {
    methods: ["POST"]
    pattern: '/visitantes/:id/saida'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/visitors_controller').default['exit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/visitors_controller').default['exit']>>>
    }
  }
  'contact_attempts.store': {
    methods: ["POST"]
    pattern: '/contatos/whatsapp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').contactAttemptValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').contactAttemptValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contact_attempts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contact_attempts_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'media.show': {
    methods: ["GET","HEAD"]
    pattern: '/media/:scope/:fileName'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { scope: ParamValue; fileName: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/media_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/media_controller').default['show']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'dashboard.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'employees.index': {
    methods: ["GET","HEAD"]
    pattern: '/colaboradores'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['index']>>>
    }
  }
  'employees.store': {
    methods: ["POST"]
    pattern: '/colaboradores'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').employeeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').employeeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'employees.bulk_destroy': {
    methods: ["POST"]
    pattern: '/colaboradores/excluir-lote'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['bulkDestroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['bulkDestroy']>>>
    }
  }
  'employees.update': {
    methods: ["POST"]
    pattern: '/colaboradores/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').employeeValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').employeeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/employees_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'vehicles.index': {
    methods: ["GET","HEAD"]
    pattern: '/veiculos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vehicles_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vehicles_controller').default['index']>>>
    }
  }
  'vehicles.store': {
    methods: ["POST"]
    pattern: '/veiculos'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').vehicleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').vehicleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vehicles_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vehicles_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'vehicles.update': {
    methods: ["POST"]
    pattern: '/veiculos/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').vehicleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').vehicleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/vehicles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/vehicles_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'imports.index': {
    methods: ["GET","HEAD"]
    pattern: '/importacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['index']>>>
    }
  }
  'imports.store': {
    methods: ["POST"]
    pattern: '/importacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['store']>>>
    }
  }
  'imports.download_template': {
    methods: ["GET","HEAD"]
    pattern: '/importacoes/modelos/:type'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { type: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['downloadTemplate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['downloadTemplate']>>>
    }
  }
  'imports.store_auxiliary': {
    methods: ["POST"]
    pattern: '/importacoes/auxiliar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['storeAuxiliary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['storeAuxiliary']>>>
    }
  }
  'imports.bulk_destroy': {
    methods: ["POST"]
    pattern: '/importacoes/excluir-lote'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['bulkDestroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/imports_controller').default['bulkDestroy']>>>
    }
  }
  'users.index': {
    methods: ["GET","HEAD"]
    pattern: '/usuarios'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
    }
  }
  'users.store': {
    methods: ["POST"]
    pattern: '/usuarios'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').userManagementValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').userManagementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.update': {
    methods: ["POST"]
    pattern: '/usuarios/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/redepark').userManagementValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/redepark').userManagementValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.approvals.index': {
    methods: ["GET","HEAD"]
    pattern: '/usuarios/aprovacoes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/approvals_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/approvals_controller').default['index']>>>
    }
  }
  'admin.approvals.approve': {
    methods: ["POST"]
    pattern: '/usuarios/aprovacoes/:id/aprovar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/approvals_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/approvals_controller').default['approve']>>>
    }
  }
  'admin.approvals.reject': {
    methods: ["POST"]
    pattern: '/usuarios/aprovacoes/:id/rejeitar'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/approvals_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/approvals_controller').default['reject']>>>
    }
  }
}
