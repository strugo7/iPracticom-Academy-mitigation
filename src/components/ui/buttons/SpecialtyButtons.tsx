import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ChevronDown, PhoneIcon, PlusIcon, EditIcon, InfoIcon } from './icons'

// Shared state vocabulary used across the specialty buttons in "02 - New Buttons".
type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>

const ring =
  'inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed'

/* ---------- Day Toggle (32x32) ---------- */
export type DayToggleState =
  'default' | 'hover' | 'selected' | 'down' | 'disabled'
interface DayToggleProps extends BaseProps {
  state?: DayToggleState
  letter?: string
}
const dayToggle: Record<DayToggleState, string> = {
  default: 'border border-neutrals-palladium text-neutrals-nickel',
  hover: 'bg-hues-sky border border-accent text-accent',
  selected: 'bg-accent text-white font-semibold',
  down: 'bg-neutrals-charcoal text-white',
  disabled: 'border border-neutrals-palladium text-neutrals-nickel opacity-50',
}
export function DayToggle({
  state = 'default',
  letter = 'א',
  className = '',
  ...props
}: DayToggleProps) {
  return (
    <button
      className={`${ring} relative w-8 h-8 rounded-2xl text-body ${dayToggle[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      {letter}
      {state === 'selected' && (
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-caution"
          aria-hidden="true"
        />
      )}
    </button>
  )
}

/* ---------- Call Button (40x40 round) ---------- */
export type CallButtonState = 'default' | 'hover' | 'down' | 'disabled'
interface CallButtonProps extends BaseProps {
  state?: CallButtonState
}
const callBtn: Record<CallButtonState, string> = {
  default: 'bg-white text-neutrals-charcoal',
  hover: 'bg-neutrals-whisper text-neutrals-charcoal',
  down: 'bg-neutrals-charcoal text-white',
  disabled: 'bg-white text-neutrals-charcoal opacity-50',
}
export function CallButton({
  state = 'default',
  className = '',
  ...props
}: CallButtonProps) {
  return (
    <button
      className={`${ring} w-10 h-10 rounded-full p-2 ${callBtn[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      <PhoneIcon size={24} />
    </button>
  )
}

/* ---------- Agent Button (48x48 round, gradient) ---------- */
export type AgentState = 'default' | 'hover' | 'down' | 'disabled'
interface AgentProps extends BaseProps {
  state?: AgentState
}
const agentBtn: Record<AgentState, string> = {
  default: 'bg-accent-gradient text-white',
  hover: 'bg-[linear-gradient(45deg,#33C2FF,#2878EF)] text-white',
  down: 'bg-neutrals-charcoal text-white',
  disabled: 'bg-accent-gradient text-white opacity-50',
}
export function AgentButton({
  state = 'default',
  className = '',
  ...props
}: AgentProps) {
  return (
    <button
      className={`${ring} w-12 h-12 rounded-full p-2 ${agentBtn[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      <ChevronDown size={24} />
    </button>
  )
}

/* ---------- Agent Secondary (48x48 round, neutral) ---------- */
const agentSec: Record<AgentState, string> = {
  default: 'bg-neutrals-whisper text-neutrals-charcoal',
  hover: 'bg-neutrals-silver text-neutrals-charcoal',
  down: 'bg-neutrals-charcoal text-white',
  disabled: 'bg-neutrals-whisper text-neutrals-charcoal opacity-50',
}
export function AgentSecButton({
  state = 'default',
  className = '',
  ...props
}: AgentProps) {
  return (
    <button
      className={`${ring} w-12 h-12 rounded-full p-2 ${agentSec[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      <ChevronDown size={24} />
    </button>
  )
}

/* ---------- Dial (64x64) ---------- */
export type DialState = 'default' | 'hover' | 'down' | 'disabled'
interface DialProps extends BaseProps {
  state?: DialState
  digit?: ReactNode
}
const dial: Record<DialState, string> = {
  default: 'border border-[#E5E5E5] text-[#040404]',
  hover: 'bg-hues-sky border border-accent text-accent',
  down: 'bg-accent border border-[#E5E5E5] text-white',
  disabled: 'border border-[#E5E5E5] text-[#040404] opacity-50',
}
export function DialButton({
  state = 'default',
  digit = '1',
  className = '',
  ...props
}: DialProps) {
  return (
    <button
      className={`${ring} w-16 h-16 rounded-[40px] text-[32px] leading-none font-sans ${dial[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      {digit}
    </button>
  )
}

/* ---------- Info (16x16) ---------- */
export type InfoState = 'default' | 'hover' | 'down'
interface InfoProps extends BaseProps {
  state?: InfoState
}
const info: Record<InfoState, string> = {
  default: 'text-neutrals-palladium',
  hover: 'text-neutrals-nickel',
  down: 'text-accent',
}
export function InfoButton({
  state = 'default',
  className = '',
  ...props
}: InfoProps) {
  return (
    <button
      className={`${ring} w-4 h-4 ${info[state]} ${className}`}
      {...props}
    >
      <InfoIcon size={16} />
    </button>
  )
}

/* ---------- Header Button (56x56 round) ---------- */
export type HeaderState = 'default' | 'hover' | 'down' | 'disabled'
interface HeaderProps extends BaseProps {
  state?: HeaderState
}
// 56x56 round, #FFFFFF/#F2F5F8 ellipse, drop shadow 0/6/13 rgba(0,0,0,.10).
// Per node the Down state has NO shadow (drops on press); others keep it.
const header: Record<HeaderState, string> = {
  default: 'bg-white text-accent shadow-[0_6px_13px_rgba(0,0,0,0.10)]',
  hover: 'bg-neutrals-whisper text-accent shadow-[0_6px_13px_rgba(0,0,0,0.10)]',
  down: 'bg-neutrals-whisper text-neutrals-charcoal',
  disabled:
    'bg-white text-accent opacity-50 shadow-[0_6px_13px_rgba(0,0,0,0.10)]',
}
export function HeaderButton({
  state = 'default',
  className = '',
  ...props
}: HeaderProps) {
  return (
    <button
      className={`${ring} w-14 h-14 rounded-full ${header[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      <PhoneIcon size={24} />
    </button>
  )
}

/* ---------- Icon Fill (24x24 gradient circle) ---------- */
export type IconFillState = 'default' | 'hover' | 'down' | 'disabled'
interface IconFillProps extends BaseProps {
  state?: IconFillState
}
const iconFill: Record<IconFillState, string> = {
  default: 'bg-accent-gradient',
  hover: 'bg-[linear-gradient(45deg,#33C2FF,#2878EF)]',
  down: 'bg-[linear-gradient(45deg,#1D83C1,#141AA9)]',
  disabled: 'bg-accent-gradient opacity-50',
}
export function IconFillButton({
  state = 'default',
  className = '',
  ...props
}: IconFillProps) {
  return (
    <button
      className={`${ring} w-6 h-6 rounded-full text-white ${iconFill[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      <PlusIcon size={16} />
    </button>
  )
}

/* ---------- IVR Dial (34x34) ---------- */
export type IvrState = 'default' | 'hover' | 'selected'
interface IvrProps extends BaseProps {
  state?: IvrState
  digit?: ReactNode
}
const ivr: Record<IvrState, string> = {
  default: 'bg-neutrals-charcoal text-white',
  hover: 'bg-accent text-white',
  selected: 'bg-accent text-white',
}
export function IvrDialButton({
  state = 'default',
  digit = '1',
  className = '',
  ...props
}: IvrProps) {
  return (
    <button
      className={`${ring} h-[34px] min-w-[34px] px-3 rounded-[20px] text-body ${ivr[state]} ${className}`}
      {...props}
    >
      {digit}
    </button>
  )
}

/* ---------- Mini Filter (74x23 pill) ---------- */
export type MiniFilterState =
  'default' | 'hover' | 'down' | 'selected' | 'disabled'
interface MiniFilterProps extends BaseProps {
  state?: MiniFilterState
  count?: ReactNode
  label?: ReactNode
}
const miniFilter: Record<MiniFilterState, string> = {
  default: 'bg-neutrals-nickel',
  hover: 'bg-neutrals-lead',
  down: 'bg-accent',
  selected: 'bg-accent-gradient',
  disabled: 'bg-neutrals-silver',
}
export function MiniFilter({
  state = 'default',
  count = '7',
  label = 'רופאים',
  className = '',
  ...props
}: MiniFilterProps) {
  return (
    <button
      className={`${ring} h-[23px] px-2 gap-[11px] rounded text-white ${miniFilter[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      {/* RTL: label is the first (rightmost) child, count sits to its left */}
      <span className="text-tiny-bold">{label}</span>
      <span className="text-small font-semibold">{count}</span>
    </button>
  )
}

/* ---------- Big Filter (139x60 card) ---------- */
export type BigFilterState =
  'default' | 'hover' | 'selected' | 'disabled' | 'outbound'
interface BigFilterProps extends BaseProps {
  state?: BigFilterState
  number?: ReactNode
  label?: ReactNode
}
const bigFilter: Record<
  BigFilterState,
  { box: string; icon: string; text: string }
> = {
  // default/hover: solid bg + inner stroke shadow #BCC3CB (1px). No outer shadow.
  default: {
    box: 'bg-white shadow-[inset_0_0_0_1px_#BCC3CB]',
    icon: 'text-accent',
    text: 'text-neutrals-lead',
  },
  hover: {
    box: 'bg-neutrals-whisper shadow-[inset_0_0_0_1px_#BCC3CB]',
    icon: 'text-accent',
    text: 'text-neutrals-lead',
  },
  // selected/disabled/outbound: gradient + the EXACT Figma layered shadows.
  // REST-verified effects (per state): DROP 0/4/8 spread-4 rgba(24,29,36,.10) +
  // DROP 0/16/24 spread-16 <glow> + INNER 0/-1/0 spread0 rgba(24,29,36,.10).
  // The spreads (-4 / -16) were previously missing, making the shadow bloom too wide.
  selected: {
    box: 'bg-accent-gradient shadow-[0_4px_8px_-4px_rgba(24,29,36,0.10),0_16px_24px_-16px_rgba(0,117,219,0.70),inset_0_-1px_0_0_rgba(24,29,36,0.10)]',
    icon: 'text-hues-cobalt',
    text: 'text-white',
  },
  // Gradient direction matches Figma handles P0(0.51,-0.49)→P1(-0.48,0.49):
  // dark stop at top-right → light stop at bottom-left. On the 139×60 box that
  // pixel direction is ≈247deg in CSS (the old 45deg was the opposite diagonal).
  // Figma: the Disabled COMPONENT is set to opacity 0.5 (the whole thing, fill + shadows),
  // which mutes the #4D5358→#A2A9B0 gradient. Reproduce with opacity-50 on the button.
  disabled: {
    box: 'opacity-50 bg-[linear-gradient(247deg,#4D5358_0%,#A2A9B0_100%)] shadow-[0_4px_8px_-4px_rgba(24,29,36,0.10),0_16px_24px_-16px_rgba(135,141,150,0.70),inset_0_-1px_0_0_rgba(24,29,36,0.10)]',
    icon: 'text-neutrals-charcoal',
    text: 'text-white',
  },
  outbound: {
    box: 'bg-[linear-gradient(247deg,#0072C3_0%,#1192E8_51%,#9EF0F0_100%)] shadow-[0_4px_8px_-4px_rgba(24,29,36,0.10),0_16px_24px_-16px_rgba(51,177,255,0.70),inset_0_-1px_0_0_rgba(24,29,36,0.10)]',
    icon: 'text-accent',
    text: 'text-white',
  },
}

export function BigFilter({
  state = 'default',
  number = '1,000',
  label = 'כיתוב',
  className = '',
  ...props
}: BigFilterProps) {
  const s = bigFilter[state]
  return (
    <button
      // 139x60, pad L12 R12 T8 B8, r8. dir=ltr so DOM order = Figma child order
      // (Teaser then Labels); justify-between pins the icon to the LEFT edge and
      // the Labels block flush to the RIGHT edge regardless of page RTL.
      dir="ltr"
      className={`${ring} w-[139px] h-[60px] px-3 py-2 justify-between rounded-lg ${s.box} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      {/* Teaser = Icon/Call End (24x9 vector in a 24px slot), LEFT, fill per state. */}
      <span className={`shrink-0 flex items-center justify-center ${s.icon}`}>
        <PhoneIcon size={24} />
      </span>
      {/* Labels frame (71px): "כיתוב" (14px) on top, "1,000" (18px) below,
         both right-aligned and flush to the button's right edge. */}
      <span className="flex flex-col items-end text-right leading-tight w-[71px]">
        <span className={`text-tiny ${s.text}`}>{label}</span>
        <span className={`text-body font-normal ${s.text}`}>{number}</span>
      </span>
    </button>
  )
}

/* ---------- Round Icon Button (40x40) ---------- */
export type RoundIconState = 'default' | 'hover' | 'down' | 'disabled'
interface RoundIconProps extends BaseProps {
  state?: RoundIconState
}
const roundIcon: Record<RoundIconState, string> = {
  default: 'bg-transparent text-accent',
  hover: 'bg-neutrals-whisper text-accent',
  down: 'bg-accent text-white',
  disabled: 'bg-transparent text-neutrals-silver',
}
export function RoundIconButton({
  state = 'default',
  className = '',
  ...props
}: RoundIconProps) {
  return (
    <button
      className={`${ring} w-10 h-10 rounded-full p-2 ${roundIcon[state]} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      <EditIcon size={24} />
    </button>
  )
}
