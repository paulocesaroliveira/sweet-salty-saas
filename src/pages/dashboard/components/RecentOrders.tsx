
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function RecentOrders() {
  const { data: orders } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      delivering: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders?.map((order) => (
            <div 
              key={order.id}
              className="flex items-center justify-between p-4 bg-neutral-50/50 
                       rounded-xl transition-colors hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-sm text-neutral-600">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.delivery_status)}`}>
                {order.delivery_status}
              </span>
            </div>
          ))}

          {(!orders || orders.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pedido recente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
