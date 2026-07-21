/**
 * מנתב-עורכים (שלבים 6.3-6.5) — ממפה סוג-בלוק לעורך-התוכן הפרטני שלו. סוגים
 * ללא-תוכן (separator/page_break) אינם כאן; ה-EditorBlockItem נופל עבורם
 * לתצוגת-הנגן. עריכת-תוכן זורמת דרך onChange → updateBlockData (merge רדוד).
 */
import type { ComponentType } from 'react'
import type { EditorBlock } from '../../types'
import type { BlockEditorProps } from './types'
import { TextBlockEditor } from './TextBlockEditor'
import { HeadingBlockEditor } from './HeadingBlockEditor'
import { ListBlockEditor } from './ListBlockEditor'
import { QuoteBlockEditor } from './QuoteBlockEditor'
import { NoteBlockEditor } from './NoteBlockEditor'
import { MotivationBlockEditor } from './MotivationBlockEditor'
import { TableBlockEditor } from './TableBlockEditor'
import { ImageBlockEditor } from './ImageBlockEditor'
import { VideoBlockEditor } from './VideoBlockEditor'
import { PdfBlockEditor } from './PdfBlockEditor'
import { LessonCoverBlockEditor } from './LessonCoverBlockEditor'
import { FlashcardBlockEditor } from './FlashcardBlockEditor'
import { TabsBlockEditor } from './TabsBlockEditor'
import { NetworkCanvasBlockEditor } from './NetworkCanvasBlockEditor'
import { AiGeneratedBlockEditor } from './AiGeneratedBlockEditor'
import { GammaEmbedBlockEditor } from './GammaEmbedBlockEditor'
import { HtmlEmbedBlockEditor } from './HtmlEmbedBlockEditor'
import { DesignedSectionBlockEditor } from './DesignedSectionBlockEditor'

const EDITORS: Record<string, ComponentType<BlockEditorProps>> = {
  text: TextBlockEditor,
  heading: HeadingBlockEditor,
  list: ListBlockEditor,
  quote: QuoteBlockEditor,
  note: NoteBlockEditor,
  motivation: MotivationBlockEditor,
  table: TableBlockEditor,
  image: ImageBlockEditor,
  video: VideoBlockEditor,
  pdf: PdfBlockEditor,
  lesson_cover: LessonCoverBlockEditor,
  flashcard: FlashcardBlockEditor,
  tabs: TabsBlockEditor,
  network_canvas: NetworkCanvasBlockEditor,
  ai_generated: AiGeneratedBlockEditor,
  gamma_embed: GammaEmbedBlockEditor,
  html_embed: HtmlEmbedBlockEditor,
  designed_section: DesignedSectionBlockEditor,
}

interface BlockEditorSwitchProps {
  block: EditorBlock
  onChange: (patch: Record<string, unknown>) => void
  autoFocus?: boolean
}

export function BlockEditorSwitch({ block, onChange, autoFocus }: BlockEditorSwitchProps) {
  const Editor = EDITORS[block.type]
  if (!Editor) return null
  return <Editor data={block.data} onChange={onChange} autoFocus={autoFocus} />
}
