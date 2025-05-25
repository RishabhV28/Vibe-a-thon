import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Negotiation, InsertNegotiation, NegotiationMessage } from "@shared/schema";

export function useNegotiation() {
  const [currentNegotiationId, setCurrentNegotiationId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: negotiation, isLoading: isFetching } = useQuery<
    Negotiation & { messages: NegotiationMessage[] }
  >({
    queryKey: [`/api/negotiations/${currentNegotiationId}`],
    enabled: !!currentNegotiationId,
  });

  const startNegotiationMutation = useMutation({
    mutationFn: async (data: InsertNegotiation) => {
      const response = await apiRequest("POST", "/api/negotiations", data);
      return response.json();
    },
    onSuccess: (data: Negotiation) => {
      setCurrentNegotiationId(data.id);
      queryClient.invalidateQueries({ queryKey: [`/api/negotiations/${data.id}`] });
    },
  });

  const continueNegotiationMutation = useMutation({
    mutationFn: async (negotiationId: number) => {
      const response = await apiRequest("PATCH", `/api/negotiations/${negotiationId}/continue`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/negotiations/${data.id}`], data);
    },
  });

  const acceptDealMutation = useMutation({
    mutationFn: async (negotiationId: number) => {
      const response = await apiRequest("PATCH", `/api/negotiations/${negotiationId}/accept`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/negotiations/${data.id}`], data);
    },
  });

  return {
    negotiation,
    isLoading: isFetching || startNegotiationMutation.isPending,
    startNegotiation: startNegotiationMutation.mutateAsync,
    continueNegotiation: continueNegotiationMutation.mutate,
    acceptDeal: acceptDealMutation.mutate,
    isStarting: startNegotiationMutation.isPending,
    isContinuing: continueNegotiationMutation.isPending,
    isAccepting: acceptDealMutation.isPending,
  };
}
