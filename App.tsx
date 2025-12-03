import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Sales } from './components/Sales';
import { Customers } from './components/Customers';
import { ViewState, Product, Sale } from './types';
import { getStoredProducts, saveProducts, getStoredSales, saveSales } from './services/storage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // Initialize data
  useEffect(() => {
    setProducts(getStoredProducts());
    setSales(getStoredSales());
  }, []);

  // Persistence effects
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveSales(sales);
  }, [sales]);

  // -- Handlers --

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: Date.now().toString(), // Simple ID generation
    };
    setProducts([...products, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleAddSale = (newSaleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...newSaleData,
      id: Date.now().toString()
    };
    
    // Update Sales
    setSales([...sales, newSale]);

    // Update Product Stock
    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === newSale.productId) {
        return {
          ...p,
          currentStock: p.currentStock - newSale.quantity,
          totalSold: p.totalSold + newSale.quantity
        };
      }
      return p;
    }));
  };

  // -- Render Logic --

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard products={products} sales={sales} />;
      case ViewState.INVENTORY:
        return (
          <Inventory 
            products={products} 
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case ViewState.SALES:
        return (
          <Sales 
            products={products}
            sales={sales}
            onAddSale={handleAddSale}
          />
        );
      case ViewState.CUSTOMERS:
        return <Customers sales={sales} />;
      default:
        return <Dashboard products={products} sales={sales} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {currentView === ViewState.DASHBOARD && 'Visão Geral'}
              {currentView === ViewState.INVENTORY && 'Gerenciar Estoque'}
              {currentView === ViewState.SALES && 'Vendas & Caixa'}
              {currentView === ViewState.CUSTOMERS && 'Meus Clientes'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
               Admin
            </span>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;