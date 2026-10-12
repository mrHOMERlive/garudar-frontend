import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

// Страны высокого риска ЕС по ПОД/ФТ (Delegated Regulation 2016/1675).
// Список грузится один раз за час на всю страницу.

export function useHighRiskCountries() {
  const { data } = useQuery({
    queryKey: ['aml-high-risk-countries'],
    queryFn: () => apiClient.getHighRiskCountries(),
    staleTime: 60 * 60 * 1000,
  });
  return data?.countries || [];
}

export function findHighRiskCountry(countries, code) {
  if (!code) return null;
  return countries.find((c) => c.code === String(code).toUpperCase()) || null;
}
