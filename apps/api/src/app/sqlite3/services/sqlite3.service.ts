import { LogService } from '@dashy/util/logger'
import { Injectable, OnModuleInit } from '@nestjs/common'
import { Database } from 'sqlite3'
import { environment } from '../../../environments/environment'

@Injectable()
export class Sqlite3Service implements OnModuleInit {
  private db: Database

  constructor(private readonly logger: LogService) {}

  async onModuleInit() {
    const db = new Promise<void>((resolve, reject) => {
      this.db = new Database(environment.storage, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

    await db

    // this.db.run(`DELETE FROM backup; DELETE FROM container; DELETE FROM tool;`)

    this.logger.log(`Successfully initialized`, 'DB')

    await new Promise<void>((resolve, reject) =>
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS tool (id CHAR(36) PRIMARY KEY, name VARCHAR(255), description VARCHAR(255), url VARCHAR(255), img VARCHAR(255), accountCreation CHECK(accountCreation IN ("SELF","ON_REQUEST","LOCKED","NO_ACCOUNT")), isInMaintenance BOOLEAN);
      `,
        function (err) {
          if (err) reject(err)
          else resolve()
        }
      )
    )

    await new Promise<void>((resolve, reject) =>
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS container (tool CHAR(36) REFERENCES tool, name VARCHAR(255), PRIMARY KEY (tool, name));
      `,
        function (err) {
          if (err) reject(err)
          else resolve()
        }
      )
    )

    await new Promise<void>((resolve, reject) =>
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS backup (id CHAR(36) PRIMARY KEY, tool CHAR(36) REFERENCES tool, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, duration INT, downtime INT, rawSize VARCHAR(255));
      `,
        function (err) {
          if (err) reject(err)
          else resolve()
        }
      )
    )

    // await new Promise<void>((resolve, reject) => {
    //   this.db.run(`INSERT INTO tool VALUES ()`)
    // })
  }

  get<T = any>(sql: string, parameters?: (string | number)[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, parameters, function (err, rows) {
        if (err) reject(err)
        else {
          resolve(rows)
        }
      })
    })
  }
  getOne<T = any>(sql: string, parameters?: (string | number)[]): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, parameters, function (err, rows) {
        if (err) reject(err)
        else {
          resolve(rows[0])
        }
      })
    })
  }

  run(sql: string, data?: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, data, function (err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}
