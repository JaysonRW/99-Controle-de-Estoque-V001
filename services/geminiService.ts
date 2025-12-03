import { GoogleGenAI } from "@google/genai";
import { Product, Sale } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (products: Product[], sales: Sale[]) => {
  try {
    // Summarize data to avoid token limits if data is huge (simple truncation for demo)
    const stockSummary = products.map(p => 
      `${p.name}: Stock ${p.currentStock} (Min ${p.minStock}), Cost R$${p.costPrice}`
    ).join('\n');

    const last5Sales = sales.slice(-10).map(s => 
      `Sold ${s.quantity}x ${s.productName} to ${s.customerName} for R$${s.salePrice} (Profit: R$${s.profit})`
    ).join('\n');

    const prompt = `
      Atue como um consultor de negócios experiente analisando os dados da minha loja "Controle Estoque Fácil".
      
      ESTOQUE ATUAL:
      ${stockSummary}

      VENDAS RECENTES:
      ${last5Sales}

      Com base nisso, forneça 3 insights estratégicos curtos e diretos (máximo 2 frases cada) sobre:
      1. Situação do estoque (o que repor urgente).
      2. Performance de vendas recente.
      3. Sugestão de ação para aumentar lucro.

      Retorne a resposta em formato JSON estrito com a seguinte estrutura:
      {
        "stockAlert": "string",
        "salesInsight": "string",
        "actionTip": "string"
      }
      Não use markdown code blocks, apenas o JSON cru.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    // Clean up potential markdown formatting if model adds it despite instructions
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      stockAlert: "Não foi possível analisar o estoque no momento.",
      salesInsight: "Dados de vendas temporariamente indisponíveis para análise.",
      actionTip: "Continue registrando suas vendas para obter insights futuros."
    };
  }
};