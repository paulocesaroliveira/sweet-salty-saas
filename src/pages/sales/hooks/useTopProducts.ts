
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProductSale {
  name: string;
  revenue: number;
  count: number;
}

export function useTopProducts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["top-products", user?.id],
    queryFn: async () => {
      // Join with order_items to get product information
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          quantity, unit_price, 
          product:products(id, name)
        `)
        .eq("vendor_id", user?.id);

      if (error) {
        console.error("Error fetching order items:", error);
        throw error;
      }

      // Use a more explicit approach to avoid deep type instantiation
      const productSalesMap: Record<string, ProductSale> = {};
      
      if (orderItems) {
        for (const item of orderItems) {
          const productId = item.product?.id || 'unknown';
          const productName = item.product?.name || 'Produto sem nome';
          
          if (!productSalesMap[productId]) {
            productSalesMap[productId] = {
              name: productName,
              revenue: 0,
              count: 0
            };
          }
          
          productSalesMap[productId].revenue += (item.quantity * item.unit_price);
          productSalesMap[productId].count += item.quantity;
        }
      }

      const result = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
        
      return result;
    },
    enabled: !!user?.id,
  });
}
