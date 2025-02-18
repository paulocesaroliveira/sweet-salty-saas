
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Package, PlusCircle } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Delivery = {
  id: string;
  customer_name: string;
  delivery_date: string;
  status: string;
  total_amount: number;
};

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: deliveries, refetch } = useQuery({
    queryKey: ["deliveries", date],
    queryFn: async () => {
      if (!date) return [];

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("delivery_date", startDate.toISOString())
        .lte("delivery_date", endDate.toISOString())
        .order("delivery_date");

      if (error) {
        toast.error("Erro ao carregar entregas");
        throw error;
      }

      return data as Delivery[];
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

      return data.map(d => new Date(d.delivery_date));
    },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    preparing: "bg-blue-100 text-blue-800",
    delivering: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display mb-1">Agenda</h1>
        <p className="text-neutral-600">Gerencie suas entregas</p>
      </div>

      <div className="flex gap-6">
        <div className="w-[350px] space-y-4">
          <div className="card">
            <CalendarComponent
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

          <Button className="w-full gap-2">
            <PlusCircle size={20} />
            Adicionar Entrega
          </Button>
        </div>

        <div className="flex-1 card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
              <Package className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium">
                Entregas do dia {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ""}
              </h2>
              <p className="text-neutral-600">
                {deliveries?.length || 0} entregas agendadas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {deliveries?.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{delivery.customer_name}</h3>
                  <p className="text-sm text-neutral-600">
                    {format(new Date(delivery.delivery_date), "HH:mm")}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusColors[delivery.status]
                    }`}
                  >
                    {delivery.status}
                  </span>
                </div>
              </div>
            ))}
            {(!deliveries || deliveries.length === 0) && (
              <div className="text-center py-12 text-neutral-600">
                <CalendarIcon className="mx-auto mb-4 text-neutral-400" size={48} />
                <p>Nenhuma entrega agendada para este dia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
