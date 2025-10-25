// Define a estrutura para um item do histórico
export interface HistoryItem {
  id: string; // Para a key do React
  score: number;
  message: string;
}

// Define os valores que serão salvos no localStorage
export interface SavedInputs {
  currentPrice: string;
  averagePrice: string;
  floatValue: string;
}
