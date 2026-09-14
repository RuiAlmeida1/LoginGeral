import { Bell, Menu, Moon, Sun } from "lucide-react";
import { SearchBar } from "./SearchBar";
export function Header({
  query,
  onQuery,
  dark,
  onTheme,
  onMenu,
  menuOpen,
}: {
  query: string;
  onQuery: (value: string) => void;
  dark: boolean;
  onTheme: () => void;
  onMenu: () => void;
  menuOpen: boolean;
}) {
  return (
    <header className="header">
      <div className="header-title">
        <button
          className="mobile-menu icon-button"
          onClick={onMenu}
          aria-label="Abrir menu"
          aria-controls="sidebar"
          aria-expanded={menuOpen}
        >
          <Menu size={21} />
        </button>
        <div>
          <h1>Dashboard</h1>
          <p>Acesso rápido às aplicações</p>
        </div>
      </div>
      <div className="header-actions">
        <SearchBar value={query} onChange={onQuery} />
        <button
          className="icon-button theme-toggle"
          onClick={onTheme}
          aria-label={dark ? "Ativar Light mode" : "Ativar Dark mode"}
          title={dark ? "Light" : "Dark"}
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <details className="notifications">
          <summary className="icon-button" aria-label="Notificações">
            <Bell size={19} />
          </summary>
          <div className="notification-panel">
            <strong>Notificações</strong>
            <p>Não tens novas notificações.</p>
          </div>
        </details>
        <span className="header-divider" />
        <span className="avatar" aria-label="Rui Almeida">
          RA
        </span>
      </div>
    </header>
  );
}
