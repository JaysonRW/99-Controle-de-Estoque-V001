import { Product, Sale } from '../types';

const KEYS = {
  PRODUCTS: 'cef_products',
  SALES: 'cef_sales'
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Fone de Ouvido Bluetooth',
    category: 'Eletrônicos',
    costPrice: 45.00,
    suggestedPrice: 120.00,
    currentStock: 15,
    minStock: 5,
    totalSold: 12,
    lastRestockDate: '2023-10-01'
  },
  {
    id: '2',
    name: 'Cabo USB-C Reforçado',
    category: 'Acessórios',
    costPrice: 8.50,
    suggestedPrice: 25.00,
    currentStock: 4,
    minStock: 10,
    totalSold: 45,
    lastRestockDate: '2023-10-15'
  },
  {
    id: '3',
    name: 'Suporte para Notebook',
    category: 'Escritório',
    costPrice: 35.00,
    suggestedPrice: 89.90,
    currentStock: 8,
    minStock: 3,
    totalSold: 5,
    lastRestockDate: '2023-09-20'
  }
];

const INITIAL_SALES: Sale[] = [
  {
    id: '101',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerName: 'João Silva',
    productId: '1',
    productName: 'Fone de Ouvido Bluetooth',
    quantity: 1,
    costAtSale: 45.00,
    salePrice: 120.00,
    totalValue: 120.00,
    profit: 75.00
  },
  {
    id: '102',
    date: new Date(Date.now() - 86400000).toISOString(),
    customerName: 'Maria Oliveira',
    productId: '2',
    productName: 'Cabo USB-C Reforçado',
    quantity: 2,
    costAtSale: 8.50,
    salePrice: 25.00,
    totalValue: 50.00,
    profit: 33.00
  }
];

export const getStoredProducts = (): Product[] => {
  const stored = localStorage.getItem(KEYS.PRODUCTS);
  return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredSales = (): Sale[] => {
  const stored = localStorage.getItem(KEYS.SALES);
  return stored ? JSON.parse(stored) : INITIAL_SALES;
};

export const saveSales = (sales: Sale[]) => {
  localStorage.setItem(KEYS.SALES, JSON.stringify(sales));
};