
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DailySale {
  date: string;
  amount: number;
  count: number;
}

export function useDailySales() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales-chart", user?.id],
    queryFn: async () => {
      const { data: sales } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .eq("vendor_id", user?.id)
        .order("created_at", { ascending: true });

      // Group sales by day using a regular object with explicit type
      const dailySalesMap: Record<string, DailySale> = {};
      
      // Use forEach instead of reduce for clearer type handling
      sales?.forEach((sale) => {
        const date = new Date(sale.created_at).toLocaleDateString();
        if (!dailySalesMap[date]) {
          dailySalesMap[date] = {
            date,
            amount: 0,
            count: 0,
          };
        }
        dailySalesMap[date].amount += sale.total_amount;
        dailySalesMap[date].count += 1;
      });

      return Object.values(dailySalesMap);
    },
    enabled: !!user?.id,
  });
}
