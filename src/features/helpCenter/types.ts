export type CategoryKey =
  | 'overview'
  | 'users'
  | 'content'
  | 'troubleshoot'
  | 'dashboard'
  | 'security'
  | 'profile'

export interface HelpArticle {
  id: string
  label: string
  desc: string
  steps: string[]
  tip?: string
}

export interface HelpCategory {
  key: CategoryKey
  label: string
  hero: string
  items: HelpArticle[]
}
