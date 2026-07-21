/**
 * הקשר-VLAN לצמתים (שלב 6.4c) — מאפשר ל-DeviceNode (רכיב-node של React Flow)
 * לצייר נקודות-חברוּת VLAN בלי לזהם את data הקבוע של הצומת. הספק עוטף את
 * <ReactFlow>, כך שצמתים מותאמים (צאצאים שלו) צורכים אותו.
 */
import { createContext, useContext } from 'react'
import type { Vlan } from './vlanOps'

const VlanContext = createContext<Vlan[]>([])

export const VlanProvider = VlanContext.Provider

export function useVlans(): Vlan[] {
  return useContext(VlanContext)
}
