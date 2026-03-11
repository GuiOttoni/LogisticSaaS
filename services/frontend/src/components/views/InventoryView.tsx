"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Globe, Search, Filter, Plus, Edit2, Package, DollarSign, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CatalogService, Product } from "@/lib/api";

const INVENTORY_DISTRIBUTION = [
  { name: "São Paulo", stock: 4500, capacity: 5000 },
  { name: "Rio de Janeiro", stock: 2800, capacity: 4000 },
  { name: "Curitiba", stock: 1200, capacity: 3000 },
  { name: "Belo Horizonte", stock: 3900, capacity: 4500 },
  { name: "Recife", stock: 800, capacity: 2500 },
];

export default function InventoryView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', basePrice: 0, stockQuantity: 0 });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editType, setEditType] = useState<'price' | 'stock'>('price');
  const [editValue, setEditValue] = useState<number>(0);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await CatalogService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async () => {
    try {
      await CatalogService.createProduct(newProduct);
      setIsAddModalOpen(false);
      setNewProduct({ sku: '', name: '', basePrice: 0, stockQuantity: 0 });
      fetchProducts();
    } catch (error) {
      console.error("Failed to create product", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    try {
      if (editType === 'price') {
        await CatalogService.updatePrice(editingProduct.id, editValue);
      } else {
        const changeAmount = editValue - editingProduct.stockQuantity;
        await CatalogService.updateStock(editingProduct.id, { changeAmount, reason: 'Manual Adjustment' });
      }
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error(`Failed to update ${editType}`, error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await CatalogService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  const openEditModal = (product: Product, type: 'price' | 'stock') => {
    setEditingProduct(product);
    setEditType(type);
    setEditValue(type === 'price' ? product.basePrice : product.stockQuantity);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="inventory-search"
              placeholder="Pesquisar SKU ou nome..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-200"
            />
          </div>
          <button className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors text-slate-200">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4 relative">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <ArrowUpRight className="w-3 h-3" />
                    +12%
                </div>
            </div>
            <div className="relative">
                <h3 className="text-slate-400 text-sm font-medium mb-1">Total de SKUs</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{products.length}</p>
            </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-4 relative">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
            </div>
            <div className="relative">
                <h3 className="text-slate-400 text-sm font-medium mb-1">Valor em Estoque</h3>
                <p className="text-3xl font-bold text-white tracking-tight">
                    R$ {products.reduce((acc, p) => acc + (p.basePrice * p.stockQuantity), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" /> Distribuição por CD
          </h4>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={INVENTORY_DISTRIBUTION} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                 <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                 <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={120} />
                 <Tooltip cursor={{ fill: "#1e293b" }} contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                 <Bar dataKey="stock" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h4 className="font-bold text-lg mb-6 text-white">SKUs com Baixo Estoque</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {products.filter(p => p.stockQuantity < 50).map((item) => (
                <div key={item.sku} className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.stockQuantity < 15 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <span className="text-sm font-bold text-slate-200 font-mono">{item.sku}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold">QTD</p>
                    <p className={`text-sm font-bold ${item.stockQuantity < 15 ? "text-rose-400" : "text-amber-400"}`}>
                      {item.stockQuantity}
                    </p>
                  </div>
                </div>
              ))}
              {products.filter(p => p.stockQuantity < 50).length === 0 && (
                <div className="text-center text-slate-500 py-8 text-sm">
                  Nenhum produto com estoque crítico.
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h4 className="font-bold text-lg text-white">Catálogo de Produtos</h4>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-500/20">
                {products.length} itens
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-300">
              <tr>
                <th className="px-6 py-4">SKU / Produto</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Preço Base</th>
                <th className="px-6 py-4">Data Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-transparent animate-spin"/>
                        Carregando inventário...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum produto cadastrado no catálogo.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-slate-200 font-semibold">{product.sku}</span>
                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-semibold ${product.stockQuantity < 20 ? 'text-rose-400' : 'text-slate-200'}`}>
                          {product.stockQuantity} un
                        </span>
                        <button 
                          onClick={() => openEditModal(product, 'stock')}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-blue-400 transition-all"
                          title="Ajustar Estoque"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-200 font-medium">
                          R$ {product.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button 
                          onClick={() => openEditModal(product, 'price')}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-emerald-400 transition-all"
                          title="Ajustar Preço"
                        >
                          <DollarSign className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 rounded-md text-slate-400 hover:text-rose-400 transition-all"
                        title="Remover Produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Produto */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Novo Produto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 mr-2">SKU</label>
                <input 
                  type="text"
                  value={newProduct.sku}
                  onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                  placeholder="Ex: NIKE-AIR-90"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2 space-x-1">Nome do Produto</label>
                <input 
                  type="text"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Ex: Tênis Nike Air Max 90"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Preço Base (R$)</label>
                  <input 
                    type="number"
                    value={newProduct.basePrice || ''}
                    onChange={e => setNewProduct({...newProduct, basePrice: parseFloat(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Estoque Inicial</label>
                  <input 
                    type="number"
                    value={newProduct.stockQuantity || ''}
                    onChange={e => setNewProduct({...newProduct, stockQuantity: parseInt(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-8">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateProduct}
                disabled={!newProduct.sku || !newProduct.name}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              Ajustar {editType === 'price' ? 'Preço' : 'Estoque'}
            </h3>
            <p className="text-sm text-slate-400 font-mono mb-6">{editingProduct.sku}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                  Novo Valor {editType === 'price' ? '(R$)' : '(Qtd)'}
                </label>
                <input 
                  type="number"
                  value={editValue}
                  onChange={e => setEditValue(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-lg font-medium text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              {editType === 'stock' && (
                <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 flex justify-between">
                   <span>Estoque atual:</span>
                   <span className="font-bold text-slate-200">{editingProduct.stockQuantity} un</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-8">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
