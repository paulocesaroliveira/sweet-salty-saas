
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { PackageDialog } from "./PackageDialog";

type Package = {
  id: string;
  name: string;
  type: string;
  unit_cost: number;
  image_url: string | null;
};

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: packages, refetch } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar embalagens");
        throw error;
      }

      return data as Package[];
    },
  });

  const filteredPackages = packages?.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta embalagem?")) return;

    try {
      const { error } = await supabase
        .from("packages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Embalagem excluída com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir embalagem");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Embalagens</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie as embalagens utilizadas nos seus produtos
          </p>
        </div>
        <PackageDialog onSave={refetch} />
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar embalagens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Custo Unitário</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages?.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell>
                  {pkg.image_url ? (
                    <img
                      src={pkg.image_url}
                      alt={pkg.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                      Sem imagem
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>{pkg.type}</TableCell>
                <TableCell>R$ {pkg.unit_cost.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <PackageDialog
                    package={pkg}
                    onSave={refetch}
                  />
                </TableCell>
              </TableRow>
            ))}

            {(!filteredPackages || filteredPackages.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {searchTerm
                    ? "Nenhuma embalagem encontrada para esta busca"
                    : "Nenhuma embalagem cadastrada"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Packages;
