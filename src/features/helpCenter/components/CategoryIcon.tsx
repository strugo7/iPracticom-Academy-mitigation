import {
  BarChart3,
  Layers,
  Pencil,
  Shield,
  User,
  Users,
  Wrench,
} from 'lucide-react'
import type { CategoryKey } from '../types'

interface CategoryIconProps {
  categoryKey: CategoryKey
  size?: number
  className?: string
}

export function CategoryIcon({
  categoryKey,
  size = 18,
  className,
}: CategoryIconProps) {
  switch (categoryKey) {
    case 'overview':
      return <Layers size={size} className={className} />
    case 'users':
      return <Users size={size} className={className} />
    case 'content':
      return <Pencil size={size} className={className} />
    case 'troubleshoot':
      return <Wrench size={size} className={className} />
    case 'dashboard':
      return <BarChart3 size={size} className={className} />
    case 'security':
      return <Shield size={size} className={className} />
    case 'profile':
      return <User size={size} className={className} />
    default:
      return <Layers size={size} className={className} />
  }
}
