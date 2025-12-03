import { Product, Sale } from '../types';

// O serviço de IA foi desativado conforme solicitação.
// Mantendo o arquivo como placeholder caso decida reativar no futuro.

export const getBusinessInsights = async (products: Product[], sales: Sale[]) => {
  console.log("Serviço de IA desativado.");
  return {
    stockAlert: "",
    salesInsight: "",
    actionTip: ""
  };
};