interface TutorialHelpButtonProps {
  onClick: () => void
  label?: string
}

export function TutorialHelpButton({
  onClick,
  label = 'מדריך אינטראקטיבי',
}: TutorialHelpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-neutrals-silver bg-white text-neutrals-charcoal shadow-lg transition-all duration-200 hover:scale-105 hover:border-accent hover:shadow-xl active:scale-95 cursor-pointer"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutrals-charcoal text-neutrals-charcoal font-bold text-sm">
        ?
      </div>
    </button>
  )
}
