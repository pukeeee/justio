import { useOptimistic, useMemo } from "react";
import { Client, ClientType } from "@/frontend/entities/client/model/types";
import { getClientDisplayName } from "@/frontend/entities/client/lib/client-utils";

interface UseOptimisticClientsProps {
  initialClients: Client[];
  searchQuery: string;
  typeFilter?: ClientType | "all";
}

/**
 * Хук для керування оптимістичним списком клієнтів та їх фільтрацією.
 */
export function useOptimisticClients({
  initialClients,
  searchQuery,
  typeFilter = "all",
}: UseOptimisticClientsProps) {
  // Оптимістичне видалення
  const [optimisticClients, removeOptimistic] = useOptimistic(
    initialClients,
    (state, clientId: string) => state.filter((c) => c.id !== clientId),
  );

  // Фільтрація
  const filteredClients = useMemo(() => {
    return optimisticClients.filter((client) => {
      const name = getClientDisplayName(client);

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone?.includes(searchQuery);

      const matchesType =
        typeFilter === "all" || client.clientType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [optimisticClients, searchQuery, typeFilter]);

  return {
    filteredClients,
    removeOptimistic,
    optimisticClients,
  };
}
