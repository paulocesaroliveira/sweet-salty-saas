
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

export function useMetrics(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ["metrics", dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return {
        totalRevenue: 0,
        averageTicket: 0,
        totalOrders: 0,
      };

      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      if (error) throw error;

      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageTicket = totalRevenue / (orders.length || 1);

      return {
        totalRevenue,
        averageTicket,
        totalOrders: orders.length,
      };
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
}
