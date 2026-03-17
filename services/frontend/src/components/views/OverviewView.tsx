"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, ShieldAlert, Zap, Cpu, TrendingUp, Activity, RefreshCw } from "lucide-react";
import StatCard from "@/components/StatCard";
import { OrdersService, CatalogService, PricingService, Product } from "@/lib/api";

interface OverviewViewProps {
  latency: number;
}

export default function OverviewView({ latency }: OverviewViewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const [activeActors, setActiveActors] = useState(1280000);
  const [eventsSec, setEventsSec] = useState(42.5);

  const fetchData = async () => {
    try {
      if(isLoading) setIsLoading(true);
      const [pData, oData] = await Promise.all([
        CatalogService.getProducts(),
        OrdersService.getOrders()
      ]);
      setProducts(pData);
      setOrders(oData);
      
      // Transform orders into chart data (simplified grouping by time)
      // .NET Order Service serializes PascalCase → camelCase: totalPrice, createdAt, sku
      const sortedOrders = [...oData].sort((a,b) => new Date(a.createdAt ?? a.created_at).getTime() - new Date(b.createdAt ?? b.created_at).getTime());
      const last6 = sortedOrders.slice(-6).map(o => ({
          time: new Date(o.createdAt ?? o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: o.totalPrice ?? o.total_price ?? 0,
          inventory: pData.find(p => p.sku === o.sku)?.stockQuantity || 0
      }));
      
      if(last6.length > 0) setChartData(last6);
      else {
          // Fallback if no orders yet
          setChartData([
            { time: "00:00", price: 0, inventory: pData.reduce((acc, p) => acc + p.stockQuantity, 0) }
          ]);
      }

    } catch (err) {
      console.error("Overview fetch error", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(() => {
        fetchData();
    }, 10000);
    return () => clearInterval(i);
  }, []);

  const totalSales = orders.reduce((acc, o) => acc + (o.totalPrice ?? o.total_price ?? 0), 0);
  const stockLevel = products.reduce((acc, p) => acc + p.stockQuantity, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Latência P99 (C++)" value={`${Number(latency).toFixed(2)} ms`} icon={Zap} color="bg-amber-500" trend={-2} />
        <StatCard title="Atores Ativos (Akka)" value={`${(activeActors / 1000000).toFixed(2)}M`} icon={Cpu} color="bg-blue-500" trend={12} />
        <StatCard title="Receita Total (Live)" value={`R$ ${(totalSales/1000).toFixed(1)}k`} icon={TrendingUp} color="bg-emerald-500" trend={5} />
        <StatCard title="Estoque Total" value={`${stockLevel}`} icon={Activity} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h4 className="font-bold text-lg text-white">Fluxo de Últimas Transações</h4>
             {isLoading && <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />}
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                <Area type="monotone" dataKey="price" name="Valor Pedido" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                <Line type="monotone" dataKey="inventory" name="Nível Estoque (SKU)" stroke="#94a3b8" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-4 text-white">Alertas em Tempo Real</h4>
          <div className="space-y-4">
            {products.filter(p => p.stockQuantity < 10).map(p => (
                <div key={p.sku} className="flex gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-pulse">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-rose-200">Ruptura: {p.sku}</p>
                        <p className="text-xs text-rose-300/70">Estoque crítico: {p.stockQuantity} un em SP.</p>
                    </div>
                </div>
            ))}
            
            {latency > 15 && (
                <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-200">Latência Elevada</p>
                        <p className="text-xs text-amber-300/70">Pricing Solver C++ operando em {latency.toFixed(1)}ms.</p>
                    </div>
                </div>
            )}

            {products.filter(p => p.stockQuantity < 10).length === 0 && latency <= 15 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mb-2 text-emerald-500 opacity-50" />
                    <p className="text-sm">Sistema operando normalmente</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
        </svg>
    );
}
