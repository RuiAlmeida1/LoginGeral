import { SearchX, Star } from "lucide-react";
import type { Application } from "@/types/app";
import { AppCard } from "./AppCard";
export function AppGrid({
  apps,
  favorites,
  onToggle,
  emptyFavorites,
}: {
  apps: readonly Application[];
  favorites: string[];
  onToggle: (id: string) => void;
  emptyFavorites: boolean;
}) {
  if (!apps.length)
    return (
      <div className="empty-state" role="status">
        {emptyFavorites ? <Star size={30} /> : <SearchX size={30} />}
        <h3>
          {emptyFavorites
            ? "Ainda não adicionaste aplicações aos favoritos."
            : "Nenhuma aplicação encontrada."}
        </h3>
        <p>
          {emptyFavorites
            ? "Clica na estrela de uma aplicação para a guardar aqui."
            : "Experimenta outro nome, descrição ou categoria."}
        </p>
      </div>
    );
  return (
    <div className="app-grid">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          favorite={favorites.includes(app.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
