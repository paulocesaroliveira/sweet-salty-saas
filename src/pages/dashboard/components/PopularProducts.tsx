
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function PopularProducts() {
  const { data: products } = useQuery({
    queryKey: ["popular-products"],
    queryFn: async () => {
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select(`
          quantity,
          unit_price,
          products:products (
            name,
            image_url
          )
        `)
        .order("quantity", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Agrupa por produto
      const productStats = orderItems.reduce((acc: any[], item) => {
        const existing = acc.find(p => p.name === item.products.name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.quantity * item.unit_price;
        } else {
          acc.push({
            name: item.products.name,
            image_url: item.products.image_url,
            quantity: item.quantity,
            revenue: item.quantity * item.unit_price
          });
        }
        return acc;
      }, []);

      return productStats.sort((a, b) => b.revenue - a.revenue);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Populares</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products?.map((product, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-4 bg-neutral-50/50 
                       rounded-xl transition-colors hover:bg-neutral-50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-neutral-600">
                    Vendidos: {product.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium">
                {formatCurrency(product.revenue)}
              </p>
            </div>
          ))}

          {(!products || products.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto vendido ainda
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
