import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** מיזוג class-ים של Tailwind בבטחה (shadcn/ui). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
