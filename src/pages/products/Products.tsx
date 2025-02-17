
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
}

const Products = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    }
  });

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description || "");
      setPrice(editingProduct.price.toString());
    }
  }, [editingProduct]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImageFile(null);
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = editingProduct?.image_url || null;

      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            name,
            description,
            price: Number(price),
            image_url: imageUrl,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success("Produto atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            name,
            description,
            price: Number(price),
            image_url: imageUrl,
            vendor_id: user?.id,
          });

        if (error) throw error;
        toast.success("Produto criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Produto excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display mb-1">Produtos</h1>
          <p className="text-neutral-600">Gerencie seu catálogo</p>
        </div>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          <span>Novo Produto</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="card group">
              <div className="aspect-square bg-neutral-100 rounded-lg mb-4 relative overflow-hidden">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => {
                      setEditingProduct(product);
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-white rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-white rounded-full hover:bg-neutral-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-neutral-600 text-sm mb-2">
                  {product.description}
                </p>
                <p className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-medium mb-4">
              {editingProduct ? "Editar Produto" : "Novo Produto"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">Nome</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="label">Descrição</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div>
                <label htmlFor="price" className="label">Preço</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="image" className="label">Imagem</label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                  }}
                  className="input-field"
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
