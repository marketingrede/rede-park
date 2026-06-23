import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  '@adonisjs',
  'lucid',
  'build',
  'src',
  'clients',
  'libsql.cjs'
)

const replacementContent = `"use strict";
const Sqlite3Client = require('knex/lib/dialects/sqlite3/index.js');
const { createClient } = require('@libsql/client');

class LibsqlHttpClientWrapper {
  constructor(client) {
    this.client = client;
  }
  
  all(sql, bindings, callback) {
    this.client.execute({ sql, args: bindings })
      .then(result => {
        callback.call(this, null, result.rows);
      })
      .catch(err => {
        callback.call(this, err);
      });
  }

  run(sql, bindings, callback) {
    this.client.execute({ sql, args: bindings })
      .then(result => {
        const context = {
          lastID: result.lastInsertRowid !== undefined && result.lastInsertRowid !== null ? Number(result.lastInsertRowid) : undefined,
          changes: Number(result.rowsAffected || 0)
        };
        callback.call(context, null);
      })
      .catch(err => {
        callback.call(this, err);
      });
  }
  
  close(callback) {
    if (callback) callback();
  }
}

module.exports = class LibSQLClient extends Sqlite3Client {
  _driver() {
    return require('@libsql/sqlite3'); // kept for Knex internal checks
  }

  acquireRawConnection() {
    return new Promise((resolve, reject) => {
      try {
        const urlStr = this.connectionSettings.filename;
        if (!urlStr) {
          return reject(new Error("filename connection settings is missing"));
        }
        
        let url = urlStr;
        let authToken = undefined;
        
        if (urlStr.includes('://')) {
          const parsedUrl = new URL(urlStr);
          authToken = parsedUrl.searchParams.get('authToken') || undefined;
          parsedUrl.searchParams.delete('authToken');
          url = parsedUrl.toString();
          if (url.startsWith('libsql:')) {
            url = url.replace('libsql:', 'https:');
          }
        }
        
        const httpClient = createClient({ url, authToken });
        const wrapper = new LibsqlHttpClientWrapper(httpClient);
        resolve(wrapper);
      } catch (err) {
        reject(err);
      }
    });
  }

  async destroyRawConnection(connection) {
    connection.client.close();
  }

  get dialect() {
    return 'libsql';
  }

  get driverName() {
    return 'libsql';
  }
};
`

try {
  if (fs.existsSync(targetFile)) {
    fs.writeFileSync(targetFile, replacementContent, 'utf8')
    console.log('[PATCH] successfully replaced native libsql client with HTTP client wrapper!')
  } else {
    console.warn('[PATCH] target file not found:', targetFile)
  }
} catch (err) {
  console.error('[PATCH] failed to patch target file:', err)
}
