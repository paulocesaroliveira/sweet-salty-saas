
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export function OrderStatusChart() {
  const { data: statusData } = useQuery({
    queryKey: ["order-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("delivery_status")
        .not("delivery_status", "is", null);

      if (error) throw error;

      const statusCount = data.reduce((acc: any, order) => {
        const status = order.delivery_status;
        if (!acc[status]) {
          acc[status] = 0;
        }
        acc[status]++;
        return acc;
      }, {});

      return Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));
    }
  });

  if (!statusData?.length) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">
      Nenhum dado disponível
    </div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
