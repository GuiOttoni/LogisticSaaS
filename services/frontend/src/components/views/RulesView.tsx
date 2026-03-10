"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface Rule {
  id: number;
  name: string;
  trigger: string;
  action: string;
  status: "Ativo" | "Agendado" | "Inativo";
}

const INITIAL_RULES: Rule[] = [
  { id: 1, name: "Estratégia de Escassez", trigger: "Estoque < 15%", action: "Markup +20%", status: "Ativo" },
  { id: 2, name: "Liquidação Noturna", trigger: "Horário > 22:00", action: "Markdown -10%", status: "Agendado" },
  { id: 3, name: "Competição Real-time", trigger: "Preço Concorrente < Min", action: "Match Price", status: "Inativo" },
];

const STATUS_STYLES: Record<Rule["status"], string> = {
  Ativo:    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  Agendado: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  Inativo:  "bg-slate-800 text-slate-500",
};

export default function RulesView() {
  const [rules] = useState<Rule[]>(INITIAL_RULES);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Configuração de Regras Dinâmicas</h3>
        <button
          id="btn-nova-regra"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Regra
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 border-b border-slate-800">
            <tr>
              {["Nome da Regra", "Gatilho (Trigger)", "Ação (Solver C++)", "Status", "Ações"].map((h, i) => (
                <th key={h} className={`px-6 py-4 text-xs font-bold text-slate-400 uppercase ${i === 4 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-900/30 transition-colors group">
                <td className="px-6 py-4 font-medium text-white">{rule.name}</td>
                <td className="px-6 py-4 text-slate-400 font-mono text-sm">{rule.trigger}</td>
                <td className="px-6 py-4 text-blue-400 font-semibold">{rule.action}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[rule.status]}`}>
                    {rule.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    id={`btn-edit-rule-${rule.id}`}
                    className="text-slate-500 hover:text-white transition-colors text-sm"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
