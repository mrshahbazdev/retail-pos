import { registerAuthHandlers } from './auth.ipc'
import { registerProductHandlers } from './products.ipc'
import { registerSalesHandlers } from './sales.ipc'
import { registerCustomerHandlers } from './customers.ipc'
import { registerReportHandlers } from './reports.ipc'
import { registerSettingsHandlers } from './settings.ipc'

export function registerAllIpcHandlers(): void {
  registerAuthHandlers()
  registerProductHandlers()
  registerSalesHandlers()
  registerCustomerHandlers()
  registerReportHandlers()
  registerSettingsHandlers()
}
