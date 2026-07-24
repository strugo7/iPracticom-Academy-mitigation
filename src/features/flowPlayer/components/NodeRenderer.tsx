/**
 * NodeRenderer — בוחר את רכיב-הצומת לפי `type` (מסמך 07 §2). מקבל את הצומת
 * הנוכחי + הפעולות מה-hook, ומעביר לכל סוג את מה שהוא צריך.
 */
import type { PlayableFlow } from '../schemas'
import type { FlowNode } from '../schemas'
import { ActionNode } from './nodes/ActionNode'
import { OutcomeNode } from './nodes/OutcomeNode'
import { QuestionNode } from './nodes/QuestionNode'
import { StartNode } from './nodes/StartNode'

interface NodeRendererProps {
  node: FlowNode
  flow: PlayableFlow
  checkedActions: boolean[]
  onChoose: (optionIndex: number) => void
  onToggleAction: (index: number, itemCount: number) => void
}

export function NodeRenderer({
  node,
  flow,
  checkedActions,
  onChoose,
  onToggleAction,
}: NodeRendererProps) {
  switch (node.type) {
    case 'start':
      return <StartNode node={node} flow={flow} />
    case 'question':
      return <QuestionNode node={node} onChoose={onChoose} />
    case 'action':
      return (
        <ActionNode
          node={node}
          checked={checkedActions}
          onToggle={onToggleAction}
        />
      )
    default:
      return <OutcomeNode node={node} />
  }
}
