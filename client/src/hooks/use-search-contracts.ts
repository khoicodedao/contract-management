// hooks/useSearchContracts.ts
import { useQuery } from "@tanstack/react-query";

export const useSearchContracts = (searchTerm: string) => {
  return useQuery({
    queryKey: ["contracts", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      const response = await fetch(`/api/hop-dong/?search=${searchTerm}`);
      if (!response.ok) throw new Error("Lỗi khi tìm kiếm hợp đồng");

      return response.json();
    },
    enabled: !!searchTerm, // Chỉ chạy khi có searchTerm
  });
};
