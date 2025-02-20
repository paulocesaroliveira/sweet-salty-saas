
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Instagram, MessageCircle, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

const Store = () => {
  const { vendorId } = useParams();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialContent, setTestimonialContent] = useState("");
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);

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

  const { data: testimonials } = useQuery<Testimonial[]>({
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
    } catch (error) {
      toast.error("Erro ao enviar depoimento");
    } finally {
      setIsSubmittingTestimonial(false);
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
              <Button
                variant="outline"
                className="relative"
                onClick={() => setShowCart(true)}
              >
                <MessageCircle size={20} />
                <span className="ml-2">
                  Carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="card group">
              <div className="aspect-square bg-neutral-100 rounded-lg mb-4 overflow-hidden">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-neutral-600 text-sm mb-2">
                  {product.description}
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
              {testimonials?.map((testimonial) => (
                <div key={testimonial.id} className="card">
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
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="text-lg font-medium mb-4">Deixe seu depoimento</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Seu nome</label>
                  <Input
                    value={testimonialName}
                    onChange={(e) => setTestimonialName(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>

                <div>
                  <label className="label">Avaliação</label>
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
                  <label className="label">Seu depoimento</label>
                  <Textarea
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

      {/* Modal do Carrinho */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Seu Pedido</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-neutral-600 py-8">
                  Seu carrinho está vazio
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div>
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
                            className="p-1 hover:bg-neutral-100 rounded"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-neutral-100 rounded"
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
                      <p className="font-semibold">
                        R$ {calculateTotal().toFixed(2)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {profile.whatsapp && (
                        <a
                          href={`https://wa.me/${profile.whatsapp}?text=${formatWhatsAppMessage()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-center"
                        >
                          Pedir via WhatsApp
                        </a>
                      )}
                      {profile.telegram && (
                        <a
                          href={`https://t.me/${profile.telegram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-center"
                        >
                          Pedir via Telegram
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;
