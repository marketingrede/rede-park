import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'operations.index': { paramsTuple?: []; params?: {} }
    'visitors.index': { paramsTuple?: []; params?: {} }
    'visitors.store': { paramsTuple?: []; params?: {} }
    'visitors.exit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contact_attempts.store': { paramsTuple?: []; params?: {} }
    'media.show': { paramsTuple: [ParamValue,ParamValue]; params: {'scope': ParamValue,'fileName': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'employees.index': { paramsTuple?: []; params?: {} }
    'employees.store': { paramsTuple?: []; params?: {} }
    'employees.bulk_destroy': { paramsTuple?: []; params?: {} }
    'employees.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vehicles.index': { paramsTuple?: []; params?: {} }
    'vehicles.store': { paramsTuple?: []; params?: {} }
    'vehicles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.index': { paramsTuple?: []; params?: {} }
    'imports.store': { paramsTuple?: []; params?: {} }
    'imports.download_template': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'imports.store_auxiliary': { paramsTuple?: []; params?: {} }
    'imports.bulk_destroy': { paramsTuple?: []; params?: {} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'operations.index': { paramsTuple?: []; params?: {} }
    'visitors.index': { paramsTuple?: []; params?: {} }
    'media.show': { paramsTuple: [ParamValue,ParamValue]; params: {'scope': ParamValue,'fileName': ParamValue} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'employees.index': { paramsTuple?: []; params?: {} }
    'vehicles.index': { paramsTuple?: []; params?: {} }
    'imports.index': { paramsTuple?: []; params?: {} }
    'imports.download_template': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'operations.index': { paramsTuple?: []; params?: {} }
    'visitors.index': { paramsTuple?: []; params?: {} }
    'media.show': { paramsTuple: [ParamValue,ParamValue]; params: {'scope': ParamValue,'fileName': ParamValue} }
    'dashboard.index': { paramsTuple?: []; params?: {} }
    'employees.index': { paramsTuple?: []; params?: {} }
    'vehicles.index': { paramsTuple?: []; params?: {} }
    'imports.index': { paramsTuple?: []; params?: {} }
    'imports.download_template': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'visitors.store': { paramsTuple?: []; params?: {} }
    'visitors.exit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contact_attempts.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'employees.store': { paramsTuple?: []; params?: {} }
    'employees.bulk_destroy': { paramsTuple?: []; params?: {} }
    'employees.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'vehicles.store': { paramsTuple?: []; params?: {} }
    'vehicles.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'imports.store': { paramsTuple?: []; params?: {} }
    'imports.store_auxiliary': { paramsTuple?: []; params?: {} }
    'imports.bulk_destroy': { paramsTuple?: []; params?: {} }
    'users.store': { paramsTuple?: []; params?: {} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}