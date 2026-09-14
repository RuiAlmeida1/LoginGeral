"use client";
import { useEffect, useState } from "react";
import {
  Grid2X2,
  Radio,
  Star,
  ArrowUpRight,
  SlidersHorizontal,
  LayoutGrid,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { apps } from "@/data/apps";
import type { View } from "@/types/app";
import { parseFavorites, usePreference } from "@/hooks/usePreferences";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StatsCard } from "./StatsCard";
import { AppGrid } from "./AppGrid";
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
export function Dashboard() {
  const [view, setView] = useState<View>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas as categorias");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [storedFavorites, setFavorites] = usePreference(
    "dashboard:favorites",
    "[]",
  );
  const [theme, setTheme] = usePreference("dashboard:theme", "light");
  const favorites = parseFavorites(storedFavorites).filter((id) =>
    apps.some((app) => app.id === id),
  );
  const dark = theme === "dark";
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
      if (
        event.key === "/" &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        document
          .querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);
  const showFavorites = view === "favorites" || onlyFavorites;
  const filtered = apps.filter(
    (app) =>
      (!showFavorites || favorites.includes(app.id)) &&
      (category === "Todas as categorias" || app.category === category) &&
      normalize(`${app.name} ${app.description} ${app.category}`).includes(
        normalize(query.trim()),
      ),
  );
  function navigate(next: View) {
    setView(next);
    setOnlyFavorites(false);
    setCategory("Todas as categorias");
    setQuery("");
  }
  function toggle(id: string) {
    setFavorites(
      JSON.stringify(
        favorites.includes(id)
          ? favorites.filter((item) => item !== id)
          : [...favorites, id],
      ),
    );
  }
  return (
    <div className="dashboard-shell">
      <a href="#main" className="skip-link">
        Saltar para o conteúdo
      </a>
      <Sidebar
        view={view}
        onNavigate={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        count={apps.length}
      />
      <div className="main-shell">
        <Header
          query={query}
          onQuery={(value) => {
            setQuery(value);
            if (view === "settings") setView("apps");
          }}
          dark={dark}
          onTheme={() => setTheme(dark ? "light" : "dark")}
          onMenu={() => setMenuOpen(true)}
          menuOpen={menuOpen}
        />
        <main id="main">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {view === "settings"
                ? "Configurações"
                : view === "favorites"
                  ? "Favoritos"
                  : view === "apps"
                    ? "Aplicações"
                    : "Visão geral"}
            </strong>
          </div>
          {view === "settings" ? (
            <section className="settings-panel">
              <span className="eyebrow">O TEU WORKSPACE</span>
              <h2>Configurações</h2>
              <p>Personaliza o teu espaço de trabalho.</p>
              <div className="setting-row">
                <div>
                  <strong>Aparência</strong>
                  <p>Escolhe o tema do dashboard.</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setTheme(dark ? "light" : "dark")}
                >
                  {dark ? "Mudar para Light" : "Mudar para Dark"}
                </button>
              </div>
              <div className="setting-row">
                <div>
                  <strong>Favoritos</strong>
                  <p>
                    {favorites.length} aplicações guardadas neste navegador.
                  </p>
                </div>
                <button
                  className="secondary-button"
                  disabled={!favorites.length}
                  onClick={() => setFavorites("[]")}
                >
                  Limpar favoritos
                </button>
              </div>
              <p className="settings-note">
                As preferências são guardadas apenas neste navegador.
                Autenticação e permissões estarão disponíveis numa fase futura.
              </p>
            </section>
          ) : (
            <>
              <section className="welcome">
                <div>
                  <span className="eyebrow">
                    <span /> O TEU ESPAÇO DE TRABALHO
                  </span>
                  <h2>
                    Olá, Rui <span className="wave">✳</span>
                  </h2>
                  <p>
                    Tudo o que precisas para um dia produtivo, num só lugar.
                  </p>
                </div>
                <span className="workspace-badge">
                  <span className="status-dot" />
                  Workspace pessoal
                </span>
              </section>
              <section
                className="stats-grid"
                aria-label="Resumo das aplicações"
              >
                <StatsCard
                  label="Aplicações"
                  value={apps.length}
                  detail="no teu workspace"
                  icon={Grid2X2}
                  color="blue"
                />
                <StatsCard
                  label="Online"
                  value={apps.filter((app) => app.status === "online").length}
                  detail="disponíveis agora"
                  icon={Radio}
                  color="green"
                />
                <StatsCard
                  label="Favoritas"
                  value={favorites.length}
                  detail="ainda mais perto"
                  icon={Star}
                  color="amber"
                />
              </section>
              <section className="applications">
                <div className="section-heading">
                  <div>
                    <h2>
                      {view === "favorites"
                        ? "As minhas favoritas"
                        : "As minhas aplicações"}{" "}
                      <span>{apps.length}</span>
                    </h2>
                    <p>As ferramentas certas, sempre à mão.</p>
                  </div>
                  <span className="grid-indicator">
                    <LayoutGrid size={17} />
                  </span>
                </div>
                <div className="filter-bar">
                  <div className="tabs" aria-label="Filtrar aplicações">
                    <button
                      className={!showFavorites ? "selected" : ""}
                      onClick={() => {
                        setOnlyFavorites(false);
                        if (view === "favorites") setView("apps");
                      }}
                    >
                      <Grid2X2 size={15} />
                      Todas
                    </button>
                    <button
                      className={showFavorites ? "selected" : ""}
                      onClick={() => setOnlyFavorites(true)}
                    >
                      <Star size={15} />
                      Favoritas <span>{favorites.length}</span>
                    </button>
                  </div>
                  <label className="category-filter">
                    <SlidersHorizontal size={15} />
                    <select
                      aria-label="Filtrar por categoria"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                    >
                      <option>Todas as categorias</option>
                      {[...new Set(apps.map((app) => app.category))].map(
                        (item) => (
                          <option key={item}>{item}</option>
                        ),
                      )}
                    </select>
                    <ChevronDown size={13} />
                  </label>
                </div>
                <AppGrid
                  apps={filtered}
                  favorites={favorites}
                  onToggle={toggle}
                  emptyFavorites={
                    showFavorites && favorites.length === 0 && !query.trim()
                  }
                />
                <p className="results-count" aria-live="polite">
                  A mostrar {filtered.length} de {apps.length} aplicações
                </p>
              </section>
              <aside className="tip">
                <span className="tip-icon">
                  <Sparkles size={21} />
                </span>
                <div>
                  <strong>O teu dashboard, à tua maneira</strong>
                  <p>
                    Marca as aplicações que mais usas como favoritas para as
                    encontrares num instante.
                  </p>
                </div>
                <button onClick={() => navigate("favorites")}>
                  Ver favoritos <ArrowUpRight size={16} />
                </button>
              </aside>
            </>
          )}
          <footer>
            <span>
              Dashboard Geral <span className="footer-dot">·</span> O teu ponto
              de partida.
            </span>
            <span>
              <span className="status-dot" />
              {apps.every((app) => app.status === "online")
                ? "Todas as aplicações online"
                : "Consulta o estado das aplicações"}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
