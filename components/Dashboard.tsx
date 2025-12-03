import React, { useMemo, useState, useEffect } from 'react';
import { Product, Sale } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { TrendingUp, AlertTriangle, Package, DollarSign, RefreshCw, Sparkles } from 'lucide-react';
import { getBusinessInsights } from '../services/geminiService';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

export const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  const [insights, setInsights] = useState<{stockAlert: string, salesInsight: string, actionTip: string} | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // KPIs
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalValue, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
  const totalItemsSold = sales.reduce((acc, s) => acc + s.quantity, 0);

  // Chart Data Preparation
  const salesByDate = useMemo(() => {
    const grouped: Record<string, number> = {};
    sales.forEach(s => {
      const date = new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      grouped[date] = (grouped[date] || 0) + s.totalValue;
    });
    return Object.entries(grouped).map(([date, value]) => ({ date, value })).slice(-7); // Last 7 entries
  }, [sales]);

  const topProducts = useMemo(() => {
    const grouped: Record<string, number> = {};
    sales.forEach(s => {
      grouped[s.productName] = (grouped[s.productName] || 0) + s.quantity;
    });
    return Object.entries(grouped)
      .map(([name, qtd]) => ({ name, qtd }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);
  }, [sales]);

  const handleRefreshInsights = async () => {
    setLoadingInsights(true);
    const result = await getBusinessInsights(products, sales);
    setInsights(result);
    setLoadingInsights(false);
  };

  useEffect(() => {
    // Initial load of insights if not present
    if (!insights && products.length > 0) {
      handleRefreshInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Receita Total</p>
            <h3 className="text-2xl font-bold text-emerald-600">R$ {totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-emerald-100 rounded-full">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Lucro Líquido</p>
            <h3 className="text-2xl font-bold text-indigo-600">R$ {totalProfit.toFixed(2)}</h3>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Itens em Alerta</p>
            <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-500' : 'text-slate-700'}`}>
              {lowStockCount}
            </h3>
          </div>
          <div className={`p-3 rounded-full ${lowStockCount > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-600'}`} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Itens Vendidos</p>
            <h3 className="text-2xl font-bold text-blue-600">{totalItemsSold}</h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="flex justify-between items-start relative z-10 mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Insights Inteligentes (Gemini AI)
          </h2>
          <button 
            onClick={handleRefreshInsights}
            disabled={loadingInsights}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingInsights ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {loadingInsights ? (
          <div className="flex items-center gap-2 text-white/80">
             <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
             <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
             <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             <span className="text-sm">Analisando dados...</span>
          </div>
        ) : insights ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-xs font-semibold text-white/70 uppercase mb-1">📦 Estoque</p>
              <p className="text-sm font-medium">{insights.stockAlert}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-xs font-semibold text-white/70 uppercase mb-1">📈 Vendas</p>
              <p className="text-sm font-medium">{insights.salesInsight}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <p className="text-xs font-semibold text-white/70 uppercase mb-1">💡 Dica de Ouro</p>
              <p className="text-sm font-medium">{insights.actionTip}</p>
            </div>
          </div>
        ) : (
          <p className="text-white/80 text-sm">Clique para gerar uma análise.</p>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Fluxo de Vendas (Últimos dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `R$${val}`} />
                <RechartsTooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                />
                <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Produtos Mais Vendidos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="qtd" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};