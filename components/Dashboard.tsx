import React, { useMemo } from 'react';
import { Product, Sale } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

export const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
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