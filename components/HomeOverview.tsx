import { ArrowUpRight, FolderOpen, Star } from "lucide-react";
import { apps } from "@/data/apps";

export function HomeOverview({
  favorites,
  onBrowse,
  onFavorites,
}: {
  favorites: string[];
  onBrowse: (category?: string) => void;
  onFavorites: () => void;
}) {
  const saved = apps.filter((app) => favorites.includes(app.id));
  return (
    <section className="home-overview">
      <div className="home-feature">
        <div>
          <span className="eyebrow">PRONTO PARA COMEÇAR?</span>
          <h2>
            As tuas ferramentas.
            <br />
            Um único ponto de partida.
          </h2>
          <p>
            Explora o catálogo e encontra a aplicação certa para cada tarefa.
          </p>
          <button className="primary-button" onClick={() => onBrowse()}>
            Explorar aplicações <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="home-category-list">
          {[...new Set(apps.map((app) => app.category))].map((category) => (
            <button key={category} onClick={() => onBrowse(category)}>
              <FolderOpen size={20} />
              <span>
                {category}
                <small>
                  {apps.filter((app) => app.category === category).length}{" "}
                  aplicação
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className="section-heading">
        <div>
          <h2>Os teus atalhos</h2>
          <p>Acesso direto às aplicações que guardaste.</p>
        </div>
        <button className="secondary-button" onClick={onFavorites}>
          Gerir favoritos
        </button>
      </div>
      {saved.length ? (
        <div className="home-shortcuts">
          {saved.map((app) => {
            const Icon = app.icon;
            return (
              <a key={app.id} href={app.url}>
                <Icon size={23} />
                <span>
                  {app.name}
                  <small>{app.category}</small>
                </span>
                <ArrowUpRight size={17} />
              </a>
            );
          })}
        </div>
      ) : (
        <div className="home-empty">
          <Star size={23} />
          <div>
            <strong>As tuas favoritas começam aqui</strong>
            <p>
              Marca a estrela de uma aplicação no catálogo para criar o teu
              acesso rápido.
            </p>
          </div>
          <button className="secondary-button" onClick={() => onBrowse()}>
            Escolher aplicações
          </button>
        </div>
      )}
    </section>
  );
}
