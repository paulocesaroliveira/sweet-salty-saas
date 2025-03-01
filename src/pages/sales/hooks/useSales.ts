
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Sale {
  id: string;
  created_at: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  status: string;
  payment_status: string;
}

export function useSales(filters: {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  paymentMethod?: string;
  search?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sales", filters, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          id, created_at, customer_name, total_amount, payment_method, status, payment_status
        `)
        .eq("vendor_id", user?.id);

      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.paymentMethod) {
        query = query.eq("payment_method", filters.paymentMethod);
      }
      if (filters.search) {
        query = query.or(`
          customer_name.ilike.%${filters.search}%,
          id.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }
      
      return data as Sale[];
    },
    enabled: !!user?.id,
  });
}
