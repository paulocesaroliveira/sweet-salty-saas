
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export function RevenueChart() {
  const { data: revenueData } = useQuery({
    queryKey: ["revenue-chart"],
    queryFn: async () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const { data, error } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .gte("created_at", firstDay.toISOString())
        .lte("created_at", today.toISOString());

      if (error) throw error;

      // Agrupa os pedidos por dia
      const dailyRevenue = data.reduce((acc: any, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += order.total_amount;
        return acc;
      }, {});

      // Converte para o formato do gráfico
      return Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount
      }));
    }
  });

  if (!revenueData?.length) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
      Nenhum dado disponível
    </div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={revenueData}>
        <XAxis 
          dataKey="date" 
          stroke="#888888"
          fontSize={12} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => `Data: ${label}`}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#2563eb"
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}
