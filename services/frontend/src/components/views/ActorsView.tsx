"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Layers, Activity } from "lucide-react";
import { OrdersService } from "@/lib/api";

const METRICS = [
  { label: "Taxa de Recuperação", value: "99.98%", color: "text-emerald-400", bar: "bg-emerald-500", width: "w-[99%]" },
  { label: "Mailbox Capacity", value: "42%", color: "text-white", bar: "bg-blue-500", width: "w-[42%]" },
  { label: "Restart Rate (Last Hour)", value: "14", color: "text-amber-400", bar: null, width: null, note: "Self-healing active" },
];

export default function ActorsView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ time: string; actors: number }[]>([
    { time: "10:00", actors: 1150000 }, { time: "10:05", actors: 1180000 },
    { time: "10:10", actors: 1210000 }, { time: "10:15", actors: 1250000 },
    { time: "10:20", actors: 1220000 }, { time: "10:25", actors: 1280000 },
  ]);

  useEffect(() => {
    OrdersService.getOrders().then((data) => {
      setOrders(data);
      const sorted = [...data].sort((a, b) =>
        new Date(a.createdAt ?? a.created_at ?? 0).getTime() - new Date(b.createdAt ?? b.created_at ?? 0).getTime()
      );
      const last6 = sorted.slice(-6);
      if (last6.length >= 2) {
        setChartData(last6.map((o, i) => ({
          time: new Date(o.createdAt ?? o.created_at ?? Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actors: 1150000 + (i * 25000) + (o.quantity ?? 1) * 1000
        })));
      }
    }).catch(console.error);
  }, []);

  const activeActors = orders.length > 0 ? 1150000 + orders.length * 8000 : 1280000;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center border-dashed">
        <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Visualizador de Hierarquia de Atores</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Explore o estado de cada ator individual em tempo real. Atualmente gerenciando{" "}
          <span className="font-bold text-blue-400">{activeActors.toLocaleString('pt-BR')}</span> entidades de estoque.
        </p>

        <button
          onClick={async () => {
            const btn = document.getElementById('simulate-btn');
            if (btn) btn.innerText = "Enviando mock request...";
            try {
              const { OrdersService } = await import("@/lib/api");
              await OrdersService.simulateLoad(10);
              if (btn) btn.innerText = "Orders Criadas!";
            } catch (e) {
              console.error(e);
              if (btn) btn.innerText = "Falha ao criar Mock";
            }
            setTimeout(() => {
              if (btn) btn.innerText = "Simular Carga de Pedidos (10x)";
            }, 3000);
          }}
          id="simulate-btn"
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold transition-colors mb-8 shadow-lg shadow-purple-500/20"
        >
          Simular Carga de Pedidos (10x)
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {METRICS.map((m) => (
            <div key={m.label} className="p-4 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 font-bold mb-1 uppercase">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              {m.bar && (
                <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                  <div className={`${m.bar} h-full ${m.width}`} />
                </div>
              )}
              {m.note && <p className="text-[10px] text-slate-500 mt-1">{m.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
        <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" /> Throughput do Cluster Akka
        </h4>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
              <Line type="stepAfter" dataKey="actors" stroke="#a855f7" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
