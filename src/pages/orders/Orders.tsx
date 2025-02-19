
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Package, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Order = {
  id: string;
  customer_name: string;
  created_at: string;
  total_amount: number;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  delivery_date: string | null;
};

const statusConfig = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800",
  },
  preparing: {
    label: "Em preparo",
    className: "bg-blue-100 text-blue-800",
  },
  delivered: {
    label: "Entregue",
    className: "bg-green-100 text-green-800",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800",
  },
};

const Orders = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: orders, refetch } = useQuery({
    queryKey: ["orders", date, search],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        query = query
          .gte("delivery_date", startDate.toISOString())
          .lte("delivery_date", endDate.toISOString());
      }

      if (search) {
        query = query.ilike("customer_name", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Erro ao carregar pedidos");
        throw error;
      }

      return data as Order[];
    },
  });

  const { data: deliveryDates } = useQuery({
    queryKey: ["delivery-dates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("delivery_date")
        .not("delivery_date", "is", null);

      if (error) {
        toast.error("Erro ao carregar datas");
        throw error;
      }

      return data.map((d) => new Date(d.delivery_date!));
    },
  });

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Status atualizado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display mb-1">Pedidos</h1>
        <p className="text-neutral-600">Gerencie seus pedidos</p>
      </div>

      <div className="flex gap-6">
        <div className="w-[350px] space-y-4">
          <div className="card">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={ptBR}
              modifiers={{
                delivery: deliveryDates,
              }}
              modifiersStyles={{
                delivery: {
                  fontWeight: "bold",
                  backgroundColor: "rgb(254 242 242)",
                },
              }}
            />
          </div>

          <div className="card space-y-4">
            <div className="flex items-center border rounded-lg px-3">
              <Search className="text-neutral-400" size={20} />
              <Input
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                <Package className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-medium">
                  Pedidos do dia{" "}
                  {date
                    ? format(date, "dd 'de' MMMM", { locale: ptBR })
                    : ""}
                </h2>
                <p className="text-neutral-600">
                  {orders?.length || 0} pedidos encontrados
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {orders?.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">
                      Pedido #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {order.customer_name} • R${" "}
                      {order.total_amount.toFixed(2)}
                    </p>
                    {order.delivery_date && (
                      <p className="text-sm text-neutral-600">
                        Entrega:{" "}
                        {format(new Date(order.delivery_date), "dd/MM/yyyy HH:mm")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        statusConfig[order.status].className
                      }`}
                    >
                      {statusConfig[order.status].label}
                    </span>
                    <Select
                      value={order.status}
                      onValueChange={(value: Order["status"]) =>
                        updateOrderStatus(order.id, value)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Alterar status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <div className="text-center py-12 text-neutral-600">
                  <Package className="mx-auto mb-4 text-neutral-400" size={48} />
                  <p>Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
