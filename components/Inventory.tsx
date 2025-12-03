import React, { useState } from 'react';
import { Product } from '../types';
import { Plus, Edit2, Trash2, Search, ArrowDown, ArrowUp, PackagePlus } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onAddProduct: (p: Omit<Product, 'id'>) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State (CRUD)
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');

  // Form State (Restock)
  const [restockQty, setRestockQty] = useState('');
  const [restockCost, setRestockCost] = useState('');

  // --- CRUD Logic ---
  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('');
    setCostPrice('');
    setSuggestedPrice('');
    setCurrentStock('');
    setMinStock('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setCostPrice(p.costPrice.toString());
    setSuggestedPrice(p.suggestedPrice.toString());
    setCurrentStock(p.currentStock.toString());
    setMinStock(p.minStock.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name,
      category,
      costPrice: parseFloat(costPrice),
      suggestedPrice: parseFloat(suggestedPrice),
      currentStock: parseInt(currentStock),
      minStock: parseInt(minStock),
      totalSold: editingProduct ? editingProduct.totalSold : 0,
      lastRestockDate: editingProduct ? editingProduct.lastRestockDate : new Date().toISOString().split('T')[0]
    };

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productData });
    } else {
      onAddProduct(productData);
    }
    setIsModalOpen(false);
  };

  // --- Restock Logic ---
  const openRestockModal = (p: Product) => {
    setEditingProduct(p);
    setRestockQty('');
    setRestockCost(p.costPrice.toString()); // Default to current cost
    setIsRestockModalOpen(true);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const qtyToAdd = parseInt(restockQty);
    const newUnitCost = parseFloat(restockCost);
    const currentQty = editingProduct.currentStock;
    const currentUnitCost = editingProduct.costPrice;

    // Weighted Average Cost Calculation
    // ((OldQty * OldCost) + (NewQty * NewCost)) / TotalQty
    const totalQty = currentQty + qtyToAdd;
    let newAverageCost = currentUnitCost;
    
    if (totalQty > 0) {
      newAverageCost = ((currentQty * currentUnitCost) + (qtyToAdd * newUnitCost)) / totalQty;
    }

    onUpdateProduct({
      ...editingProduct,
      currentStock: totalQty,
      costPrice: parseFloat(newAverageCost.toFixed(2)), // Store rounded for simplicity
      lastRestockDate: new Date().toISOString().split('T')[0]
    });

    setIsRestockModalOpen(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Controle de Estoque</h2>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Produto</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3 text-right">Custo Médio</th>
                <th className="px-6 py-3 text-right">Venda (Sug.)</th>
                <th className="px-6 py-3 text-center">Estoque</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isLowStock = product.currentStock <= product.minStock;
                const minMarginPrice = product.costPrice * 1.2; 
                
                return (
                  <tr key={product.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">R$ {product.costPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      R$ {product.suggestedPrice.toFixed(2)}
                      <div className="text-xs text-slate-400 mt-1" title="Preço mínimo sugerido (Custo + 20%)">
                        Min: R$ {minMarginPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{product.currentStock}</td>
                    <td className="px-6 py-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                          <ArrowDown className="w-3 h-3" /> Repor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
                          <ArrowUp className="w-3 h-3" /> OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openRestockModal(product)} 
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Repor Estoque (Entrada)"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                  <input required type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Atual</label>
                  <input required type="number" min="0" value={currentStock} onChange={e => setCurrentStock(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço de Custo</label>
                  <input required type="number" step="0.01" min="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preço Venda (Sug.)</label>
                  <input required type="number" step="0.01" min="0" value={suggestedPrice} onChange={e => setSuggestedPrice(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
                <input required type="number" min="1" value={minStock} onChange={e => setMinStock(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {isRestockModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-emerald-600" />
              Repor Estoque
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Adicionando itens ao produto: <strong>{editingProduct.name}</strong>
            </p>
            
            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade a Adicionar</label>
                <input required type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custo Unitário (desta remessa)</label>
                <input required type="number" step="0.01" min="0" value={restockCost} onChange={e => setRestockCost(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                <p className="text-xs text-slate-500 mt-1">O preço de custo médio do produto será recalculado automaticamente.</p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsRestockModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md">Confirmar Entrada</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};