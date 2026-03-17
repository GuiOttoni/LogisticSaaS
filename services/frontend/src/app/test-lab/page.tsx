"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { Activity, Settings, Package, Cpu, TestTube, Play, Server, ListPlus } from "lucide-react";
import { api, OrdersService, PricingService, CatalogService, IngestionService, type Product } from "@/lib/api";

const NAV_ITEMS = [
  { id: "overview", label: "Monitoramento", icon: Activity, href: "/dashboard" },
  { id: "test", label: "Test Lab", icon: TestTube, href: "/test-lab" }
];

export default function TestLabPage() {
  const [activeTab, setActiveTab] = useState("test");
  const [kafkaEvents, setKafkaEvents] = useState<any[]>([]);
  const [catalogOutput, setCatalogOutput] = useState<string>("Ready.");
  const [productForm, setProductForm] = useState({ sku: "TEST-SKU", name: "Smart Watch", price: 299.99, stock: 100 });
  
  // IoT Simulator State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSku, setSelectedSku] = useState("");
  const [eventCount, setEventCount] = useState(5);
  const [simOutput, setSimOutput] = useState("Simulation idle...");
  const [projectedPrice, setProjectedPrice] = useState<number | null>(null);

  useEffect(() => {
    // Basic SSE implementation to listen to our NestJS Kafka forwarder
    const eventSource = new EventSource("http://localhost:3001/stream/kafka");
    
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setKafkaEvents(prev => [...prev.slice(-49), parsed]); // Keep last 50
      } catch (e) {}
    };

    // Initial fetch of products for the simulator
    CatalogService.getProducts().then(setProducts).catch(console.error);

    return () => {
      eventSource.close();
    };
  }, []);

  const handleCreateProduct = async () => {
    try {
      setCatalogOutput("Creating product...");
      const res = await CatalogService.createProduct({
        sku: productForm.sku,
        name: productForm.name,
        basePrice: parseFloat(productForm.price.toString()),
        stockQuantity: parseInt(productForm.stock.toString())
      });
      setCatalogOutput(JSON.stringify(res, null, 2));
      // Refresh list
      CatalogService.getProducts().then(setProducts);
    } catch (e: any) {
      setCatalogOutput(e.response?.data?.message || e.message);
    }
  };

  const handleListProducts = async () => {
    try {
      setCatalogOutput("Fetching products...");
      const res = await CatalogService.getProducts();
      setProducts(res);
      setCatalogOutput(JSON.stringify(res, null, 2));
    } catch (e: any) {
      setCatalogOutput(e.response?.data?.message || e.message);
    }
  };

  const handleSimulateIoT = async () => {
    if (!selectedSku) return alert("Select a product first!");
    try {
      setSimOutput(`Sending ${eventCount} check-out events...`);
      for (let i = 0; i < eventCount; i++) {
        await IngestionService.sendTelemetry({
          skuId: selectedSku,
          warehouseId: "WH-MAIN-01",
          eventType: "check_out",
          quantityDelta: -1
        });
      }
      setSimOutput("Simulation events sent to Ingestion Service.");
    } catch (e: any) {
      setSimOutput(`Error: ${e.message}`);
    }
  };

  const updatePreview = async (sku: string) => {
    const p = products.find(prod => prod.sku === sku);
    if (!p) return;
    try {
      // Simulate price projection based on 20% stock drop
      const res = await PricingService.calculatePrice({
        base_price: p.basePrice,
        stock_level: (p.stockQuantity - eventCount) / p.stockQuantity,
        sku: p.sku
      });
      setProjectedPrice(res.calculated_price);
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar navItems={NAV_ITEMS} activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-64 p-8 min-h-screen">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <TestTube className="w-8 h-8 text-fuchsia-500" /> Test Lab
          </h2>
          <p className="text-slate-400">Ambiente de teste e simulação de eventos IoT / Kafka</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Center - Catalog */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" /> Webhop / Catalog Management
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} 
                placeholder="SKU" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
              />
              <input 
                value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} 
                placeholder="Product Name" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} 
                placeholder="Base Price" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
              />
              <input 
                type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} 
                placeholder="Stock" className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" 
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

            <div className="bg-slate-950 rounded border border-slate-800 p-3 h-[120px] overflow-y-auto">
              <pre className="text-[10px] text-blue-300 font-mono whitespace-pre-wrap">{catalogOutput}</pre>
            </div>
            
            <hr className="border-slate-800" />
            
            {/* IoT Simulator Card */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-fuchsia-500" /> IoT Device Simulator
              </h3>
              
              <div className="space-y-3 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 uppercase font-bold">Select SKU</label>
                  <select 
                    value={selectedSku} 
                    onChange={e => { setSelectedSku(e.target.value); updatePreview(e.target.value); }}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.sku}>{p.sku} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 uppercase font-bold text-wrap flex justify-between">
                    <span>Events to Send (Sales Sim)</span>
                    <span className="text-fuchsia-400 font-mono">{eventCount}</span>
                  </label>
                  <input 
                    type="range" min="1" max="50" value={eventCount} 
                    onChange={e => { setEventCount(parseInt(e.target.value)); updatePreview(selectedSku); }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                  />
                </div>

                {selectedSku && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 mt-2">
                    <div className="text-center p-2 bg-slate-900 rounded">
                      <p className="text-[10px] text-slate-500 uppercase">Current Price</p>
                      <p className="text-lg font-bold text-white">
                        ${products.find(p => p.sku === selectedSku)?.basePrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded relative overflow-hidden">
                      <p className="text-[10px] text-fuchsia-400 uppercase">Projected Price</p>
                      <p className="text-lg font-bold text-fuchsia-300">
                        {projectedPrice ? `$${projectedPrice.toFixed(2)}` : "..."}
                      </p>
                      <div className="absolute top-0 right-0 p-1 opacity-20"><Activity className="w-4 h-4" /></div>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSimulateIoT}
                  disabled={!selectedSku}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-fuchsia-900/20"
                >
                  <Play className="w-4 h-4 fill-current" /> Blast {eventCount} IoT Events
                </button>

                <div className="text-[10px] font-mono text-emerald-500/80 bg-black/40 p-2 rounded border border-emerald-500/10">
                  {simOutput}
                </div>
              </div>
            </div>
          </div>

          {/* Kafka Log View */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col h-[750px]">
             <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500 animate-pulse" /> Live Kafka Stream
            </h3>
             <p className="text-xs text-slate-500 mb-4 font-mono">TOPICS: [telemetry, inventory-events, order-events]</p>
             
             <div className="flex-1 bg-black rounded-lg border border-slate-800 p-4 font-mono text-xs overflow-y-auto space-y-2 custom-scrollbar">
                {kafkaEvents.length === 0 && <span className="text-slate-600 italic">Aguardando sinais vitais do pipeline...</span>}
                {kafkaEvents.map((evt, i) => (
                  <div key={i} className="border-b border-slate-900 pb-2 hover:bg-slate-950 p-1 rounded transition-colors group">
                    <span className="text-slate-500 font-bold group-hover:text-fuchsia-500">[{new Date(parseInt(evt.timestamp)).toLocaleTimeString()}]</span>
                    <span className="text-blue-400 font-bold ml-2">{evt.topic}:</span>
                    <div className="text-emerald-300 pl-4 mt-1 opacity-90 group-hover:opacity-100">{JSON.stringify(evt.payload, null, 2)}</div>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
