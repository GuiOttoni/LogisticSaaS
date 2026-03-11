"use client";

import { useState, useEffect } from "react";
import { Plus, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { PricingService } from "@/lib/api";

export default function RulesView() {
  const [basePrice, setBasePrice] = useState(15.0);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.2);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch true configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const config = await PricingService.getConfig();
        if (config) {
          setBasePrice(config.basePrice || 15.0);
          setSurgeMultiplier(config.surgeMultiplier || 1.2);
        }
      } catch (err) {
        console.error("Failed to load pricing config", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await PricingService.updateConfig({ basePrice, surgeMultiplier });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save pricing config", err);
      alert("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-slate-400">Carregando regras...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Form */}
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-6">Configuração Global</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Preço Base por KM (BRL)
            </label>
            <div className="flex items-center">
              <span className="text-slate-500 mr-3">R$</span>
              <input
                type="number"
                step="0.1"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Multiplicador de Surge (Demanda vs Frota)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={surgeMultiplier}
                onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <span className="text-xl font-bold text-blue-400 w-12">
                {surgeMultiplier.toFixed(1)}x
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {showSuccess ? (
              <div className="flex items-center text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Sincronizado no Redis
              </div>
            ) : (
              <div className="text-sm text-slate-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Afeta novos cálculos imediatamente
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center px-6 py-2 rounded-lg font-medium transition-all ${
                isSaving ? "bg-slate-800 text-slate-400" : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isSaving ? "Aplicando..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Regras
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Simulator / Visualizer */}
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl flex flex-col">
        <h3 className="text-xl font-bold text-white mb-6">Simulador Automático</h3>
        <p className="text-slate-400 text-sm mb-6">
          Veja o impacto das regras atuais sobre tarifas de rotas comuns (estimativa baseada apenas na distância)
        </p>

        <div className="flex flex-col gap-4 text-sm">
          {[
            { tag: "Curta (<5km)", dist: 4.5 },
            { tag: "Média (5-15km)", dist: 12.0 },
            { tag: "Longa (>15km)", dist: 34.0 }
          ].map((item, idx) => (
             <div key={idx} className="flex justify-between items-center bg-slate-950 p-4 border border-slate-800 rounded-lg">
                <span className="text-slate-300">{item.tag} - {item.dist}km</span>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-white">R$ {(basePrice * parseInt(item.dist.toString(), 10) * surgeMultiplier).toFixed(2)}</span>
                    <span className="text-xs text-slate-500">Sem taxa base fixa</span>
                </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
