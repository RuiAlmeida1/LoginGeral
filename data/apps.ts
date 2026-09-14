import { Map, Boxes, ClipboardCheck } from "lucide-react";
import type { Application } from "@/types/app";

// Adicionar uma aplicação requer apenas um novo objeto nesta lista.
// Substituir os URLs de exemplo pelos endereços reais antes de utilizar o portal.
export const apps: readonly Application[] = [
  {
    id: "plantas",
    name: "Plantas",
    description: "Gestão de plantas, layouts e modelação de lojas.",
    url: "https://plantas.exemplo.com",
    icon: Map,
    category: "Modelação",
    status: "online",
    color: "blue",
  },
  {
    id: "economato",
    name: "Economato",
    description: "Gestão de economato, stock e envios para lojas.",
    url: "https://economato.exemplo.com",
    icon: Boxes,
    category: "Logística",
    status: "online",
    color: "green",
  },
  {
    id: "tasktracker",
    name: "TaskTracker",
    description: "Gestão e acompanhamento de tarefas e projetos.",
    url: "https://tasktracker.exemplo.com",
    icon: ClipboardCheck,
    category: "Produtividade",
    status: "online",
    color: "purple",
  },
];
