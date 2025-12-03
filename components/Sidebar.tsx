import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Hexagon } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.INVENTORY, label: 'Estoque', icon: Package },
    { id: ViewState.SALES, label: 'Vendas', icon: ShoppingCart },
    { id: ViewState.CUSTOMERS, label: 'Clientes', icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 md:w-64 bg-slate-900 text-white transition-all z-40 flex flex-col shadow-2xl">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-indigo-500 p-2 rounded-lg">
           <Hexagon className="w-6 h-6 text-white fill-indigo-500" />
        </div>
        <h1 className="text-xl font-bold hidden md:block bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Estoque Fácil
        </h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="hidden md:block font-medium">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 hidden md:block" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 w-full rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="hidden md:block font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};