import type { PriceAlert } from "@/types/travel";

/** Porta pronta para uma futura implementação em Supabase. */
export interface AlertRepository {
  create(alert: Omit<PriceAlert, "enabled">): Promise<PriceAlert>;
  list(): Promise<PriceAlert[]>;
  toggle(id: string, enabled: boolean): Promise<void>;
}
