export type TutorialPosition = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface TutorialStep {
  id: string
  title: string
  content: string
  highlightSelector: string | null // null = center screen modal
  position?: TutorialPosition
  tip?: string
  details?: string[]
}

export interface TutorialConfig {
  id: string
  title: string
  steps: TutorialStep[]
}
