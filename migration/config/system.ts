/**
 * Domain H — system config carried in the backup: AppSetting and WizardConfig.
 * (`app_settings.value` and `wizard_configs.steps` stay JSON.)
 */
import type { TableConfig } from '../types.ts'

export const appSettingsConfig: TableConfig = {
  source: 'AppSetting',
  target: 'app_settings',
}

export const wizardConfigsConfig: TableConfig = {
  source: 'WizardConfig',
  target: 'wizard_configs',
}
