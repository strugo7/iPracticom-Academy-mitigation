import type { CategoryKey } from '../types'

interface HelpCategoryHeroProps {
  categoryKey: CategoryKey
  title: string
  heroText: string
  showNewArticleButton?: boolean
}

export function HelpCategoryHero({
  categoryKey,
  title,
  heroText,
  showNewArticleButton = false,
}: HelpCategoryHeroProps) {
  return (
    <div className="flex flex-col gap-3">
      {showNewArticleButton && (
        <div className="flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-accent text-accent font-semibold text-xs hover:bg-accent/10 transition-all cursor-pointer"
          >
            <span className="text-base font-bold">+</span>
            מאמר חדש בקטגוריה
          </button>
        </div>
      )}

      <section className="relative overflow-hidden rounded-[22px] px-8 py-8 bg-gradient-to-r from-[#33B1FF] to-[#282FEF] text-white shadow-[0_20px_48px_rgba(0,117,219,0.24)] flex flex-wrap items-center justify-between gap-6">
        <div className="relative z-10 flex-1 min-w-[220px] max-w-[480px]">
          <h2 className="m-0 text-2xl sm:text-3xl font-semibold leading-tight text-white mb-2.5">
            {title}
          </h2>
          <p className="m-0 text-sm sm:text-base text-white/90 leading-relaxed">
            {heroText}
          </p>
        </div>

        {/* האנימציה החזותית המותאמת לכל קטגוריה */}
        <div className="relative z-10 flex-none w-[172px] h-[150px] flex items-center justify-center">
          {categoryKey === 'overview' && (
            <div className="flex flex-col items-center justify-center gap-1.5 w-full h-full">
              <div className="w-[160px] h-[34px] border-2 border-white/85 rounded-lg flex items-center justify-center text-xs font-semibold text-white animate-pulse">
                מסלול
              </div>
              <div className="w-[132px] h-[30px] border-2 border-white/75 rounded-lg flex items-center justify-center text-xs font-semibold text-white animate-pulse delay-100">
                מודול
              </div>
              <div className="w-[104px] h-[26px] border-2 border-white/65 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white animate-pulse delay-200">
                נושא
              </div>
              <div className="w-[76px] h-[22px] border-2 border-white/55 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white animate-pulse delay-300">
                שיעור
              </div>
            </div>
          )}

          {categoryKey === 'users' && (
            <div className="w-full h-full grid grid-cols-2 gap-2 content-center">
              <div className="bg-white/15 border border-white/50 rounded-xl p-2 text-center text-xs font-semibold text-white animate-pulse">
                משתמש
              </div>
              <div className="bg-white/15 border border-white/50 rounded-xl p-2 text-center text-xs font-semibold text-white animate-pulse delay-100">
                מדריך
              </div>
              <div className="bg-white/15 border border-white/50 rounded-xl p-2 text-center text-xs font-semibold text-white animate-pulse delay-200">
                מנהל
              </div>
              <div className="bg-white/15 border border-white/50 rounded-xl p-2 text-center text-xs font-semibold text-white animate-pulse delay-300">
                מנהל מערכת
              </div>
            </div>
          )}

          {categoryKey === 'content' && (
            <div className="w-full h-full flex flex-col gap-2 justify-center">
              <div className="h-6 rounded-lg bg-white/85 animate-bounce" />
              <div className="h-6 w-[88%] rounded-lg bg-white/65 animate-bounce delay-100" />
              <div className="h-6 w-[96%] rounded-lg bg-white/45 animate-bounce delay-200" />
              <div className="h-6 w-[70%] rounded-lg bg-white/30 animate-bounce delay-300" />
            </div>
          )}

          {categoryKey === 'troubleshoot' && (
            <svg viewBox="0 0 172 150" className="w-full h-full">
              <path
                d="M20 20 L86 75 L152 20 M86 75 L86 130"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                strokeDasharray="4 5"
              />
              <circle
                cx="20"
                cy="20"
                r="10"
                fill="#fff"
                className="animate-ping"
              />
              <circle
                cx="152"
                cy="20"
                r="10"
                fill="#fff"
                className="opacity-70"
              />
              <circle
                cx="86"
                cy="75"
                r="11"
                fill="#fff"
                className="opacity-90"
              />
              <circle
                cx="86"
                cy="130"
                r="10"
                fill="#fff"
                className="opacity-60"
              />
            </svg>
          )}

          {categoryKey === 'dashboard' && (
            <div className="w-full h-full flex items-end justify-center gap-3">
              <div className="w-5 h-[80px] rounded-t-md bg-white/55 animate-pulse" />
              <div className="w-5 h-[110px] rounded-t-md bg-white/85 animate-pulse delay-100" />
              <div className="w-5 h-[60px] rounded-t-md bg-white/40 animate-pulse delay-200" />
              <div className="w-5 h-[95px] rounded-t-md bg-white/65 animate-pulse delay-300" />
            </div>
          )}

          {categoryKey === 'security' && (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              <svg
                viewBox="0 0 24 24"
                width="76"
                height="76"
                fill="rgba(255,255,255,0.16)"
                stroke="#fff"
                strokeWidth="1.6"
                className="animate-pulse"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div className="absolute left-1/2 top-1/2 w-16 h-0.5 bg-white/90 -translate-x-1/2 -translate-y-1/2 animate-ping" />
            </div>
          )}

          {categoryKey === 'profile' && (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                viewBox="0 0 120 120"
                width="120"
                height="120"
                className="-rotate-90"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="11"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray="326.73"
                  strokeDashoffset="90"
                  className="transition-all duration-1000"
                />
              </svg>
            </div>
          )}
        </div>

        {/* רקע פוליגון עדין במעטפת */}
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="absolute width-[280px] height-[280px] -top-24 -left-16 opacity-20 pointer-events-none"
        >
          <polygon
            points="50,2 92,26 92,74 50,98 8,74 8,26"
            fill="none"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </section>
    </div>
  )
}
