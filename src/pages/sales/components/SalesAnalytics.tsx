
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function SalesAnalytics() {
  const { user } = useAuth();

  const { data: salesData } = useQuery({
    queryKey: ["sales-chart"],
    queryFn: async () => {
      const { data: sales } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .eq("vendor_id", user?.id)
        .order("created_at", { ascending: true });

      // Group sales by day
      const dailySales = sales?.reduce((acc: Record<string, any>, sale) => {
        const date = new Date(sale.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            date,
            amount: 0,
            count: 0,
          };
        }
        acc[date].amount += sale.total_amount;
        acc[date].count += 1;
        return acc;
      }, {});

      return Object.values(dailySales || {});
    },
  });

  const { data: topProducts } = useQuery({
    queryKey: ["top-products"],
    queryFn: async () => {
      // Join with order_items to get product information
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          quantity, unit_price, 
          product:products(id, name)
        `)
        .eq("vendor_id", user?.id);

      // Group by product
      type ProductSales = Record<string, {
        name: string,
        revenue: number,
        count: number
      }>;
      
      const productSales = orderItems?.reduce((acc: ProductSales, item) => {
        const productName = item.product?.name || 'Produto sem nome';
        const productId = item.product?.id || 'unknown';
        
        if (!acc[productId]) {
          acc[productId] = {
            name: productName,
            revenue: 0,
            count: 0,
          };
        }
        acc[productId].revenue += (item.quantity * item.unit_price);
        acc[productId].count += item.quantity;
        return acc;
      }, {});

      return Object.values(productSales || {})
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    },
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
