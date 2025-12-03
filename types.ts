export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number; // Preço de custo (usado para calcular média e lucro)
  suggestedPrice: number; // Preço sugerido de venda
  currentStock: number;
  minStock: number; // Ponto de reposição
  totalSold: number; // Histórico de qtd vendida
  lastRestockDate: string;
}

export interface Sale {
  id: string;
  date: string; // ISO String
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  costAtSale: number; // Custo do produto no momento da venda (para fixar lucro real)
  salePrice: number; // Preço final praticado
  totalValue: number; // quantity * salePrice
  profit: number; // (salePrice - costAtSale) * quantity
}

export interface CustomerStats {
  name: string;
  totalPurchases: number; // Quantidade de compras (transações)
  totalItemsBought: number; // Soma das quantidades
  totalSpent: number; // Total gasto pelo cliente (Receita)
  totalProfitGiven: number; // Lucro total gerado por este cliente
  lastPurchaseDate: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  INVENTORY = 'INVENTORY',
  SALES = 'SALES',
  CUSTOMERS = 'CUSTOMERS',
  REPORTS = 'REPORTS'
}