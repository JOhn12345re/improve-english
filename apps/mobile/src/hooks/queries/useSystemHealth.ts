import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export interface HealthResponse {
  status: string;
  info: Record<string, any>;
  error: Record<string, any>;
  details: Record<string, any>;
}

export function useAppHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<HealthResponse>('/health'),
    refetchInterval: 30000, // Check health every 30 seconds
  });
}

export function useIntegrationsHealth() {
  return useQuery({
    queryKey: ['health', 'integrations'],
    queryFn: () => api.get<HealthResponse>('/health/integrations'),
  });
}
