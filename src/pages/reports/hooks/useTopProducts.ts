
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

export function useTopProducts(dateRange: DateRange | undefined) {
  return useQuery({
    queryKey: ["top-products", dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      const { data, error } = await supabase
        .from("order_items")
        .select(`
          quantity,
          unit_price,
          products:products (
            name
          )
        `)
        .gte("created_at", dateRange.from.toISOString())
        .lte("created_at", dateRange.to.toISOString());

      if (error) throw error;

      // Agrupar por produto
      const productSales = data.reduce((acc: any[], item) => {
        const name = item.products.name;
        const existing = acc.find(p => p.name === name);
        
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.quantity * item.unit_price;
        } else {
          acc.push({
            name,
            quantity: item.quantity,
            revenue: item.quantity * item.unit_price,
          });
        }
        
        return acc;
      }, []);

      return productSales.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });
}
