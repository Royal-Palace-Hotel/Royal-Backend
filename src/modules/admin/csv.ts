/**
 * Génération de CSV pour les exports du back-office.
 *
 * Deux précautions :
 *  - un BOM UTF-8, sans quoi Excel sous Windows affiche « Ã© » à la place de « é » ;
 *  - une protection contre l'injection de formules : une cellule commençant par
 *    `= + - @` est interprétée comme une formule par Excel, donc préfixée d'une
 *    apostrophe. Les noms et messages viennent de visiteurs du site.
 */

const RISKY_PREFIX = /^[=+\-@\t\r]/

function cell(value: unknown): string {
  if (value === null || value === undefined) return ''

  let text: string
  if (value instanceof Date) text = value.toISOString()
  else if (typeof value === 'boolean') text = value ? 'oui' : 'non'
  else text = String(value)

  if (RISKY_PREFIX.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export interface CsvColumn<T> {
  header: string
  value: (row: T) => unknown
}

export function toCsv<T>(rows: T[], columns: Array<CsvColumn<T>>) {
  const lines = [columns.map(column => cell(column.header)).join(',')]
  for (const row of rows) {
    lines.push(columns.map(column => cell(column.value(row))).join(','))
  }
  // CRLF : attendu par Excel.
  return `﻿${lines.join('\r\n')}\r\n`
}

export function csvFilename(base: string) {
  const stamp = new Date().toISOString().slice(0, 10)
  return `${base}-${stamp}.csv`
}
