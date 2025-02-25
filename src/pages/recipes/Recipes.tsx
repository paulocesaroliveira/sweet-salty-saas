import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  CakeSlice,
  ChefHat,
  ClipboardList,
  Calculator,
  PackageOpen,
  Copy,
  Tag,
  Pencil
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { RecipeDialog } from "./RecipeDialog";
import { RecipeDetails } from "./RecipeDetails";

const CATEGORIES = [
  "Todos",
  "Doces",
  "Salgados",
  "Bolos",
  "Tortas",
  "Bebidas",
  "Outros"
];

const helpCards = [
  {
    icon: ChefHat,
    title: "Como Criar Receitas",
    description: "Clique em 'Nova Receita', adicione o nome, descrição e foto. Em seguida, selecione os ingredientes e suas quantidades."
  },
  {
    icon: ClipboardList,
    title: "Gestão de Ingredientes",
    description: "Adicione todos os ingredientes necessários da sua receita. O sistema calculará automaticamente o custo com base nos preços cadastrados."
  },
  {
    icon: PackageOpen,
    title: "Embalagens",
    description: "Selecione as embalagens utilizadas no produto final. O custo será incluído automaticamente no cálculo."
  },
  {
    icon: Calculator,
    title: "Cálculo de Custos",
    description: "O sistema calcula automaticamente o custo total da receita e o custo por porção com base nos ingredientes e embalagens."
  }
];

type Recipe = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  servings: number;
  category: string | null;
  total_cost: number;
  packaging_cost: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
  vendor_id: string;
};

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const { data: recipes, refetch } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar receitas");
        throw error;
      }

      return data as Recipe[];
    },
  });

  const handleDuplicate = async (recipe: Recipe) => {
    try {
      // Primeiro, duplicar a receita principal
      const { data: newRecipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          ...recipe,
          id: undefined,
          name: `${recipe.name} (Cópia)`,
          created_at: undefined,
          updated_at: undefined
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Duplicar os ingredientes da receita
      const { data: ingredients, error: ingredientsQueryError } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", recipe.id);

      if (ingredientsQueryError) throw ingredientsQueryError;

      if (ingredients && ingredients.length > 0) {
        const newIngredients = ingredients.map(item => ({
          ...item,
          id: undefined,
          recipe_id: newRecipe.id,
          created_at: undefined
        }));

        const { error: ingredientsError } = await supabase
          .from("recipe_ingredients")
          .insert(newIngredients);

        if (ingredientsError) throw ingredientsError;
      }

      // Duplicar as embalagens da receita
      const { data: packages, error: packagesQueryError } = await supabase
        .from("recipe_packages")
        .select("*")
        .eq("recipe_id", recipe.id);

      if (packagesQueryError) throw packagesQueryError;

      if (packages && packages.length > 0) {
        const newPackages = packages.map(item => ({
          ...item,
          id: undefined,
          recipe_id: newRecipe.id,
          created_at: undefined
        }));

        const { error: packagesError } = await supabase
          .from("recipe_packages")
          .insert(newPackages);

        if (packagesError) throw packagesError;
      }

      toast.success("Receita duplicada com sucesso!");
      refetch();
    } catch (error) {
      toast.error("Erro ao duplicar receita");
      console.error(error);
    }
  };

  const filteredRecipes = recipes?.filter(recipe =>
    (recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())) &&
    (selectedCategory === "Todos" || recipe.category === selectedCategory)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Receitas</h1>
          <p className="text-muted-foreground">
            Crie e gerencie suas receitas de forma simples e organizada
          </p>
        </div>
        <RecipeDialog onSave={refetch} />
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
            placeholder="Buscar por nome ou descrição..."
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
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Porções</TableHead>
              <TableHead>Custo Total</TableHead>
              <TableHead>Custo/Porção</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecipes?.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                      <CakeSlice size={20} />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {recipe.category ? (
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-muted-foreground" />
                      <span>{recipe.category}</span>
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell>{recipe.servings}</TableCell>
                <TableCell>R$ {recipe.total_cost.toFixed(2)}</TableCell>
                <TableCell>R$ {recipe.cost_per_unit.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedRecipeId(recipe.id)}
                      title="Ver detalhes"
                    >
                      <ClipboardList size={16} />
                    </Button>
                    <RecipeDialog
                      recipeId={recipe.id}
                      onSave={refetch}
                      trigger={
                        <Button variant="ghost" size="icon" title="Editar receita">
                          <Pencil size={16} />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(recipe)}
                      title="Duplicar receita"
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {(!filteredRecipes || filteredRecipes.length === 0) && (
              <TableRow>
                <TableCell 
                  colSpan={7} 
                  className="h-32 text-center text-muted-foreground"
                >
                  {searchTerm || selectedCategory !== "Todos"
                    ? "Nenhuma receita encontrada com os filtros aplicados"
                    : "Nenhuma receita cadastrada"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <RecipeDetails
        recipeId={selectedRecipeId}
        onClose={() => setSelectedRecipeId(null)}
      />
    </div>
  );
};

export default Recipes;
