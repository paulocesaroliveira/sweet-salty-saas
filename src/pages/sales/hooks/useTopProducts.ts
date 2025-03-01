
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
      if (!user?.id) {
        console.error("No user ID available for top products query");
        return [];
      }

      console.log("Fetching top products with user ID:", user.id);
      
      // Join with order_items through orders to get product information
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          quantity, unit_price, order_id,
          product:products(id, name),
          orders!inner(vendor_id)
        `)
        .eq("orders.vendor_id", user.id);

      if (error) {
        console.error("Error fetching order items:", error);
        throw error;
      }

      // Create a map to store product sales data
      const productSalesMap: Record<string, ProductSale> = {};
      
      // Process each order item
      if (orderItems && Array.isArray(orderItems)) {
        for (let i = 0; i < orderItems.length; i++) {
          const item = orderItems[i];
          
          if (!item || typeof item !== 'object') continue;
          
          const product = item.product;
          if (!product || typeof product !== 'object') continue;
          
          const productId = 'id' in product ? String(product.id) : 'unknown';
          const productName = 'name' in product ? String(product.name) : 'Produto sem nome';
          
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          const unitPrice = typeof item.unit_price === 'number' ? item.unit_price : 0;
          
          if (!productSalesMap[productId]) {
            productSalesMap[productId] = {
              name: productName,
              revenue: 0,
              count: 0
            };
          }
          
          productSalesMap[productId].revenue += (quantity * unitPrice);
          productSalesMap[productId].count += quantity;
        }
      }

      // Convert the map to an array and sort by revenue
      const productsArray = Object.values(productSalesMap);
      return productsArray
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
    enabled: !!user?.id,
  });
}
