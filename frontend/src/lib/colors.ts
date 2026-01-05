// Paleta de cores normais
export const normalColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
];

// Paleta de cores pastéis
export const pastelColors = [
  "bg-blue-200",
  "bg-green-200",
  "bg-purple-200",
  "bg-red-200",
  "bg-yellow-200",
  "bg-pink-200",
  "bg-indigo-200",
  "bg-orange-200",
  "bg-cyan-200",
  "bg-emerald-200",
  "bg-violet-200",
  "bg-rose-200",
  "bg-sky-200",
  "bg-teal-200",
  "bg-fuchsia-200",
  "bg-amber-200",
];

// Todas as cores combinadas
export const allColors = [...normalColors, ...pastelColors];

// Função para obter cor por índice
export function getColorByIndex(index: number): string {
  return allColors[index % allColors.length];
}

// Função para obter cor sugerida baseada em categoria/sistema
export function getSuggestedColor(category?: string, system?: string): string {
  // Mapeamento básico de cores por categoria
  const colorMap: Record<string, string> = {
    estrutura: "bg-blue-500",
    layout: "bg-purple-500",
    design: "bg-pink-500",
    mitra: "bg-green-500",
    metro: "bg-orange-500",
    curia: "bg-indigo-500",
  };

  const key = (category || system || "").toLowerCase();
  return colorMap[key] || normalColors[0];
}

