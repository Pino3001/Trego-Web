export interface SidebarItem {
  label: string;
  path?: string;        // opcional para items deshabilitados
  end?: boolean;
  badge?: number;
  disabled?: boolean;
}

export interface SidebarSection {
  section: string;
  items: SidebarItem[];
}