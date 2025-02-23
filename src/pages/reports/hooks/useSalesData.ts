
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

export function useSalesData(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ["sales", dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString())
        .order("created_at");

      if (error) throw error;

      // Agrupar vendas por dia
      const salesByDay = data.reduce((acc: any[], order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existing = acc.find(item => item.date === date);
        
        if (existing) {
          existing.amount += order.total_amount;
          existing.orders += 1;
        } else {
          acc.push({
            date,
            amount: order.total_amount,
            orders: 1,
          });
        }
        
        return acc;
      }, []);

      return salesByDay;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
}
