import type { LucideIcon } from "lucide-react";

export type AppStatus = "online" | "maintenance" | "offline";
export interface Application {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: LucideIcon;
  category: string;
  status: AppStatus;
  color: "blue" | "green" | "purple";
}
export type View = "home" | "apps" | "favorites" | "settings";
