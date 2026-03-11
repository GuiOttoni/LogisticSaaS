"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Activity, Settings, Package, Cpu, TestTube, Play, Server, ListPlus } from "lucide-react";
import { api, OrdersService, PricingService } from "@/lib/api";

const NAV_ITEMS = [
  { id: "overview", label: "Monitoramento", icon: Activity, href: "/dashboard" },
  { id: "test", label: "Test Lab", icon: TestTube, href: "/test-lab" }
];

export default function TestLabPage() {
  const [activeTab, setActiveTab] = useState("test");
  const [kafkaEvents, setKafkaEvents] = useState<any[]>([]);
  const [catalogOutput, setCatalogOutput] = useState<string>("Ready.");
  const [productForm, setProductForm] = useState({ sku: "TEST-SKU", name: "Smart Watch", price: 299.99, stock: 100 });

  useEffect(() => {
    // Basic SSE implementation to listen to our NestJS Kafka forwarder
    const eventSource = new EventSource("http://localhost:3001/stream/kafka");
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setKafkaEvents(prev => [...prev.slice(-49), parsed]); // Keep last 50
      } catch (e) {}
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleCreateProduct = async () => {
    try {
      setCatalogOutput("Creating product...");
      const res = await api.post('/catalog/products', {
        sku: productForm.sku,
        name: productForm.name,
        basePrice: parseFloat(productForm.price.toString()),
        stockQuantity: parseInt(productForm.stock.toString())
      });
      setCatalogOutput(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      setCatalogOutput(e.response?.data?.message || e.message);
    }
  };

  const handleListProducts = async () => {
    try {
      setCatalogOutput("Fetching products...");
      const res = await api.get('/catalog/products');
      setCatalogOutput(JSON.stringify(res.data, null, 2));
    } catch (e: any) {
      setCatalogOutput(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-64 p-8 min-h-screen">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <TestTube className="w-8 h-8 text-fuchsia-500" /> Test Lab
          </h2>
          <p className="text-slate-400">Ambiente de teste e monitoramento das filas do Kafka ("Observability")</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Center */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" /> Catalog Service (.NET 8)
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} 
                placeholder="SKU" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" 
              />
              <input 
                value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} 
                placeholder="Product Name" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" 
              />
              <input 
                type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} 
                placeholder="Base Price" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" 
              />
              <input 
                type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} 
                placeholder="Stock" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" 
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleCreateProduct} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <ListPlus className="w-4 h-4" /> Criar Produto
              </button>
              <button onClick={handleListProducts} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                Listar Produtos
              </button>
            </div>

            <div className="bg-slate-950 rounded border border-slate-800 p-3 h-[180px] overflow-y-auto">
              <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap">{catalogOutput}</pre>
            </div>
            
            <hr className="border-slate-800" />
            <h3 className="text-xl font-bold text-white flex items-center gap-2 pt-2">
              <Play className="w-5 h-5 text-emerald-500" /> Outros Microserviços
            </h3>

             <button onClick={() => OrdersService.simulateLoad(1)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                Gerar Order Falsa (Order-Service)
             </button>
          </div>

          {/* Kafka Log View */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col h-[600px]">
             <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500 animate-pulse" /> Live Kafka Stream
            </h3>
             <p className="text-xs text-slate-500 mb-4">Ouvindo `inventory-events` e `order-events`</p>
             
             <div className="flex-1 bg-black rounded-lg border border-slate-800 p-4 font-mono text-xs overflow-y-auto space-y-2">
                {kafkaEvents.length === 0 && <span className="text-slate-600">Aguardando eventos...</span>}
                {kafkaEvents.map((evt, i) => (
                  <div key={i} className="border-b border-slate-900 pb-2">
                    <span className="text-fuchsia-500 font-bold">[{new Date(parseInt(evt.timestamp)).toLocaleTimeString()}]</span>
                    <span className="text-blue-400 font-bold ml-2">{evt.topic}:</span>
                    <div className="text-emerald-300 pl-4">{JSON.stringify(evt.payload, null, 2)}</div>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
