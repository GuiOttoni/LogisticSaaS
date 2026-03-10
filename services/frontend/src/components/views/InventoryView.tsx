"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Globe, Search, Filter } from "lucide-react";

const INVENTORY_DISTRIBUTION = [
  { name: "São Paulo", stock: 4500, capacity: 5000 },
  { name: "Rio de Janeiro", stock: 2800, capacity: 4000 },
  { name: "Curitiba", stock: 1200, capacity: 3000 },
  { name: "Belo Horizonte", stock: 3900, capacity: 4500 },
  { name: "Recife", stock: 800, capacity: 2500 },
];

const LOW_STOCK_ITEMS = [
  { sku: "NIKE-AIR-MAX-90", stock: 12, health: "Critical" },
  { sku: "IPHONE-15-PRO", stock: 45, health: "Warning" },
  { sku: "PS5-SLIM-CONSOLE", stock: 8, health: "Critical" },
  { sku: "SONY-WH-1000XM5", stock: 120, health: "Healthy" },
];

const HEALTH_DOT: Record<string, string> = {
  Critical: "bg-rose-500",
  Warning:  "bg-amber-500",
  Healthy:  "bg-emerald-500",
};

export default function InventoryView() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="inventory-search"
            placeholder="Pesquisar SKU, armazém ou categoria..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
          />
        </div>
        <button className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" /> Distribuição por CD
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INVENTORY_DISTRIBUTION} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={120} />
                <Tooltip cursor={{ fill: "#1e293b" }} contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="stock" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-6 text-white">SKUs com Baixo Estoque</h4>
          <div className="space-y-3">
            {LOW_STOCK_ITEMS.map((item) => (
              <div key={item.sku} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${HEALTH_DOT[item.health]}`} />
                  <span className="text-sm font-bold text-slate-200 font-mono">{item.sku}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold">QTD</p>
                  <p className={`text-sm font-bold ${item.health === "Critical" ? "text-rose-400" : "text-white"}`}>
                    {item.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
