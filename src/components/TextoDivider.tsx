interface TextDividerProps {
  texto: string;
  classNameTexto?: string;
  classNameDivider?: string;
  height?: string
}

export default function TextoDivider({
  texto,
  classNameTexto,
  classNameDivider,
  height = 'h-px',
}: TextDividerProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 uppercase tracking-widest">
      <div className={`flex-1 bg-gray-200 ${height} ${classNameDivider ?? ''}`} />
      <span className={classNameTexto ?? ''}>{texto}</span>
      <div className={`flex-1 bg-gray-200 ${height} ${classNameDivider ?? ''}`} />
    </div>
  );
}
