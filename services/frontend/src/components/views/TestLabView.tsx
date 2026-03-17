"use client";

import { useEffect, useState } from "react";
import { Activity, Play, Settings, ShoppingCart, RefreshCw, Send, Database, Box, ArrowRight, CheckCircle, Smartphone } from "lucide-react";
import { OrdersService, PricingService, CatalogService, IngestionService, Product } from "@/lib/api";

type LogMessage = {
  id: string;
  topic: string;
  timestamp: string;
  payload: any;
};

export default function TestLabView() {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Simulation States
  const [selectedSku, setSelectedSku] = useState("");
  const [eventCount, setEventCount] = useState(5);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await CatalogService.getProducts();
      setProducts(data);
      if (data.length > 0 && !selectedSku) setSelectedSku(data[0].sku);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSku) {
        updatePricePreview();
    }
  }, [selectedSku]);

  const updatePricePreview = async () => {
      const product = products.find(p => p.sku === selectedSku);
      if (!product) return;
      
      try {
          const res = await PricingService.calculatePrice({
              base_price: product.basePrice,
              stock_level: product.stockQuantity,
              sku: selectedSku
          });
          setCurrentPrice(res.calculated_price);
          
          // Predict future price if 10 more sales happen
          const nextRes = await PricingService.calculatePrice({
              base_price: product.basePrice,
              stock_level: Math.max(0, product.stockQuantity - eventCount),
              sku: selectedSku
          });
          setPredictedPrice(nextRes.calculated_price);
      } catch (e) {
          console.error("Pricing preview error", e);
      }
  };

  const handleSimulateIoT = async () => {
    if (!selectedSku) return;
    setIsSimulating(true);
    try {
        const product = products.find(p => p.sku === selectedSku);
        if(!product) return;

        // Send multiple events
        for(let i = 0; i < eventCount; i++) {
            await IngestionService.sendTelemetry({
                skuId: selectedSku,
                warehouseId: "WH-SP-01",
                eventType: "SALE",
                quantityDelta: -1
            });
            // Small delay to see logs flowing
            await new Promise(r => setTimeout(r, 200));
        }
        
        await fetchProducts(); // Refresh stock
        await updatePricePreview(); // Refresh predicted price
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // SSE Toggle
  const toggleKafkaStream = () => {
    if (isListening && eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsListening(false);
    } else {
      const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';
      const es = new EventSource(`${GATEWAY_URL}/stream/kafka`);
      
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLogs((prev) => [
            { id: Math.random().toString(36).substr(2, 9), ...data },
            ...prev,
          ].slice(0, 100)); // Increased log buffer
        } catch (e) { console.error(e); }
      };
      
      es.onerror = (e) => {
        es.close();
        setIsListening(false);
        setEventSource(null);
      };

      setEventSource(es);
      setIsListening(true);
    }
  };

  if (isLoading) return <div className="p-10 text-slate-500">Iniciando laboratório...</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Smartphone className="text-blue-500" /> IoT Device Simulator
          </h2>
          <p className="text-slate-400 text-sm">Simule dispositivos disparando eventos para o pipeline Ingestion ➔ Kafka ➔ Solver ➔ Order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <Box className="w-5 h-5 text-blue-400" /> Dispositivo Virtual
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Produto Alvo (SKU)</label>
                <select 
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                >
                  {products.map(p => (
                      <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Burst de Eventos (Vendas)</label>
                <div className="flex items-center gap-4">
                   <input 
                    type="range" min="1" max="25" 
                    value={eventCount}
                    onChange={(e) => setEventCount(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-white font-mono bg-slate-800 px-3 py-1 rounded-lg w-12 text-center">{eventCount}</span>
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Preço Atual</span>
                    <span className="text-white font-bold">R$ {currentPrice?.toFixed(2) || '0.00'}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Projeção (+{eventCount} vendas)</span>
                    <span className="text-emerald-400 font-bold flex items-center">
                        <ArrowRight className="w-3 h-3 mx-1" />
                        R$ {predictedPrice?.toFixed(2) || '0.00'}
                    </span>
                 </div>
              </div>

              <button 
                onClick={handleSimulateIoT}
                disabled={isSimulating || !selectedSku}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl py-4 font-bold flex justify-center items-center gap-3 transition-all shadow-lg shadow-blue-900/40"
              >
                {isSimulating ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                    <Play className="w-5 h-5 fill-current" />
                )}
                DISPARAR SIMULAÇÃO
              </button>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  Fan-out para Order Service ATIVO
              </div>
              <p className="text-slate-500 leading-relaxed">
                  Cada evento SALE enviado gera uma mensagem no Kafka que é consumida pelo <code>order-service</code> (.NET) para persistência em Supabase.
              </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[600px] shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-white">Live Pipeline Feed</h3>
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
            </div>
            
            <button 
                onClick={toggleKafkaStream}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  isListening 
                  ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
            >
                {isListening ? 'STOP FEED' : 'CONNECT TO KAFKA'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-[11px]">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-40">
                <Activity className="w-12 h-12" />
                <p>Aguardando tráfego no barramento de eventos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border-l-2 border-blue-500/30 pl-4 py-1 animate-in slide-in-from-left-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {log.topic.toUpperCase()}
                      </span>
                      <span className="text-slate-600 text-[9px]">{new Date(parseInt(log.timestamp)).toISOString()}</span>
                    </div>
                    <pre className="text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
