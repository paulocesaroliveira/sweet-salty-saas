
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Package,
  Calculator,
  Store,
  Box,
  AlertCircle
} from "lucide-react";
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
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { PackageDialog } from "./PackageDialog";

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

      return (data || []).map(pkg => ({
        ...pkg,
        supplier: pkg.supplier || null,
        capacity: pkg.capacity || null,
        stock: pkg.stock || 0,
      })) as Package[];
    },
  });

  const helpCards = [
    {
      icon: Box,
      title: "Como Cadastrar Embalagens",
      description: "Clique em 'Nova Embalagem' e preencha as informações como nome, capacidade e custo unitário."
    },
    {
      icon: Calculator,
      title: "Precificação de Produtos",
      description: "As embalagens cadastradas estarão disponíveis ao calcular o custo final dos seus produtos."
    },
    {
      icon: Store,
      title: "Controle de Estoque",
      description: "Gerencie seu estoque de embalagens para nunca ficar sem produto por falta de embalagem."
    }
  ];

  const filteredPackages = packages?.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.supplier?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {helpCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <card.icon size={20} className="text-primary" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar por nome, tipo ou fornecedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Custo Unit.</TableHead>
              <TableHead>Estoque</TableHead>
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
                      <Package size={20} />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{pkg.name}</TableCell>
                <TableCell>{pkg.type}</TableCell>
                <TableCell>{pkg.capacity || "-"}</TableCell>
                <TableCell>{pkg.supplier || "-"}</TableCell>
                <TableCell>R$ {pkg.unit_cost.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{pkg.stock || 0}</span>
                    {(pkg.stock || 0) <= 0 && (
                      <AlertCircle size={16} className="text-destructive" />
                    )}
                  </div>
                </TableCell>
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
                <TableCell 
                  colSpan={8} 
                  className="h-32 text-center text-muted-foreground"
                >
                  {searchTerm
                    ? "Nenhuma embalagem encontrada para esta busca"
                    : "Nenhuma embalagem cadastrada"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Packages;
