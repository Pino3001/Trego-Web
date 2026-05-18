export default function SectionRow({ titulo, children, accion }) {
  return (
    <section className="mb-7">
      <header className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-[17px] font-bold text-gray-900">{titulo}</h2>
        {accion}
      </header>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-thin">
        {children}
      </div>
    </section>
  )
}
