"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash2, Edit2, Check, X, AlertCircle, TrendingUp, Info } from "lucide-react";
import { PricingService, PricingRule, CatalogService, Product } from "@/lib/api";

export default function RulesView() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<PricingRule> | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rulesData, productsData] = await Promise.all([
        PricingService.getRules(),
        CatalogService.getProducts()
      ]);
      setRules(rulesData);
      setProducts(productsData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingRule) return;
    setIsSaving(true);
    try {
      if (editingRule.id) {
        await PricingService.updateRule(editingRule.id, editingRule);
      } else {
        await PricingService.createRule({
            ...editingRule,
            is_active: editingRule.is_active ?? true,
            priority: editingRule.priority ?? 0,
            conditions: editingRule.conditions ?? {},
            action_logic: editingRule.action_logic ?? {},
            weight: editingRule.weight ?? 1.0,
            multiplier: editingRule.multiplier ?? 1.0,
            base_markup: editingRule.base_markup ?? 0.0
        });
      }
      setEditingRule(null);
      setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to save rule", err);
      alert("Erro ao salvar regra");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta regra?")) return;
    try {
      await PricingService.deleteRule(id);
      await fetchData();
    } catch (err) {
      console.error("Failed to delete rule", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400">Carregando inteligência de preços...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Regras de Precificação Dinâmica</h2>
          <p className="text-slate-400">Gerencie a lógica do motor C++ em tempo real</p>
        </div>
        <button
          onClick={() => {
            setEditingRule({
              name: "",
              target_scope: "GLOBAL",
              multiplier: 1.0,
              base_markup: 0.0,
              weight: 1.0,
              priority: 0,
              is_active: true
            });
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </button>
      </div>

      {showForm && editingRule && (
        <div className="bg-slate-900 border border-blue-500/30 p-6 rounded-xl space-y-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-4">
             <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
             </button>
          </div>
          
          <h3 className="text-lg font-bold text-white flex items-center">
            {editingRule.id ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {editingRule.id ? "Editar Regra" : "Nova Regra de Preço"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Regra</label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={e => setEditingRule({...editingRule, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  placeholder="Ex: Markup de Escassez"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Escopo</label>
                  <select
                    value={editingRule.target_scope}
                    onChange={e => setEditingRule({...editingRule, target_scope: e.target.value as any})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  >
                    <option value="GLOBAL">Global</option>
                    <option value="SKU">Produto (SKU)</option>
                    <option value="CATEGORY">Categoria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Prioridade</label>
                  <input
                    type="number"
                    value={editingRule.priority}
                    onChange={e => setEditingRule({...editingRule, priority: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {editingRule.target_scope !== 'GLOBAL' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    {editingRule.target_scope === 'SKU' ? 'Selecionar Produto' : 'ID da Categoria'}
                  </label>
                  {editingRule.target_scope === 'SKU' ? (
                    <select
                        value={editingRule.target_id}
                        onChange={e => setEditingRule({...editingRule, target_id: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                    >
                        <option value="">Selecione um SKU</option>
                        {products.map(p => (
                            <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>
                        ))}
                    </select>
                  ) : (
                    <input
                        type="text"
                        value={editingRule.target_id}
                        onChange={e => setEditingRule({...editingRule, target_id: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
               <div className="flex items-center text-sm text-blue-400 mb-2">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Parâmetros de Cálculo
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Multiplicador</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingRule.multiplier}
                      onChange={e => setEditingRule({...editingRule, multiplier: parseFloat(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Markup Fixo (R$)</label>
                    <input
                      type="number"
                      step="1"
                      value={editingRule.base_markup}
                      onChange={e => setEditingRule({...editingRule, base_markup: parseFloat(e.target.value)})}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
                    />
                  </div>
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Peso da Regra (Importância)</label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={editingRule.weight}
                  onChange={e => setEditingRule({...editingRule, weight: parseFloat(e.target.value)})}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Suave</span>
                    <span className="text-blue-400 font-bold">{editingRule.weight}x</span>
                    <span>Agressivo</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                 <input
                    type="checkbox"
                    checked={editingRule.is_active}
                    onChange={e => setEditingRule({...editingRule, is_active: e.target.checked})}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-blue-600"
                 />
                 <label className="text-sm font-medium text-white">Regra Ativa</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
            >
              {isSaving ? "Salvando..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Regra
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Nome / Escopo</th>
              <th className="px-6 py-4 font-semibold text-center">Prioridade</th>
              <th className="px-6 py-4 font-semibold text-center">Multiplicador</th>
              <th className="px-6 py-4 font-semibold text-center">Markup</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <Info className="w-8 h-8 mb-2 opacity-20" />
                    <span>Nenhuma regra cadastrada. O motor C++ usará o preço base.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-blue-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{rule.name}</span>
                      <span className="text-xs text-slate-500 flex items-center mt-1">
                        <span className={`px-1.5 py-0.5 rounded mr-2 ${
                            rule.target_scope === 'GLOBAL' ? 'bg-indigo-900/40 text-indigo-400' :
                            rule.target_scope === 'SKU' ? 'bg-amber-900/40 text-amber-400' :
                            'bg-emerald-900/40 text-emerald-400'
                        }`}>
                            {rule.target_scope}
                        </span>
                        {rule.target_id && `ID: ${rule.target_id}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-slate-300 tabular-nums">{rule.priority}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-blue-400 font-bold tabular-nums">{rule.multiplier}x</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-400 font-bold tabular-nums">R$ {rule.base_markup}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      rule.is_active ? 'bg-emerald-900/30 text-emerald-500' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {rule.is_active ? 'Ativo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setShowForm(true);
                        }}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 text-red-400 hover:text-red-300 bg-red-900/20 rounded-lg hover:bg-red-900/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-xl flex gap-6">
          <div className="p-3 bg-blue-600/20 rounded-lg h-fit">
              <AlertCircle className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-1">
              <h4 className="text-white font-medium">Como Funciona o Motor C++?</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                  O Solver avalia as regras por ordem de <strong>prioridade</strong>. Se uma regra de <strong>SKU</strong> for encontrada, ela tem precedência sobre 
                  as globais. O cálculo final segue a fórmula: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-300">(Base + Markup) * Multiplicador</code>.
                  O peso influencia a sensibilidade de novos eventos captados via Kafka.
              </p>
          </div>
      </div>
    </div>
  );
}
