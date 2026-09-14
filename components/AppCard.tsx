import { ArrowUpRight, Star } from "lucide-react";
import type { Application } from "@/types/app";
const statuses = {
  online: "Online",
  offline: "Offline",
  maintenance: "Manutenção",
};
export function AppCard({
  app,
  favorite,
  onToggle,
}: {
  app: Application;
  favorite: boolean;
  onToggle: (id: string) => void;
}) {
  const Icon = app.icon;
  return (
    <article className={`app-card ${app.color}`}>
      <div className="card-top">
        <span className="app-icon">
          <Icon size={28} strokeWidth={1.6} />
        </span>
        <button
          className={`favorite-button ${favorite ? "selected" : ""}`}
          aria-label={`${favorite ? "Remover" : "Adicionar"} ${app.name} ${favorite ? "dos" : "aos"} favoritos`}
          aria-pressed={favorite}
          onClick={() => onToggle(app.id)}
        >
          <Star size={19} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <span className="category">{app.category}</span>
      <h3>
        <a href={app.url}>{app.name}</a>
      </h3>
      <p>{app.description}</p>
      <div className="card-footer">
        <span className={`status ${app.status}`}>
          <i />
          {statuses[app.status]}
        </span>
        <span className="open-app">
          Abrir aplicação <ArrowUpRight size={17} />
        </span>
      </div>
    </article>
  );
}
