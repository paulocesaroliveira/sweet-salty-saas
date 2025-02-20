import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Package, Search, Plus } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Order = {
  id: string;
  customer_name: string;
  created_at: string;
  total_amount: number;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  delivery_date: string | null;
  payment_method?: string;
  delivery_method?: string;
  notes?: string;
  discount_amount?: number;
};

type OrderProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<OrderProduct[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);

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

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true);

      if (error) throw error;
      return data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const { data: addresses } = useQuery({
    queryKey: ["addresses", selectedCustomerId],
    enabled: !!selectedCustomerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", selectedCustomerId);

      if (error) throw error;
      return data;
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

  const handleAddProduct = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (!product) return;

    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === productId);
      if (existing) {
        return prev.map(p =>
          p.id === productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: Math.max(0, quantity) }
          : p
      ).filter(p => p.quantity > 0)
    );
  };

  const calculateTotal = () => {
    const subtotal = selectedProducts.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    return subtotal - (discountAmount || 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomerId || !selectedAddressId || selectedProducts.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const customer = customers?.find(c => c.id === selectedCustomerId);
      
      const orderData = {
        customer_id: selectedCustomerId,
        customer_name: customer?.full_name || "",
        address_id: selectedAddressId,
        vendor_id: user.id,
        total_amount: calculateTotal(),
        payment_method: paymentMethod,
        delivery_method: deliveryMethod,
        notes: notes || null,
        discount_amount: discountAmount || 0,
        status: "pending",
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = selectedProducts.map(product => ({
        order_id: order.id,
        product_id: product.id,
        quantity: product.quantity,
        unit_price: product.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Pedido criado com sucesso!");
      setDialogOpen(false);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar pedido");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display mb-1">Pedidos</h1>
          <p className="text-neutral-600">Gerencie seus pedidos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Pedido
        </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Novo Pedido</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomerId && (
                <div className="space-y-2">
                  <Label>Endereço de Entrega *</Label>
                  <Select
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um endereço" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses?.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          {address.street}, {address.number} - {address.neighborhood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Produtos *</Label>
              <div className="space-y-2">
                <Select onValueChange={handleAddProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - R$ {product.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2 mt-4">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-neutral-600">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 hover:bg-neutral-100 rounded"
                          onClick={() =>
                            handleUpdateQuantity(product.id, product.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{product.quantity}</span>
                        <button
                          type="button"
                          className="p-1 hover:bg-neutral-100 rounded"
                          onClick={() =>
                            handleUpdateQuantity(product.id, product.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Forma de Pagamento *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="money">Dinheiro</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Método de Entrega *</Label>
                <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="pickup">Retirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desconto</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Total</Label>
                <Input
                  value={`R$ ${calculateTotal().toFixed(2)}`}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas do Pedido</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações sobre o pedido..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateOrder} disabled={isUpdating}>
                {isUpdating ? "Criando..." : "Criar Pedido"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
