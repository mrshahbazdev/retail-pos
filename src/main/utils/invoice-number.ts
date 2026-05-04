import dayjs from 'dayjs'

export function generateInvoiceNumber(prefix: string, lastNumber: number): string {
  const date = dayjs().format('YYYYMMDD')
  const seq = String(lastNumber + 1).padStart(4, '0')
  return `${prefix}-${date}-${seq}`
}

export function generateAdjustmentNumber(lastNumber: number): string {
  return generateInvoiceNumber('ADJ', lastNumber)
}

export function generateReturnNumber(lastNumber: number): string {
  return generateInvoiceNumber('RET', lastNumber)
}

export function generatePONumber(lastNumber: number): string {
  return generateInvoiceNumber('PO', lastNumber)
}
