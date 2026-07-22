/**
 * אבטחת התחברות (design-export שורות 71-162) — 3 הגדרות בסקשן אחד עם savebar
 * משותף: email_whitelist (אמיתי, ראו constants.ts), ip_whitelist, security_policy
 * (שניהם חדשים). הכרטיס נקרא "כתובות מייל מורשות" ולא "דומיינים" — הדאטה
 * האמיתי הוא רשימת-מיילים ספציפית (email_whitelist), לא רשימת-דומיינים.
 */
import { useState } from 'react'
import { Icon, Input, Toggle } from '@/components/ui'
import {
  APP_SETTING_KEYS,
  DEFAULT_IP_WHITELIST,
  DEFAULT_SECURITY_POLICY,
  SESSION_TTL_HOURS_OPTIONS,
} from '../constants'
import { GlobeIcon, LockIcon, ServerIcon, WifiIcon } from '../icons'
import { useSettingDraft } from '../hooks/useSettingDraft'
import type { EmailWhitelistValue } from '../types'
import { SaveBar } from './SaveBar'

const EMPTY_WHITELIST: EmailWhitelistValue = { emails: [] }

export function SecuritySection() {
  const whitelist = useSettingDraft(
    APP_SETTING_KEYS.emailWhitelist,
    EMPTY_WHITELIST,
    'רשימת כתובות מייל מורשות',
  )
  const ip = useSettingDraft(
    APP_SETTING_KEYS.ipWhitelist,
    DEFAULT_IP_WHITELIST,
    'הגבלת כתובות IP להתחברות',
  )
  const policy = useSettingDraft(
    APP_SETTING_KEYS.securityPolicy,
    DEFAULT_SECURITY_POLICY,
    'מדיניות 2FA וזמן-session',
  )

  const [newEmail, setNewEmail] = useState('')
  const [newIp, setNewIp] = useState('')
  const [saved, setSaved] = useState(false)

  const isDirty = whitelist.isDirty || ip.isDirty || policy.isDirty
  const isSaving = whitelist.isSaving || ip.isSaving || policy.isSaving

  const addEmail = () => {
    const value = newEmail.trim().toLowerCase()
    if (!value || whitelist.draft.emails.includes(value)) {
      setNewEmail('')
      return
    }
    whitelist.setDraft({ emails: [...whitelist.draft.emails, value] })
    setNewEmail('')
  }
  const removeEmail = (email: string) =>
    whitelist.setDraft({
      emails: whitelist.draft.emails.filter((e) => e !== email),
    })

  const addIpRange = () => {
    const value = newIp.trim()
    if (!value) return
    ip.setDraft({
      ...ip.draft,
      ranges: [...ip.draft.ranges, { cidr: value, note: 'מותאם אישית' }],
    })
    setNewIp('')
  }
  const removeIpRange = (i: number) =>
    ip.setDraft({
      ...ip.draft,
      ranges: ip.draft.ranges.filter((_, j) => j !== i),
    })

  const handleSave = async () => {
    if (whitelist.isDirty) await whitelist.commit()
    if (ip.isDirty) await ip.commit()
    if (policy.isDirty) await policy.commit()
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }
  const handleCancel = () => {
    whitelist.setDraft(whitelist.value)
    ip.setDraft(ip.value)
    policy.setDraft(policy.value)
  }

  return (
    <div className="animate-[fadeIn_0.24s_ease]">
      <div className="mb-5">
        <h2 className="m-0 flex items-center gap-2.5 text-[21px] font-semibold text-neutrals-charcoal">
          <span className="flex size-8 items-center justify-center rounded-[9px] bg-hues-sky text-accent">
            <LockIcon size={18} />
          </span>
          אבטחת התחברות
        </h2>
        <p className="mt-2 text-small leading-relaxed text-neutrals-lead">
          קבעו מי רשאי להתחבר לאקדמיה ומאילו מקומות. שינויים חלים על כלל
          המשתמשים.
        </p>
      </div>

      {/* EMAIL WHITELIST CARD */}
      <section
        data-tutorial="allowed-domains-section"
        className="mb-4 rounded-2xl bg-white p-5 shadow-card"
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="flex size-10 flex-none items-center justify-center rounded-[11px] bg-accent-gradient text-white">
            <GlobeIcon size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-[16.5px] font-semibold text-neutrals-charcoal">
              כתובות מייל מורשות
            </h3>
            <p className="mt-1 text-tiny text-neutrals-lead">
              רק כתובות המייל ברשימה יוכלו להירשם ולהתחבר, גם ללא דומיין החברה.{' '}
              <strong className="text-neutrals-charcoal">
                {whitelist.draft.emails.length} כתובות
              </strong>{' '}
              פעילות.
            </p>
          </div>
        </div>

        <div className="mb-3.5 flex flex-col gap-2">
          {whitelist.draft.emails.map((email) => (
            <div
              key={email}
              className="flex items-center gap-2.5 rounded-xl border border-neutrals-silver bg-white p-2.5 px-3.5 transition-colors hover:border-accent hover:bg-neutrals-whisper"
            >
              <span className="flex size-[30px] flex-none items-center justify-center rounded-lg bg-hues-sky text-accent">
                <Icon name="MailLine" size={15} />
              </span>
              <span
                dir="ltr"
                className="flex-1 text-end text-[14.5px] font-semibold text-neutrals-charcoal"
              >
                {email}
              </span>
              <button
                type="button"
                title="הסר כתובת"
                onClick={() => removeEmail(email)}
                className="flex size-[30px] flex-none items-center justify-center rounded-lg text-neutrals-nickel opacity-55 transition-all hover:bg-hues-salmon hover:text-caution hover:opacity-100"
              >
                <Icon name="Close" size={16} />
              </button>
            </div>
          ))}
          {whitelist.draft.emails.length === 0 && (
            <p className="m-0 text-small text-neutrals-nickel">
              אין עדיין כתובות ברשימה.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <Input
              dir="ltr"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addEmail()
                }
              }}
              placeholder="name@company.co.il"
              leadingIcon={<Icon name="MailLine" size={16} />}
            />
          </div>
          <button
            type="button"
            onClick={addEmail}
            className="flex h-10 flex-none items-center gap-1.5 rounded-xl border-[1.5px] border-accent bg-white px-4 font-semibold text-small text-accent transition-colors hover:bg-hues-sky"
          >
            <Icon name="Plus" size={16} />
            הוסף
          </button>
        </div>
      </section>

      {/* IP CARD */}
      <section
        data-tutorial="ip-range-section"
        className="mb-4 rounded-2xl bg-white p-5 shadow-card"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 flex-none items-center justify-center rounded-[11px] bg-neutrals-whisper text-neutrals-lead">
            <ServerIcon size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-[16.5px] font-semibold text-neutrals-charcoal">
              הגבלת כתובות IP
            </h3>
            <p className="mt-1 text-tiny text-neutrals-lead">
              הגבילו התחברות לטווחי IP מאושרים בלבד — למשל רשת המשרד.
            </p>
          </div>
          <Toggle
            checked={ip.draft.enabled}
            onChange={(v) => ip.setDraft({ ...ip.draft, enabled: v })}
          />
        </div>

        {ip.draft.enabled && (
          <div className="mt-4 border-t border-neutrals-whisper pt-4">
            <div className="mb-3.5 flex flex-col gap-2">
              {ip.draft.ranges.map((r, i) => (
                <div
                  key={`${r.cidr}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl border border-neutrals-silver bg-white p-2.5 px-3.5 transition-colors hover:border-accent hover:bg-neutrals-whisper"
                >
                  <span className="flex size-[30px] flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-neutrals-lead">
                    <WifiIcon size={15} />
                  </span>
                  <span
                    dir="ltr"
                    className="flex-1 text-end text-[14.5px] font-semibold text-neutrals-charcoal"
                  >
                    {r.cidr}
                  </span>
                  <span className="flex-none text-[11.5px] text-neutrals-nickel">
                    {r.note}
                  </span>
                  <button
                    type="button"
                    title="הסר טווח"
                    onClick={() => removeIpRange(i)}
                    className="flex size-[30px] flex-none items-center justify-center rounded-lg text-neutrals-nickel opacity-55 transition-all hover:bg-hues-salmon hover:text-caution hover:opacity-100"
                  >
                    <Icon name="Close" size={16} />
                  </button>
                </div>
              ))}
              {ip.draft.ranges.length === 0 && (
                <p className="m-0 text-small text-neutrals-nickel">
                  אין עדיין טווחי-IP מוגדרים.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="min-w-0 flex-1">
                <Input
                  dir="ltr"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addIpRange()
                    }
                  }}
                  placeholder="192.168.0.0/24"
                />
              </div>
              <button
                type="button"
                onClick={addIpRange}
                className="flex h-10 flex-none items-center gap-1.5 rounded-xl border-[1.5px] border-accent bg-white px-4 font-semibold text-small text-accent transition-colors hover:bg-hues-sky"
              >
                <Icon name="Plus" size={16} />
                הוסף
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2FA + SESSION TTL CARD */}
      <section className="mb-6 rounded-2xl bg-white px-5 py-1 shadow-card">
        <div className="flex items-center gap-3.5 border-b border-neutrals-whisper py-4">
          <span className="flex size-10 flex-none items-center justify-center rounded-[11px] bg-neutrals-whisper text-neutrals-lead">
            <LockIcon size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-small text-neutrals-charcoal">
              אימות דו-שלבי (2FA)
            </div>
            <div className="mt-0.5 text-tiny text-neutrals-lead">
              חייבו את כל המשתמשים באימות נוסף בכניסה
            </div>
          </div>
          <Toggle
            checked={policy.draft.enforce_2fa}
            onChange={(v) =>
              policy.setDraft({ ...policy.draft, enforce_2fa: v })
            }
          />
        </div>
        <div className="flex items-center gap-3.5 py-4">
          <span className="flex size-10 flex-none items-center justify-center rounded-[11px] bg-neutrals-whisper text-neutrals-lead">
            <Icon name="Clock" size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-small text-neutrals-charcoal">
              תוקף הפעלה (Session)
            </div>
            <div className="mt-0.5 text-tiny text-neutrals-lead">
              משתמש מנותק אוטומטית לאחר חוסר פעילות
            </div>
          </div>
          <div className="flex flex-none overflow-hidden rounded-[11px] border border-neutrals-silver bg-neutrals-whisper">
            {SESSION_TTL_HOURS_OPTIONS.map((hours) => {
              const on = policy.draft.session_ttl_hours === hours
              return (
                <button
                  key={hours}
                  type="button"
                  onClick={() =>
                    policy.setDraft({
                      ...policy.draft,
                      session_ttl_hours: hours,
                    })
                  }
                  className={`px-3.5 py-2 font-sans text-[13.5px] font-semibold transition-colors ${
                    on ? 'bg-accent text-white' : 'text-neutrals-lead'
                  }`}
                >
                  {hours} שעות
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <SaveBar
        visible={isDirty}
        saved={saved}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
