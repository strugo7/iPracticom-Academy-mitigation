import { NetworkTopologyViewer } from '@/components/network/NetworkTopologyViewer'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

export function NetworkCanvasBlock({
  data,
}: {
  data: ParsedBlockDataMap['network_canvas']
}) {
  return <NetworkTopologyViewer data={data} />
}
