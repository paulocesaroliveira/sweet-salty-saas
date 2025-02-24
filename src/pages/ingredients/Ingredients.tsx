import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  FileSpreadsheet, 
  PlusCircle, 
  HelpCircle,
  Package,
  Calculator,
  DollarSign,
  Store,
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
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { IngredientDialog } from "./IngredientDialog";

type Ingredient = {
  id: string;
  name: string;
  type: 'solid' | 'liquid';
  unit: string;
  brand: string | null;
  supplier: string | null;
  category: string | null;
  stock: number;
  package_cost: number;
  package_amount: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
  vendor_id: string;
};

const CATEGORIES = [
  "Todos",
  "Farinhas",
  "Laticínios",
  "Chocolates",
  "Frutas",
  "Gorduras",
  "Açúcares",
  "Outros"
];

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const { data: ingredients, refetch } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar ingredientes");
        throw error;
      }

      return (data || []).map(ingredient => ({
        ...ingredient,
        supplier: ingredient.supplier || null,
        category: ingredient.category || null,
        stock: ingredient.stock || 0,
        type: ingredient.type || 'solid',
      })) as Ingredient[];
    },
  });

  const helpCards = [
    {
      icon: Package,
      title: "Como Cadastrar Ingredientes",
      description: "Clique em 'Novo Ingrediente' e preencha as informações básicas como nome, unidade de medida e custo da embalagem."
    },
    {
      icon: Calculator,
      title: "Cálculo Automático",
      description: "O sistema calcula automaticamente o custo por unidade baseado no preço da embalagem e quantidade."
    },
    {
      icon: DollarSign,
      title: "Gestão de Custos",
      description: "Mantenha seus preços atualizados para ter um controle preciso dos custos das suas receitas."
    },
    {
      icon: Store,
      title: "Controle de Estoque",
      description: "Acompanhe a quantidade disponível de cada ingrediente para nunca ficar sem estoque."
    }
  ];

  const filteredIngredients = ingredients?.filter(ingredient => {
    const matchesSearch = 
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ingredient.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (ingredient.supplier?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === "Todos" || 
      ingredient.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Ingredientes</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os ingredientes utilizados nas suas receitas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet size={20} />
            Importar Planilha
          </Button>
          <IngredientDialog onSave={refetch} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="text-muted-foreground" size={20} />
          <Input
            placeholder="Buscar por nome, marca ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Qtd. Embalagem</TableHead>
              <TableHead>Custo Emb.</TableHead>
              <TableHead>Custo/Unidade</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients?.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{ingredient.name}</p>
                    {ingredient.brand && (
                      <p className="text-sm text-muted-foreground">
                        {ingredient.brand}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{ingredient.category || "-"}</TableCell>
                <TableCell>{ingredient.supplier || "-"}</TableCell>
                <TableCell>
                  {ingredient.package_amount} {ingredient.unit}
                </TableCell>
                <TableCell>
                  R$ {ingredient.package_cost.toFixed(2)}
                </TableCell>
                <TableCell>
                  R$ {ingredient.cost_per_unit.toFixed(3)}/{ingredient.unit}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{ingredient.stock || 0} {ingredient.unit}</span>
                    {(ingredient.stock || 0) <= 0 && (
                      <AlertCircle size={16} className="text-destructive" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <IngredientDialog
                    ingredient={ingredient}
                    onSave={refetch}
                  />
                </TableCell>
              </TableRow>
            ))}

            {(!filteredIngredients || filteredIngredients.length === 0) && (
              <TableRow>
                <TableCell 
                  colSpan={8} 
                  className="h-32 text-center text-muted-foreground"
                >
                  {searchTerm || selectedCategory !== "Todos"
                    ? "Nenhum ingrediente encontrado com os filtros aplicados"
                    : "Nenhum ingrediente cadastrado"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Ingredients;
