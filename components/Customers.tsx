import React, { useMemo, useState } from 'react';
import { Sale, CustomerStats } from '../types';
import { Search, Crown, TrendingUp } from 'lucide-react';

interface CustomersProps {
  sales: Sale[];
}

export const Customers: React.FC<CustomersProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const customers: CustomerStats[] = useMemo(() => {
    const statsMap: Record<string, CustomerStats> = {};

    sales.forEach(sale => {
      const name = sale.customerName;
      if (!statsMap[name]) {
        statsMap[name] = {
          name,
          totalPurchases: 0,
          totalItemsBought: 0,
          totalSpent: 0,
          totalProfitGiven: 0,
          lastPurchaseDate: sale.date
        };
      }
      
      statsMap[name].totalPurchases += 1;
      statsMap[name].totalItemsBought += sale.quantity;
      statsMap[name].totalSpent += sale.totalValue;
      statsMap[name].totalProfitGiven += sale.profit;
      
      // Update last purchase date if newer
      if (new Date(sale.date) > new Date(statsMap[name].lastPurchaseDate)) {
        statsMap[name].lastPurchaseDate = sale.date;
      }
    });

    return Object.values(statsMap).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Controle de Clientes</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3 text-center">Compras</th>
                <th className="px-6 py-3 text-center">Itens Total</th>
                <th className="px-6 py-3 text-right">Total Gasto</th>
                <th className="px-6 py-3 text-right text-indigo-600">Lucro Gerado</th>
                <th className="px-6 py-3 text-right">Última Compra</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr key={customer.name} className="bg-white border-b hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-center">{customer.totalPurchases}</td>
                  <td className="px-6 py-4 text-center">{customer.totalItemsBought}</td>
                  <td className="px-6 py-4 text-right">R$ {customer.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-indigo-600 font-bold flex items-center justify-end gap-1">
                     <TrendingUp className="w-3 h-3" />
                     R$ {customer.totalProfitGiven.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                    {new Date(customer.lastPurchaseDate).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
               {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Nenhum cliente com histórico de compras.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};