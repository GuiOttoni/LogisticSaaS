"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import OverviewView from "@/components/views/OverviewView";
import RulesView from "@/components/views/RulesView";
import InventoryView from "@/components/views/InventoryView";
import ActorsView from "@/components/views/ActorsView";
import TestLabView from "@/components/views/TestLabView";
import { Activity, Settings, Package, Cpu, RefreshCcw, ShieldAlert, Beaker } from "lucide-react";

const VIEWS: Record<string, { label: string; subtitle: string }> = {
  overview: { label: "Painel de Inteligência", subtitle: "Processando telemetria em tempo real" },
  rules: { label: "Motor de Regras", subtitle: "Configuração de lógica de negócio para o Solver" },
  inventory: { label: "Inventário Global", subtitle: "Visibilidade total da cadeia de suprimentos" },
  actors: { label: "Hierarquia de Atores", subtitle: "Monitorização do sistema de atores Akka.NET" },
  testlab: { label: "Test Lab & Observability", subtitle: "Playground do sistema para testes de estresse em tempo real" }
};

const NAV_ITEMS = [
  { id: "overview", label: "Monitoramento", icon: Activity },
  { id: "rules", label: "Regras de Preço", icon: Settings },
  { id: "inventory", label: "Inventário Global", icon: Package },
  { id: "actors", label: "Status de Atores", icon: Cpu },
  { id: "testlab", label: "Test Lab", icon: Beaker },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [latency, setLatency] = useState(12.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency((prev) => {
        const change = Math.random() * 2 - 1;
        return Math.max(8, Math.min(25, prev + change));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":   return <OverviewView latency={latency} />;
      case "rules":      return <RulesView />;
      case "inventory":  return <InventoryView />;
      case "actors":     return <ActorsView />;
      case "testlab":    return <TestLabView />;
      default:           return <OverviewView latency={latency} />;
    }
  };

  const view = VIEWS[activeTab];

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-64 p-8 min-h-screen">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{view.label}</h2>
            <p className="text-slate-400">{view.subtitle}</p>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg border border-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
            <button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-rose-900/20">
              <ShieldAlert className="w-4 h-4" /> EMERGENCY STOP
            </button>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}
