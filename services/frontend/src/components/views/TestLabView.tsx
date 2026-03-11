"use client";

import { useEffect, useState } from "react";
import { Activity, Play, Settings, ShoppingCart, RefreshCw, Send, Database } from "lucide-react";
import { OrdersService, PricingService, CatalogService } from "@/lib/api";

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

  // Playground States
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [skuTarget, setSkuTarget] = useState("SKU-992");

  const [simulating, setSimulating] = useState(false);

  // Toggle SSE
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
          ].slice(0, 50)); // Keep only last 50 logs
        } catch (e) {
          console.error("Error parsing SSE data", e);
        }
      };
      
      es.onerror = (e) => {
        console.error("SSE Error", e);
        es.close();
        setIsListening(false);
        setEventSource(null);
      };

      setEventSource(es);
      setIsListening(true);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const handleUpdateConfig = async () => {
    try {
      await PricingService.updateConfig({ basePrice: 100, surgeMultiplier });
      alert("Configuração de pricing atualizada!");
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar config.");
    }
  };

  const handleSimulateOrders = async () => {
    try {
      setSimulating(true);
      await OrdersService.simulateLoad(orderQuantity);
      alert("Simulação de pedidos enviada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao simular pedidos.");
    } finally {
      setSimulating(false);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-purple-500" /> System Test Lab
          </h2>
          <p className="text-slate-400 text-sm">Playground para testar serviços e observar eventos Kafka.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="space-y-6">
          
          {/* Order Simulation Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-blue-400" /> Simular Pedidos
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Público Alvo (SKU)</label>
                <input 
                  type="text" 
                  value={skuTarget}
                  onChange={(e) => setSkuTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Qtd. de Transações</label>
                <div className="flex items-center gap-2">
                   <input 
                    type="range" 
                    min="1" max="100" 
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded w-12 text-center">{orderQuantity}</span>
                </div>
              </div>
              <button 
                onClick={handleSimulateOrders}
                disabled={simulating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium flex justify-center items-center gap-2 transition-all"
              >
                {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Disparar Teste de Carga
              </button>
            </div>
          </div>

          {/* Pricing Adjust Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-emerald-400" /> Controle de Pricing
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Multiplicador de Demanda (Surge)</label>
                <div className="flex items-center gap-2">
                   <input 
                    type="range" 
                    min="0.5" max="3" step="0.1"
                    value={surgeMultiplier}
                    onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded w-16 text-center">
                    {surgeMultiplier.toFixed(1)}x
                  </span>
                </div>
              </div>
              <button 
                onClick={handleUpdateConfig}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-lg py-2 text-sm font-medium transition-all"
              >
                Atualizar Global Solver
              </button>
            </div>
          </div>
          
          {/* Catalog Tool Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-orange-400" /> Ferramenta de Catálogo
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
              <input 
                  type="text" 
                  value={skuTarget}
                  disabled
                  title="SKU Herdada da configuração acima"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white opacity-50"
                  />
               <button 
                  onClick={async () => {
                     try {
                        const newProd = await CatalogService.createProduct({
                         sku: skuTarget,
                         name: "Produto Teste",
                         basePrice: 100,
                         stockQuantity: 1000
                       });
                       alert(`Produto criado! ID: ${newProd.id}`);
                     } catch(e) {
                        alert("Produto já existe ou erro: " + e)
                     }
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg py-2 text-sm font-medium transition-all"
                >
                  Criar Produto c/ Estoque
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Logs Column */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[600px] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="p-4 border-b border-slate-800 flex justify-between items-center relative z-10 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-white hidden sm:block">Kafka Event Stream</h3>
              
              {isListening ? (
                <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Conectado (SSE)
                </span>
              ) : (
                <span className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
                  <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                  Desconectado
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={clearLogs}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Limpar Console"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={toggleKafkaStream}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isListening 
                  ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isListening ? 'Interromper' : 'Conectar Stream'}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar font-mono text-xs relative z-10">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                <Send className="w-8 h-8 opacity-20" />
                <p>Nenhum evento capturado. Conecte ao stream para ouvir mensagens.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-300">
                    <div className="flex justify-between items-center mb-2 text-[10px]">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        log.topic.includes('inventory') ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {log.topic}
                      </span>
                      <span className="text-slate-500">{new Date(parseInt(log.timestamp)).toLocaleTimeString('pt-BR', { fractionalSecondDigits: 3 })}</span>
                    </div>
                    <pre className="text-[11px] overflow-x-auto text-emerald-400/90 whitespace-pre-wrap">
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
