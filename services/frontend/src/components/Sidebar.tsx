"use client";

import { Database, Zap } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ navItems, activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-8 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <Zap className="text-white w-5 h-5 fill-current" />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-white">OmniDynamic</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id
                ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* System Health */}
      <div className="mt-auto bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Database className="w-3 h-3" /> System Health
        </div>
        <div className="space-y-2 text-xs">
          {[
            { label: "Kafka Cluster", status: "Stable", color: "text-emerald-400" },
            { label: "C++ Solver", status: "Active", color: "text-emerald-400" },
            { label: "Java WebFlux", status: "Non-Blocking", color: "text-emerald-400" },
            { label: "Supabase DB", status: "Connected", color: "text-emerald-400" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-slate-400">{item.label}</span>
              <span className={`font-bold ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
