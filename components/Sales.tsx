import React, { useState } from 'react';
import { Product, Sale } from '../types';
import { Plus, Search, Calendar, User, DollarSign, Package } from 'lucide-react';

interface SalesProps {
  products: Product[];
  sales: Sale[];
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
}

export const Sales: React.FC<SalesProps> = ({ products, sales, onAddSale }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const product = products.find(p => p.id === id);
    if (product) {
      setSalePrice(product.suggestedPrice.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (parseInt(quantity) > product.currentStock) {
      alert(`Estoque insuficiente! Apenas ${product.currentStock} disponíveis.`);
      return;
    }

    const qty = parseInt(quantity);
    const price = parseFloat(salePrice);
    const cost = product.costPrice;
    const total = qty * price;
    const profit = (price - cost) * qty;

    const newSale: Omit<Sale, 'id'> = {
      date: new Date(saleDate).toISOString(),
      customerName,
      productId: product.id,
      productName: product.name,
      quantity: qty,
      costAtSale: cost,
      salePrice: price,
      totalValue: total,
      profit: profit
    };

    onAddSale(newSale);
    setIsModalOpen(false);
    
    // Reset essential fields
    setCustomerName('');
    setQuantity('1');
    setSelectedProductId('');
    setSalePrice('');
  };

  const filteredSales = sales.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.productName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate stats for the product selected in the form
  const selectedProductObj = products.find(p => p.id === selectedProductId);
  const projectedProfit = selectedProductObj && salePrice && quantity 
    ? ((parseFloat(salePrice) - selectedProductObj.costPrice) * parseInt(quantity)).toFixed(2)
    : '0.00';
  
  // Max price history for selected product
  const maxPriceSold = selectedProductObj 
    ? sales.filter(s => s.productId === selectedProductId).reduce((max, curr) => curr.salePrice > max ? curr.salePrice : max, 0)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Controle de Vendas</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Nova Venda
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar venda por cliente ou produto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Produto</th>
                <th className="px-6 py-3 text-center">Qtd</th>
                <th className="px-6 py-3 text-right">Preço Venda</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right text-emerald-600">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(sale.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{sale.customerName}</td>
                  <td className="px-6 py-4">{sale.productName}</td>
                  <td className="px-6 py-4 text-center">{sale.quantity}</td>
                  <td className="px-6 py-4 text-right">R$ {sale.salePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-medium">R$ {sale.totalValue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-bold">+ R$ {sale.profit.toFixed(2)}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma venda registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" /> Registrar Venda
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Produto</label>
                <select 
                  required 
                  value={selectedProductId} 
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="">Selecione um produto...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
                      {p.name} (Estoque: {p.currentStock}) {p.currentStock === 0 ? '- Esgotado' : ''}
                    </option>
                  ))}
                </select>
                {selectedProductObj && (
                  <div className="mt-1 text-xs text-slate-500 flex justify-between">
                     <span>Custo: R$ {selectedProductObj.costPrice.toFixed(2)}</span>
                     <span>Maior preço já vendido: {maxPriceSold > 0 ? `R$ ${maxPriceSold.toFixed(2)}` : '-'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full pl-10 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Ana Silva" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input required type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="w-full pl-10 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade</label>
                  <div className="relative">
                     <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                     <input required type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full pl-10 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preço Final (Unitário)</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">R$</span>
                   <input required type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full pl-8 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              
              <div className="bg-emerald-50 p-3 rounded-lg flex justify-between items-center border border-emerald-100">
                <span className="text-sm text-emerald-800 font-medium">Lucro Estimado desta Venda:</span>
                <span className="text-lg font-bold text-emerald-700">R$ {projectedProfit}</span>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md">Confirmar Venda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};