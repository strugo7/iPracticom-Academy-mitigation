/**
 * סרגל האישור הדביק (design-export/Policy Viewer.dc.html:152-187). שני מצבים:
 * לא-חתום — DS Checkbox מבוקר-גלילה + רמז + זהות-החותם + כפתור "אשר וחתום"
 * (פעיל רק אחרי גלילה-לסוף + סימון); חתום — אישור הצלחה + הורדת-אישור + סיום.
 * ה-Checkbox הוא רכיב ה-DS (לא role=checkbox ידני — Shira gate #8).
 */
import { useState } from 'react'
import {
  Avatar,
  Button,
  Checkbox,
  Icon,
  initialsFromName,
} from '@/components/ui'
import type { ProcedureAcknowledgement } from '@/types/entities'
import { formatSignedAt } from '../../services/policyViewerService'
import { downloadAcknowledgementCertificate } from '../../services/policyCertificate'

interface AcknowledgeBarProps {
  policyTitle: string
  reachedEnd: boolean
  isSigned: boolean
  acknowledgement: ProcedureAcknowledgement | null
  signerName: string
  signerRole: string
  isSigning: boolean
  onSign: () => void
  onFinish: () => void
}

export function AcknowledgeBar({
  policyTitle,
  reachedEnd,
  isSigned,
  acknowledgement,
  signerName,
  signerRole,
  isSigning,
  onSign,
  onFinish,
}: AcknowledgeBarProps) {
  const [checked, setChecked] = useState(false)
  const canSign = reachedEnd && checked && !isSigning

  return (
    <div className="z-50 flex-none border-t border-neutrals-silver bg-white shadow-[0_-8px_28px_rgba(20,60,110,.08)]">
      <div className="mx-auto max-w-[1080px] px-7 py-3.5">
        {isSigned ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex size-[46px] flex-none items-center justify-center rounded-full bg-hues-mint text-hues-teal">
                <Icon name="SuccessV" size={24} />
              </span>
              <div className="min-w-0">
                <div className="text-body font-semibold text-neutrals-charcoal">
                  אישור הקריאה נחתם בהצלחה
                </div>
                <div className="mt-0.5 text-small text-neutrals-lead">
                  נחתם ע״י{' '}
                  <strong className="text-neutrals-slate">
                    {acknowledgement?.user_name ?? signerName}
                  </strong>{' '}
                  · {formatSignedAt(acknowledgement?.acknowledged_at)} · האישור
                  תועד בדוח המעקב
                </div>
              </div>
            </div>
            <div className="flex flex-none items-center gap-2.5">
              <Button
                variant="white"
                leadingIcon={<Icon name="Export" size={15} />}
                onClick={() =>
                  acknowledgement &&
                  downloadAcknowledgementCertificate(
                    policyTitle,
                    acknowledgement,
                  )
                }
              >
                הורד אישור
              </Button>
              <Button
                variant="primary"
                leadingIcon={<Icon name="ArrowWest" size={15} />}
                onClick={onFinish}
              >
                סיום
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <Checkbox
                checked={checked}
                onChange={setChecked}
                disabled={!reachedEnd}
                label={
                  <span className="text-body font-semibold text-neutrals-charcoal">
                    קראתי, הבנתי ואני מאשר/ת את הנוהל
                  </span>
                }
              />
              <div className="mt-1 flex items-center gap-1.5 ps-9 text-[12.5px] text-neutrals-nickel">
                <Icon
                  name={reachedEnd ? 'Check' : 'ArrowSouth'}
                  size={13}
                  className={reachedEnd ? 'text-hues-teal' : ''}
                />
                {reachedEnd
                  ? 'קראת את כל המסמך'
                  : 'יש לגלול עד סוף המסמך כדי לאשר'}
              </div>
            </div>

            <div className="flex flex-none items-center gap-3">
              <span className="flex items-center gap-2 text-[12.5px] text-neutrals-nickel">
                <Avatar initials={initialsFromName(signerName)} size={30} />
                <span>
                  {signerName}
                  <br />
                  <span className="text-neutrals-palladium">{signerRole}</span>
                </span>
              </span>
              <Button
                variant="primary"
                disabled={!canSign}
                leadingIcon={<Icon name="Edit" size={18} />}
                onClick={onSign}
              >
                אשר וחתום
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
