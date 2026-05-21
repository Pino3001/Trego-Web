interface TextDividerProps {
  texto: string;
  classNameTexto?: string;
  classNameDivider?: string;
}

export default function TextoDivider({
  texto,
  classNameTexto,
  classNameDivider,
}: TextDividerProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 uppercase tracking-widest">
      <div className={`${classNameDivider} flex-1 h-px bg-gray-200`} />
      <span className={classNameTexto}>{texto}</span>
      <div className={`${classNameDivider} flex-1 h-px bg-gray-200`}/>
    </div>
  );
}
