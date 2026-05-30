import TextoDivider from "../TextoDivider.js";

interface SidebarProps{

}

export default function Sidebar({} : SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-trego-restaurante bg-white pt-8 px-4 gap-2">
        <TextoDivider texto="Solicitudes" classNameTexto="font-bold text-trego-restaurante" classNameDivider="bg-trego-restaurante"/>

      <button className="w-full text-center px-4 py-2.5 rounded-4xl bg-trego-restaurante/90 text-white font-semibold text-sm">
        Solicitar Alta
      </button>
    </aside>
  );
}
