
import { useEffect, useState } from "react";
import { PlusCircle, Pencil, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Package = {
  id: string;
  name: string;
  type: string;
  capacity: string | null;
  supplier: string | null;
  stock: number;
  unit_cost: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  vendor_id: string;
};

type PackageDialogProps = {
  onSave: () => void;
  package?: Package;
};

const PACKAGE_TYPES = [
  "Caixa",
  "Pote",
  "Saco",
  "Bandeja",
  "Embalagem Térmica",
  "Outro"
];

export function PackageDialog({ onSave, package: pkg }: PackageDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (pkg) {
      setName(pkg.name);
      setType(pkg.type);
      setCapacity(pkg.capacity || "");
      setSupplier(pkg.supplier || "");
      setUnitCost(pkg.unit_cost.toString());
      setStock(pkg.stock?.toString() || "0");
      setImagePreview(pkg.image_url);
    }
  }, [pkg]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !unitCost) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = pkg?.image_url || null;

      // Upload da imagem se houver uma nova
      if (image) {
        const fileExt = image.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('packages')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('packages')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const data = {
        name,
        type,
        capacity: capacity || null,
        supplier: supplier || null,
        unit_cost: Number(unitCost),
        stock: Number(stock) || 0,
        image_url: imageUrl,
        vendor_id: user?.id,
      };

      let error;
      if (pkg) {
        // Update
        ({ error } = await supabase
          .from("packages")
          .update(data)
          .eq("id", pkg.id));
      } else {
        // Insert
        ({ error } = await supabase.from("packages").insert(data));
      }

      if (error) throw error;

      toast.success(
        pkg 
          ? "Embalagem atualizada com sucesso"
          : "Embalagem adicionada com sucesso"
      );
      onSave();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        pkg
          ? "Erro ao atualizar embalagem"
          : "Erro ao adicionar embalagem"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setType("");
    setCapacity("");
    setSupplier("");
    setUnitCost("");
    setStock("0");
    setImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {pkg ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil size={16} />
          </Button>
        ) : (
          <Button className="gap-2">
            <PlusCircle size={20} />
            Nova Embalagem
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pkg ? "Editar Embalagem" : "Nova Embalagem"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da embalagem. Você pode adicionar uma imagem para facilitar a identificação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Caixa para Bolo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Ex: Caixa, Pote, Saco"
                list="package-types"
              />
              <datalist id="package-types">
                {PACKAGE_TYPES.map(type => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidade</Label>
              <Input
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Ex: 500ml, 6 unidades"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Embalagens ABC"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitCost">Custo Unitário (R$) *</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="Ex: 2.50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Estoque Atual</Label>
              <Input
                id="stock"
                type="number"
                step="1"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Ex: 100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagem (opcional)</Label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              ) : (
                <div className="w-32 h-32 bg-muted rounded flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Sem imagem</span>
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  <Upload size={20} />
                  Escolher Imagem
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
