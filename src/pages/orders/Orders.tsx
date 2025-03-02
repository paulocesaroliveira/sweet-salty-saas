
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Package, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  TruckIcon,
  RefreshCcw,
  ChevronDown,
  Banknote,
  CreditCard,
  Receipt
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  created_at: string;
  delivery_date: string | null;
  total_amount: number;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "cancelled";
  payment_method: string;
  sale_origin: string | null;
  sale_type: "online" | "manual";
  seller_notes: string | null;
  discount_amount: number;
};

type OrderProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

interface OrderDetailProps {
  order: Order | null;
  onClose: () => void;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  preparing: {
    label: "Em preparo",
    className: "bg-blue-100 text-blue-800",
    icon: RefreshCcw,
  },
  delivered: {
    label: "Entregue",
    className: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const paymentStatusConfig = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  paid: {
    label: "Pago",
    className: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const paymentMethodIcons = {
  pix: Receipt,
  cash: Banknote,
  credit: CreditCard,
  debit: CreditCard,
};

const OrderDetail = ({ order, onClose }: OrderDetailProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<Order["status"]>(order?.status || "pending");
  const [paymentStatus, setPaymentStatus] = useState<Order["payment_status"]>(order?.payment_status || "pending");
  const [orderItems, setOrderItems] = useState<{ product: { name: string }, quantity: number, unit_price: number }[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setPaymentStatus(order.payment_status);
      fetchOrderItems(order.id);
    }
  }, [order]);

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity, unit_price, product:products(name)')
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const updateOrder = async () => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          payment_status: paymentStatus 
        })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success("Pedido atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erro ao atualizar pedido");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  const StatusIcon = statusConfig[status]?.icon || Clock;
  const PaymentStatusIcon = paymentStatusConfig[paymentStatus]?.icon || Clock;
  const PaymentMethodIcon = (paymentMethodIcons as any)[order.payment_method] || Receipt;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-medium mb-2">Detalhes do Cliente</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Nome:</dt>
              <dd>{order.customer_name}</dd>
            </div>
            {order.customer_phone && (
              <div className="flex justify-between">
                <dt className="font-medium">Telefone:</dt>
                <dd>{order.customer_phone}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium">Data do Pedido:</dt>
              <dd>{format(new Date(order.created_at), "PPP - HH:mm", { locale: ptBR })}</dd>
            </div>
            {order.delivery_date && (
              <div className="flex justify-between">
                <dt className="font-medium">Data de Entrega:</dt>
                <dd>{format(new Date(order.delivery_date), "PPP - HH:mm", { locale: ptBR })}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium">Origem:</dt>
              <dd>{order.sale_origin || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Tipo:</dt>
              <dd>{order.sale_type === "online" ? "Online" : "Manual"}</dd>
            </div>
          </dl>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Status do Pedido</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="orderStatus">Status</Label>
              <Select 
                value={status} 
                onValueChange={(value: Order["status"]) => setStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key as Order["status"]}>
                      <div className="flex items-center">
                        <config.icon className="h-4 w-4 mr-2" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="paymentStatus">Status do Pagamento</Label>
              <Select 
                value={paymentStatus} 
                onValueChange={(value: Order["payment_status"]) => setPaymentStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentStatusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key as Order["payment_status"]}>
                      <div className="flex items-center">
                        <config.icon className="h-4 w-4 mr-2" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PaymentMethodIcon className="h-4 w-4" />
                <span className="text-sm">
                  Pagamento: {order.payment_method === "pix" ? "PIX" :
                  order.payment_method === "cash" ? "Dinheiro" :
                  order.payment_method === "credit" ? "Cartão de Crédito" :
                  order.payment_method === "debit" ? "Cartão de Débito" : 
                  order.payment_method}
                </span>
              </div>
              <span className="text-lg font-bold">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Itens do Pedido</h3>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {order.seller_notes && (
        <div>
          <h3 className="text-lg font-medium mb-2">Observações</h3>
          <p className="p-3 bg-gray-50 rounded-md">{order.seller_notes}</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={updateOrder} disabled={isUpdating}>
          {isUpdating ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </div>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", selectedDate, search, statusFilter, paymentStatusFilter, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("orders")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false });

      if (selectedDate) {
        if (viewMode === "calendar") {
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          query = query
            .gte("delivery_date", startOfDay.toISOString())
            .lte("delivery_date", endOfDay.toISOString());
        }
      }

      if (search) {
        query = query.ilike("customer_name", `%${search}%`);
      }

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (paymentStatusFilter) {
        query = query.eq("payment_status", paymentStatusFilter);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Erro ao carregar pedidos");
        throw error;
      }

      return data as Order[];
    },
    enabled: !!user?.id,
  });

  const { data: deliveryDates } = useQuery({
    queryKey: ["delivery-dates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("delivery_date")
        .eq("vendor_id", user?.id)
        .not("delivery_date", "is", null);

      if (error) {
        toast.error("Erro ao carregar datas");
        throw error;
      }

      return data
        .map((d) => d.delivery_date ? new Date(d.delivery_date) : null)
        .filter((d): d is Date => d !== null);
    },
    enabled: !!user?.id,
  });

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleQuickStatusUpdate = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Status atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error) {
      toast.error("Erro ao atualizar status");
      console.error(error);
    }
  };

  const handlePaymentStatusUpdate = async (orderId: string, newStatus: Order["payment_status"]) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Status do pagamento atualizado");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    } catch (error) {
      toast.error("Erro ao atualizar pagamento");
      console.error(error);
    }
  };

  const CalendarView = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center border rounded-lg px-3">
                <Search className="text-neutral-400" size={20} />
                <Input
                  placeholder="Buscar por nome de cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>

              <div>
                <Label>Status do Pedido</Label>
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center">
                          <config.icon className="h-4 w-4 mr-2" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status do Pagamento</Label>
                <Select 
                  value={paymentStatusFilter} 
                  onValueChange={setPaymentStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {Object.entries(paymentStatusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center">
                          <config.icon className="h-4 w-4 mr-2" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Pedidos para{" "}
                {selectedDate
                  ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                  : "Hoje"}
              </CardTitle>
              <CardDescription>
                {orders?.length || 0} pedidos encontrados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
              >
                Ver Lista Completa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : orders?.length === 0 ? (
                <div className="text-center py-12 text-neutral-600">
                  <Package className="mx-auto mb-4 text-neutral-400" size={48} />
                  <p>Nenhum pedido encontrado</p>
                </div>
              ) : (
                orders?.map((order) => (
                  <Card
                    key={order.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openOrderDetail(order)}
                  >
                    <CardContent className="p-0">
                      <div className="flex justify-between items-center p-4 border-b">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {order.customer_name}
                            <Badge
                              variant="outline"
                              className={statusConfig[order.status].className}
                            >
                              {statusConfig[order.status].label}
                            </Badge>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {order.delivery_date
                              ? format(new Date(order.delivery_date), "dd/MM/yyyy HH:mm", { locale: ptBR })
                              : "Sem data de entrega"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                          <Badge
                            variant="outline"
                            className={paymentStatusConfig[order.payment_status].className}
                          >
                            {paymentStatusConfig[order.payment_status].label}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Pedido #{order.id.substring(0, 8)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              Ações <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Status do Pedido</DropdownMenuLabel>
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusUpdate(order.id, status as Order["status"]);
                                }}
                                disabled={order.status === status}
                              >
                                <config.icon className="mr-2 h-4 w-4" />
                                {config.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status do Pagamento</DropdownMenuLabel>
                            {Object.entries(paymentStatusConfig).map(([status, config]) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePaymentStatusUpdate(order.id, status as Order["payment_status"]);
                                }}
                                disabled={order.payment_status === status}
                              >
                                <config.icon className="mr-2 h-4 w-4" />
                                {config.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const ListView = () => (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Todos os Pedidos</CardTitle>
            <CardDescription>
              {orders?.length || 0} pedidos encontrados
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border rounded-lg px-3 w-full md:w-auto">
              <Search className="text-neutral-400" size={20} />
              <Input
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                  ) : (
                    "Selecionar data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              Ver Calendário
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>Status do Pedido</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <config.icon className="h-4 w-4 mr-2" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status do Pagamento</Label>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {Object.entries(paymentStatusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <config.icon className="h-4 w-4 mr-2" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => {
                  setStatusFilter(undefined);
                  setPaymentStatusFilter(undefined);
                  setSearch("");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-12 text-neutral-600">
            <Package className="mx-auto mb-4 text-neutral-400" size={48} />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data do Pedido</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => {
                  const StatusIcon = statusConfig[order.status]?.icon || Clock;
                  const PaymentStatusIcon = paymentStatusConfig[order.payment_status]?.icon || Clock;
                  
                  return (
                    <TableRow key={order.id} onClick={() => openOrderDetail(order)} className="cursor-pointer hover:bg-muted">
                      <TableCell>
                        <div className="font-medium">{order.customer_name}</div>
                        <div className="text-sm text-muted-foreground">
                          #{order.id.substring(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {order.delivery_date ? (
                          format(new Date(order.delivery_date), "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span className="text-muted-foreground">Não definido</span>
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusConfig[order.status].className}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={paymentStatusConfig[order.payment_status].className}
                        >
                          <PaymentStatusIcon className="h-3 w-3 mr-1" />
                          {paymentStatusConfig[order.payment_status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <span className="sr-only">Abrir menu</span>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              openOrderDetail(order);
                            }}>
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status do Pedido</DropdownMenuLabel>
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusUpdate(order.id, status as Order["status"]);
                                }}
                                disabled={order.status === status}
                              >
                                <config.icon className="mr-2 h-4 w-4" />
                                {config.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status do Pagamento</DropdownMenuLabel>
                            {Object.entries(paymentStatusConfig).map(([status, config]) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePaymentStatusUpdate(order.id, status as Order["payment_status"]);
                                }}
                                disabled={order.payment_status === status}
                              >
                                <config.icon className="mr-2 h-4 w-4" />
                                {config.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos online e vendas registradas
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "calendar")}>
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </TabsTrigger>
              <TabsTrigger value="list">
                <Package className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {viewMode === "calendar" ? <CalendarView /> : <ListView />}

      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          <OrderDetail 
            order={selectedOrder} 
            onClose={() => setShowOrderDetail(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
