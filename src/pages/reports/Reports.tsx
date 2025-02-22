
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, startOfMonth, endOfMonth } from "date-fns";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Vendas por período
  const { data: salesData } = useQuery({
    queryKey: ["sales", dateRange],
    queryFn: async () => {
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
  });

  // Produtos mais vendidos
  const { data: topProducts } = useQuery({
    queryKey: ["top-products", dateRange],
    queryFn: async () => {
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
  });

  // Métricas gerais
  const { data: metrics } = useQuery({
    queryKey: ["metrics", dateRange],
    queryFn: async () => {
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
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho do seu negócio através de análises e métricas.
          </p>
        </div>

        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics?.totalRevenue.toFixed(2) ?? "0,00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics?.averageTicket.toFixed(2) ?? "0,00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalOrders ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      name="Valor (R$)" 
                      stroke="#2563eb" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name="Faturamento (R$)" 
                      fill="#2563eb" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
