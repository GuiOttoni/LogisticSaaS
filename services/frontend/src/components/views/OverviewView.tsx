"use client";

import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, ShieldAlert, Zap, Cpu, TrendingUp, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";

const MOCK_DATA = [
  { time: "10:00", price: 150, latency: 12, inventory: 450, actors: 1150000 },
  { time: "10:05", price: 155, latency: 14, inventory: 420, actors: 1180000 },
  { time: "10:10", price: 162, latency: 11, inventory: 380, actors: 1210000 },
  { time: "10:15", price: 158, latency: 15, inventory: 310, actors: 1250000 },
  { time: "10:20", price: 170, latency: 13, inventory: 250, actors: 1220000 },
  { time: "10:25", price: 175, latency: 12, inventory: 180, actors: 1280000 },
];

interface OverviewViewProps {
  latency: number;
}

export default function OverviewView({ latency }: OverviewViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Latência P99 (C++)" value={`${Number(latency).toFixed(2)} ms`} icon={Zap} color="bg-amber-500" trend={-2} />
        <StatCard title="Atores Ativos (Akka)" value="1.2M" icon={Cpu} color="bg-blue-500" trend={12} />
        <StatCard title="Vendas/Hora" value="R$ 842k" icon={TrendingUp} color="bg-emerald-500" trend={5} />
        <StatCard title="Eventos/Seg (Java)" value="42.5k" icon={Activity} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-6 text-white">Fluxo de Preço vs Inventário</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                <Line type="monotone" dataKey="inventory" stroke="#94a3b8" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-4 text-white">Alertas de Sistema</h4>
          <div className="space-y-4">
            <div className="flex gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-200">Ruptura em São Paulo</p>
                <p className="text-xs text-rose-300/70">Produto SKU-992 chegou a zero.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-200">Latência Elevada</p>
                <p className="text-xs text-amber-300/70">Pricing Solver C++ atingiu 18ms.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
