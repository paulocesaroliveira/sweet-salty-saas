
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export function StoreSettingsForm() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de atualização
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
          <CardDescription>
            Informações básicas sobre seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="store_name">Nome da Loja</Label>
              <Input
                id="store_name"
                defaultValue={profile?.store_name}
                placeholder="Nome da sua loja"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">CNPJ/CPF</Label>
              <Input
                id="document"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                defaultValue={profile?.whatsapp}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                defaultValue={profile?.instagram}
                placeholder="@seuperfil"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Loja</Label>
            <Textarea
              id="description"
              defaultValue={profile?.store_description}
              placeholder="Conte um pouco sobre seu negócio..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalização</CardTitle>
          <CardDescription>
            Personalize a aparência da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo da Loja</Label>
            <Input type="file" accept="image/*" />
          </div>

          <div className="space-y-2">
            <Label>Banner da Loja</Label>
            <Input type="file" accept="image/*" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme_color">Cor Principal</Label>
            <Input
              type="color"
              id="theme_color"
              className="h-10 w-20"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domínio</CardTitle>
          <CardDescription>
            Configure o endereço da sua loja online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom_domain">Domínio Personalizado</Label>
            <Input
              id="custom_domain"
              placeholder="www.minhaloja.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomínio Gratuito</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                placeholder="minhaloja"
              />
              <span className="text-muted-foreground">.saassobremesas.com</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades</CardTitle>
          <CardDescription>
            Ative ou desative recursos da sua loja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Página Pública da Loja</Label>
              <p className="text-sm text-muted-foreground">
                Permite que clientes vejam sua loja online
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Comentários e Avaliações</Label>
              <p className="text-sm text-muted-foreground">
                Permite que clientes deixem avaliações na sua loja
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
