
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
      const { data: sales, error } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .eq("vendor_id", user?.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }

      // Group sales by day using a Record with explicit type
      const dailySalesMap: Record<string, DailySale> = {};
      
      if (sales && Array.isArray(sales)) {
        // Using for loop instead of forEach to avoid type issues
        for (let i = 0; i < sales.length; i++) {
          const sale = sales[i];
          
          if (sale && typeof sale === 'object' && 'created_at' in sale) {
            const date = new Date(String(sale.created_at)).toLocaleDateString();
            const amount = typeof sale.total_amount === 'number' ? sale.total_amount : 0;
            
            if (!dailySalesMap[date]) {
              dailySalesMap[date] = {
                date,
                amount: 0,
                count: 0,
              };
            }
            
            dailySalesMap[date].amount += amount;
            dailySalesMap[date].count += 1;
          }
        }
      }

      return Object.values(dailySalesMap);
    },
    enabled: !!user?.id,
  });
}
