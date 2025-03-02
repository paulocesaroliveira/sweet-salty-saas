
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Instagram, MessageCircle, Send, Calendar, ShoppingBag, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Profile {
  id: string;
  store_name: string;
  store_description: string | null;
  whatsapp: string | null;
  telegram: string | null;
  instagram: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  content: string;
  created_at: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  deliveryDate: Date | undefined;
  notes: string;
}

const Store = () => {
  const { vendorId } = useParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialContent, setTestimonialContent] = useState("");
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    deliveryDate: addDays(new Date(), 1),
    notes: "",
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["profile", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", vendorId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("active", true);

      if (error) throw error;
      return data;
    },
  });

  const { data: testimonials, refetch: refetchTestimonials } = useQuery<Testimonial[]>({
    queryKey: ["testimonials", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success("Produto adicionado ao carrinho!");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmitTestimonial = async () => {
    if (!testimonialName || !testimonialContent || !testimonialRating) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsSubmittingTestimonial(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        vendor_id: vendorId,
        customer_name: testimonialName,
        content: testimonialContent,
        rating: testimonialRating,
      });

      if (error) throw error;

      toast.success("Depoimento enviado com sucesso! Aguardando aprovação.");
      setTestimonialName("");
      setTestimonialContent("");
      setTestimonialRating(5);
      refetchTestimonials();
    } catch (error) {
      toast.error("Erro ao enviar depoimento");
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  const handleSubmitOrder = async () => {
    // Validate customer info
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.deliveryDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (cart.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          vendor_id: vendorId,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          total_amount: calculateTotal(),
          delivery_date: customerInfo.deliveryDate.toISOString(),
          seller_notes: customerInfo.notes || null,
          status: "pending",
          payment_status: "pending",
          sale_type: "online",
          payment_method: "pix",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success("Pedido realizado com sucesso!");
      setCart([]);
      setShowCart(false);
      setCheckoutStep(1);
      setCustomerInfo({
        name: "",
        phone: "",
        deliveryDate: addDays(new Date(), 1),
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Erro ao realizar pedido. Por favor, tente novamente.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const formatWhatsAppMessage = () => {
    const items = cart.map(
      item => `${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2)})`
    ).join("\n");
    
    return encodeURIComponent(
      `Olá! Gostaria de fazer um pedido:\n\n${items}\n\nTotal: R$ ${calculateTotal().toFixed(2)}`
    );
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display">{profile.store_name}</h1>
              {profile.store_description && (
                <p className="text-neutral-600">{profile.store_description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <Instagram size={20} />
                </a>
              )}
              {profile.telegram && (
                <a
                  href={`https://t.me/${profile.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <Send size={20} />
                </a>
              )}
              <Sheet open={showCart} onOpenChange={setShowCart}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative"
                  >
                    <ShoppingBag size={20} className="mr-2" />
                    <span>
                      Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Seu Pedido</SheetTitle>
                    <SheetDescription>
                      {checkoutStep === 1 ? 
                        "Confira os produtos e continue para finalizar" : 
                        "Complete seus dados para finalizar o pedido"
                      }
                    </SheetDescription>
                  </SheetHeader>

                  {cart.length === 0 ? (
                    <div className="text-center text-neutral-600 py-8">
                      <ShoppingBag className="mx-auto mb-4 text-neutral-400" size={48} />
                      <p>Seu carrinho está vazio</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowCart(false)}
                      >
                        Continuar comprando
                      </Button>
                    </div>
                  ) : (
                    <>
                      {checkoutStep === 1 ? (
                        <>
                          <div className="space-y-4 my-6">
                            {cart.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between border-b pb-4"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-neutral-600">
                                    R$ {item.price.toFixed(2)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity - 1)
                                    }
                                    className="p-1 hover:bg-neutral-100 rounded w-8 h-8 flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="p-1 hover:bg-neutral-100 rounded w-8 h-8 flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-6">
                              <p className="font-medium">Total</p>
                              <p className="font-semibold text-xl">
                                R$ {calculateTotal().toFixed(2)}
                              </p>
                            </div>

                            <div className="grid gap-4">
                              <Button onClick={() => setCheckoutStep(2)}>
                                Prosseguir com o pedido
                              </Button>

                              <div className="flex justify-between gap-2">
                                {profile.whatsapp && (
                                  <a
                                    href={`https://wa.me/${profile.whatsapp}?text=${formatWhatsAppMessage()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline text-center w-full"
                                  >
                                    <Button variant="outline" className="w-full">
                                      Pedir via WhatsApp
                                    </Button>
                                  </a>
                                )}
                                {profile.telegram && (
                                  <a
                                    href={`https://t.me/${profile.telegram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline text-center w-full"
                                  >
                                    <Button variant="outline" className="w-full">
                                      Pedir via Telegram
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 my-6">
                          <div>
                            <Label htmlFor="customerName">Nome completo *</Label>
                            <Input
                              id="customerName"
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                              placeholder="Digite seu nome completo"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="customerPhone">Telefone/WhatsApp *</Label>
                            <Input
                              id="customerPhone"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                              placeholder="Ex: (11) 98765-4321"
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="deliveryDate">Data de entrega *</Label>
                            <div className="mt-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {customerInfo.deliveryDate ? (
                                      format(customerInfo.deliveryDate, "PPP", { locale: ptBR })
                                    ) : (
                                      <span>Selecione uma data</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <CalendarComponent
                                    mode="single"
                                    selected={customerInfo.deliveryDate}
                                    onSelect={(date) => date && 
                                      setCustomerInfo({ ...customerInfo, deliveryDate: date })}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="orderNotes">Observações</Label>
                            <Textarea
                              id="orderNotes"
                              value={customerInfo.notes}
                              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                              placeholder="Informações adicionais sobre o pedido..."
                              className="mt-1"
                            />
                          </div>

                          <div className="border-t pt-4 mt-6">
                            <div className="flex items-center justify-between mb-6">
                              <p className="font-medium">Total</p>
                              <p className="font-semibold text-xl">
                                R$ {calculateTotal().toFixed(2)}
                              </p>
                            </div>

                            <div className="grid gap-4">
                              <Button 
                                onClick={handleSubmitOrder}
                                disabled={isSubmittingOrder}
                              >
                                {isSubmittingOrder ? "Enviando..." : "Finalizar Pedido"}
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => setCheckoutStep(1)}
                              >
                                Voltar
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="card group bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square bg-neutral-100 rounded-lg mb-4 overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <ShoppingBag size={48} />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-neutral-600 text-sm mb-2">
                  {product.description || "Sem descrição"}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.price)}
                  </p>
                  <Button size="sm" onClick={() => addToCart(product)}>
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Seção de Depoimentos */}
        <div className="mt-16">
          <h2 className="text-2xl font-display mb-8">Depoimentos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {testimonials?.length ? (
                testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="card bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-neutral-600 mb-2">{testimonial.content}</p>
                    <p className="text-sm font-medium">{testimonial.customer_name}</p>
                    <p className="text-xs text-neutral-500">
                      {format(new Date(testimonial.created_at), "PPP", { locale: ptBR })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-neutral-600 text-center py-8">
                  Nenhum depoimento ainda. Seja o primeiro a avaliar!
                </div>
              )}
            </div>

            <div className="card bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium mb-4">Deixe seu depoimento</h3>
              <div className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium mb-1" htmlFor="testimonialName">Seu nome</Label>
                  <Input
                    id="testimonialName"
                    value={testimonialName}
                    onChange={(e) => setTestimonialName(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1">Avaliação</Label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTestimonialRating(i + 1)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={`${
                            i < testimonialRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="block text-sm font-medium mb-1" htmlFor="testimonialContent">Seu depoimento</Label>
                  <Textarea
                    id="testimonialContent"
                    value={testimonialContent}
                    onChange={(e) => setTestimonialContent(e.target.value)}
                    placeholder="Conte sua experiência..."
                  />
                </div>

                <Button
                  onClick={handleSubmitTestimonial}
                  disabled={isSubmittingTestimonial}
                  className="w-full"
                >
                  {isSubmittingTestimonial
                    ? "Enviando..."
                    : "Enviar Depoimento"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-16">
        <div className="container max-w-5xl mx-auto px-4 text-center text-neutral-600">
          <p>&copy; {new Date().getFullYear()} {profile.store_name}</p>
        </div>
      </footer>
    </div>
  );
};

// Add Label component if it doesn't exist
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`${className || ""}`} {...props}>
    {children}
  </label>
);

export default Store;
