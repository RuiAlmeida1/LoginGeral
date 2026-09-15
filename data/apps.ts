import { Map, Boxes, ClipboardCheck } from "lucide-react";
import type { Application } from "@/types/app";

// Adicionar uma aplicação requer apenas um novo objeto nesta lista.
// O `url` é o endereço aberto ao clicar no cartão (o cartão inteiro é clicável).
export const apps: readonly Application[] = [
  {
    id: "plantas",
    name: "Plantas",
    description: "Gestão de plantas, layouts e modelação de lojas.",
    url: "https://plantas.free-promo.online/",
    icon: Map,
    category: "Modelação",
    status: "online",
    color: "blue",
  },
  {
    id: "economato",
    name: "Economato",
    description: "Gestão de economato, stock e envios para lojas.",
    url: "https://economato.free-promo.online",
    icon: Boxes,
    category: "Logística",
    status: "online",
    color: "green",
  },
  {
    id: "tasktracker",
    name: "TaskTracker",
    description: "Gestão e acompanhamento de tarefas e projetos.",
    url: "https://tasktracker.free-promo.online",
    icon: ClipboardCheck,
    category: "Produtividade",
    status: "online",
    color: "purple",
  },
];
