import {
  LayoutDashboard,
  Grid2X2,
  Star,
  Settings,
  LogOut,
  X,
  ArrowUpRight,
} from "lucide-react";
import type { View } from "@/types/app";
const items = [
  { id: "home", label: "Início", icon: LayoutDashboard },
  { id: "apps", label: "Aplicações", icon: Grid2X2 },
  { id: "favorites", label: "Favoritos", icon: Star },
  { id: "settings", label: "Configurações", icon: Settings },
] as const;
export function Sidebar({
  view,
  onNavigate,
  open,
  onClose,
  count,
}: {
  view: View;
  onNavigate: (view: View) => void;
  open: boolean;
  onClose: () => void;
  count: number;
}) {
  return (
    <>
      <button
        className={`overlay ${open ? "visible" : ""}`}
        onClick={onClose}
        aria-label="Fechar menu"
        tabIndex={open ? 0 : -1}
      />
      <aside id="sidebar" className={`sidebar ${open ? "is-open" : ""}`}>
        <button
          className="brand"
          onClick={() => {
            onNavigate("home");
            onClose();
          }}
          aria-label="Dashboard — início"
        >
          <span className="brand-icon">
            <LayoutDashboard size={23} />
          </span>
          <span>
            <strong>
              Dashboard<span className="brand-dot">.</span>
            </strong>
            <small>Aplicações Internas</small>
          </span>
        </button>
        <button
          className="mobile-close icon-button"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Navegação principal">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              aria-current={view === id ? "page" : undefined}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
              {id === "apps" && <span className="nav-count">{count}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="mini-logo">
              <LayoutDashboard size={16} />
            </span>
            <strong>Tudo no mesmo lugar.</strong>
            <p>As tuas ferramentas, a um clique de distância.</p>
            <span>
              O teu espaço de trabalho <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="user">
            <span className="avatar">RA</span>
            <div>
              <strong>Rui Almeida</strong>
              <small>Workspace pessoal</small>
            </div>
            <button
              disabled
              title="Logout disponível com autenticação"
              className="icon-button"
              aria-label="Logout (indisponível)"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
