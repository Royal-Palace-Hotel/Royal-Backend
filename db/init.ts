import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import { createConnection } from 'mysql2/promise'
import { connectionOptions } from '../src/config/db'
import { runSql } from './run-sql'

async function canConnectToMySql() {
  try {
    const connection = await createConnection({ ...connectionOptions, database: undefined, connectTimeout: 2000 })
    await connection.end()
    return true
  } catch {
    return false
  }
}

async function waitForMySql() {
  const deadline = Date.now() + 60_000
  let lastError: unknown

  while (Date.now() < deadline) {
    let connection: Awaited<ReturnType<typeof createConnection>> | undefined
    try {
      connection = await createConnection({ ...connectionOptions, database: undefined, connectTimeout: 2000 })
      await connection.ping()
      return
    } catch (error) {
      lastError = error
    } finally {
      if (connection) await connection.end()
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const detail = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`MySQL did not become ready within 60 seconds: ${detail}`)
}

async function main() {
  if (!(await canConnectToMySql())) {
    console.log('MySQL is not reachable; starting the local Docker Compose database...')
    try {
      execFileSync('docker', ['compose', 'up', '-d', 'mysql'], { stdio: 'inherit' })
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`Could not start MySQL with Docker Compose. Start Docker or configure DATABASE_URL for a running MySQL server. ${detail}`)
    }
    await waitForMySql()
  }

  await runSql('db/schema.sql')
  console.log('Local MySQL schema is ready.')
}

main().catch(error => {
  console.error('Database initialization failed:', error)
  process.exitCode = 1
})