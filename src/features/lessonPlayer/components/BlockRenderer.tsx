/**
 * מפת type→קומפוננטה ("nodeTypes"-style, per handoff מסמך 19). visibility.hidden
 * נבדק פעם אחת כאן — קומפוננטות הבלוק לא יודעות על visibility. styling מוחל
 * גנרית דרך BlockStylingWrapper. parse כושל/type לא-מוכר → UnsupportedBlock,
 * לעולם לא זורק (בלוק בודד לא מפיל את השיעור).
 */
import type { ComponentType } from 'react'
import { AiGeneratedBlock } from '@/components/blocks/ai/AiGeneratedBlock'
import { DesignedSectionBlock } from '@/components/blocks/ai/DesignedSectionBlock'
import { GammaEmbedBlock } from '@/components/blocks/ai/GammaEmbedBlock'
import { HtmlEmbedBlock } from '@/components/blocks/ai/HtmlEmbedBlock'
import { BlockStylingWrapper } from '@/components/blocks/BlockStylingWrapper'
import { FlashcardBlock } from '@/components/blocks/interactive/FlashcardBlock'
import { InteractiveWidgetBlock } from '@/components/blocks/interactive/InteractiveWidgetBlock'
import { LabeledGraphicBlock } from '@/components/blocks/interactive/LabeledGraphicBlock'
import { NetworkCanvasBlock } from '@/components/blocks/interactive/NetworkCanvasBlock'
import { QuizBlock } from '@/components/blocks/interactive/QuizBlock'
import { SimulatorEmbedBlock } from '@/components/blocks/interactive/SimulatorEmbedBlock'
import { TabsBlock } from '@/components/blocks/interactive/TabsBlock'
import { ImageBlock } from '@/components/blocks/media/ImageBlock'
import { LessonCoverBlock } from '@/components/blocks/media/LessonCoverBlock'
import { PdfBlock } from '@/components/blocks/media/PdfBlock'
import { VideoBlock } from '@/components/blocks/media/VideoBlock'
import { HeadingBlock } from '@/components/blocks/text/HeadingBlock'
import { ListBlock } from '@/components/blocks/text/ListBlock'
import { MotivationBlock } from '@/components/blocks/text/MotivationBlock'
import { NoteBlock } from '@/components/blocks/text/NoteBlock'
import { PageBreakBlock } from '@/components/blocks/text/PageBreakBlock'
import { QuoteBlock } from '@/components/blocks/text/QuoteBlock'
import { SeparatorBlock } from '@/components/blocks/text/SeparatorBlock'
import { TableBlock } from '@/components/blocks/text/TableBlock'
import { TextBlock } from '@/components/blocks/text/TextBlock'
import { UnsupportedBlock } from '@/components/blocks/UnsupportedBlock'
import type { LessonBlockEnvelope } from '@/types/entities'
import { parseBlockData, type ParsedBlockDataMap } from '../blockSchemas'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BLOCK_COMPONENTS: Partial<Record<string, ComponentType<{ data: any }>>> = {
  text: TextBlock,
  heading: HeadingBlock,
  list: ListBlock,
  quote: QuoteBlock,
  note: NoteBlock,
  motivation: MotivationBlock,
  separator: SeparatorBlock,
  page_break: PageBreakBlock,
  table: TableBlock,
  image: ImageBlock,
  video: VideoBlock,
  pdf: PdfBlock,
  lesson_cover: LessonCoverBlock,
  flashcard: FlashcardBlock,
  quiz: QuizBlock,
  tabs: TabsBlock,
  labeled_graphic: LabeledGraphicBlock,
  simulator_embed: SimulatorEmbedBlock,
  interactive_widget: InteractiveWidgetBlock,
  network_canvas: NetworkCanvasBlock,
  ai_generated: AiGeneratedBlock,
  gamma_embed: GammaEmbedBlock,
  designed_section: DesignedSectionBlock,
  html_embed: HtmlEmbedBlock,
}

/** 'divider' הוא alias של 'separator' — 0 מופעים עצמאיים בדאטה האמיתי. */
function resolveType(type: string): string {
  return type === 'divider' ? 'separator' : type
}

export function BlockRenderer({ block }: { block: LessonBlockEnvelope }) {
  if (block.visibility?.hidden) return null

  const resolvedType = resolveType(block.type)
  const Component = BLOCK_COMPONENTS[resolvedType]
  const data = Component
    ? (parseBlockData(block.type, block.data) as
        | ParsedBlockDataMap[keyof ParsedBlockDataMap]
        | null)
    : null

  return (
    <BlockStylingWrapper styling={block.styling}>
      {Component && data !== null ? (
        <Component data={data} />
      ) : (
        <UnsupportedBlock type={block.type} />
      )}
    </BlockStylingWrapper>
  )
}
