import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
    Activity,
    Database,
    Zap,
    ShieldAlert,
    Settings,
    TrendingUp,
    Package,
    Cpu,
    ChevronRight,
    AlertCircle,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCcw,
    Globe,
    Layers
} from 'lucide-react';

// --- Mock Data ---
const mockData = [
    { time: '10:00', price: 150, latency: 12, inventory: 450, actors: 1150000 },
    { time: '10:05', price: 155, latency: 14, inventory: 420, actors: 1180000 },
    { time: '10:10', price: 162, latency: 11, inventory: 380, actors: 1210000 },
    { time: '10:15', price: 158, latency: 15, inventory: 310, actors: 1250000 },
    { time: '10:20', price: 170, latency: 13, inventory: 250, actors: 1220000 },
    { time: '10:25', price: 175, latency: 12, inventory: 180, actors: 1280000 },
];

const inventoryDistribution = [
    { name: 'São Paulo', stock: 4500, capacity: 5000 },
    { name: 'Rio de Janeiro', stock: 2800, capacity: 4000 },
    { name: 'Curitiba', stock: 1200, capacity: 3000 },
    { name: 'Belo Horizonte', stock: 3900, capacity: 4500 },
    { name: 'Recife', stock: 800, capacity: 2500 },
];

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg hover:border-blue-500/50 transition-all duration-300">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
                {trend !== undefined && (
                    <p className={`text-xs mt-2 ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs última hora
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                {Icon && <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />}
            </div>
        </div>
    </div>
);

// --- View: Overview (Existing) ---
const OverviewView = ({ latency }) => (
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
                        <AreaChart data={mockData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
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

// --- View: Rules Management ---
const RulesView = () => {
    const [rules, setRules] = useState([
        { id: 1, name: 'Estratégia de Escassez', trigger: 'Estoque < 15%', action: 'Markup +20%', status: 'Ativo' },
        { id: 2, name: 'Liquidação Noturna', trigger: 'Horário > 22:00', action: 'Markdown -10%', status: 'Agendado' },
        { id: 3, name: 'Competição Real-time', trigger: 'Preço Concorrente < Min', action: 'Match Price', status: 'Inativo' },
    ]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Configuração de Regras Dinâmicas</h3>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nova Regra
                </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Nome da Regra</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Gatilho (Trigger)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Ação (Solver C++)</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {rules.map(rule => (
                            <tr key={rule.id} className="hover:bg-slate-900/30 transition-colors group">
                                <td className="px-6 py-4 font-medium text-white">{rule.name}</td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-sm">{rule.trigger}</td>
                                <td className="px-6 py-4 text-blue-400 font-semibold">{rule.action}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${rule.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        rule.status === 'Agendado' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                            'bg-slate-800 text-slate-500'
                                        }`}>
                                        {rule.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-500 hover:text-white transition-colors">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- View: Inventory ---
const InventoryView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    placeholder="Pesquisar SKU, armazém ou categoria..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
                />
            </div>
            <button className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
                <Filter className="w-4 h-4" /> Filtros
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" /> Distribuição por CD (Centro de Distribuição)
                </h4>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryDistribution} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                            <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
                            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                            <Bar dataKey="stock" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-hidden">
                <h4 className="font-bold text-lg mb-6 text-white">SKUs com Baixo Estoque</h4>
                <div className="space-y-3">
                    {[
                        { sku: 'NIKE-AIR-MAX-90', stock: 12, health: 'Critical' },
                        { sku: 'IPHONE-15-PRO', stock: 45, health: 'Warning' },
                        { sku: 'PS5-SLIM-CONSOLE', stock: 8, health: 'Critical' },
                        { sku: 'SONY-WH-1000XM5', stock: 120, health: 'Healthy' },
                    ].map(item => (
                        <div key={item.sku} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${item.health === 'Critical' ? 'bg-rose-500' : item.health === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <span className="text-sm font-bold text-slate-200">{item.sku}</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 uppercase font-bold">QTD</p>
                                <p className={`text-sm font-bold ${item.health === 'Critical' ? 'text-rose-400' : 'text-white'}`}>{item.stock}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// --- View: Actor Status (Akka.NET) ---
const ActorsView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center border-dashed">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Visualizador de Hierarquia de Atores</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">Explore o estado de cada ator individual em tempo real. Atualmente gerenciando 1.250.342 entidades de estoque.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase">Taxa de Recuperação</p>
                    <p className="text-2xl font-bold text-emerald-400">99.98%</p>
                    <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[99%]" />
                    </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase">Mailbox Capacity</p>
                    <p className="text-2xl font-bold text-white">42%</p>
                    <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-[42%]" />
                    </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold mb-1 uppercase">Restart Rate (Last Hour)</p>
                    <p className="text-2xl font-bold text-amber-400">14</p>
                    <p className="text-[10px] text-slate-500 mt-1">Self-healing active</p>
                </div>
            </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" /> Throughput do Cluster Akka
            </h4>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                        <Line type="stepAfter" dataKey="actors" stroke="#a855f7" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

// --- Main App Component ---

const App = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [latency, setLatency] = useState(12.4);

    useEffect(() => {
        const interval = setInterval(() => {
            setLatency(prev => {
                const current = typeof prev === 'string' ? parseFloat(prev) : prev;
                const change = (Math.random() * 2 - 1);
                const next = current + change;
                return Math.max(8, Math.min(25, next));
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewView latency={latency} />;
            case 'rules': return <RulesView />;
            case 'inventory': return <InventoryView />;
            case 'actors': return <ActorsView />;
            default: return <OverviewView latency={latency} />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar Navigation */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col gap-8 z-50">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <Zap className="text-white w-5 h-5 fill-current" />
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-white">OmniDynamic</h1>
                </div>

                <nav className="flex flex-col gap-2">
                    {[
                        { id: 'overview', label: 'Monitoramento', icon: Activity },
                        { id: 'rules', label: 'Regras de Preço', icon: Settings },
                        { id: 'inventory', label: 'Inventário Global', icon: Package },
                        { id: 'actors', label: 'Status de Atores', icon: Cpu },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                }`}
                        >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <Database className="w-3 h-3" /> System Health
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span>Kafka Cluster</span>
                            <span className="text-emerald-400 font-bold">Stable</span>
                        </div>
                        <div className="flex justify-between">
                            <span>C++ Solver</span>
                            <span className="text-emerald-400 font-bold">Active</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Java WebFlux</span>
                            <span className="text-emerald-400 font-bold">Non-Blocking</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8 min-h-screen">
                <header className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {activeTab === 'overview' && 'Painel de Inteligência'}
                            {activeTab === 'rules' && 'Motor de Regras'}
                            {activeTab === 'inventory' && 'Inventário Global'}
                            {activeTab === 'actors' && 'Hierarquia de Atores'}
                        </h2>
                        <p className="text-slate-400">
                            {activeTab === 'overview' && 'Processando telemetria em tempo real'}
                            {activeTab === 'rules' && 'Configuração de lógica de negócio para o Solver'}
                            {activeTab === 'inventory' && 'Visibilidade total da cadeia de suprimentos'}
                            {activeTab === 'actors' && 'Monitorização do sistema de atores Akka.NET'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg border border-slate-800">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                        <button className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-rose-900/20">
                            <ShieldAlert className="w-4 h-4" /> EMERGENCY STOP
                        </button>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    );
};

export default App;