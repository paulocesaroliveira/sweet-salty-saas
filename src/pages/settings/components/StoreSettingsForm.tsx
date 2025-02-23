
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  store_name: string;
  store_description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  telegram: string | null;
  document: string | null;
  theme_color: string | null;
  logo_url: string | null;
  banner_url: string | null;
  custom_domain: string | null;
  subdomain: string | null;
  is_public: boolean;
  allow_reviews: boolean;
}

export function StoreSettingsForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { data: profile, refetch } = useQuery<Profile>({
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

  const handleImageUpload = async (file: File, type: 'logo' | 'banner') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${type}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('store-assets')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('store-assets')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const logoFile = (formData.get('logo') as File)?.size > 0 ? formData.get('logo') as File : null;
      const bannerFile = (formData.get('banner') as File)?.size > 0 ? formData.get('banner') as File : null;

      let logo_url = profile?.logo_url;
      let banner_url = profile?.banner_url;

      if (logoFile) {
        logo_url = await handleImageUpload(logoFile, 'logo');
      }

      if (bannerFile) {
        banner_url = await handleImageUpload(bannerFile, 'banner');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          store_name: String(formData.get('store_name')),
          document: String(formData.get('document')),
          whatsapp: String(formData.get('whatsapp')),
          instagram: String(formData.get('instagram')),
          store_description: String(formData.get('description')),
          theme_color: String(formData.get('theme_color')),
          logo_url,
          banner_url,
          custom_domain: String(formData.get('custom_domain')),
          subdomain: String(formData.get('subdomain')),
          is_public: formData.get('is_public') === 'on',
          allow_reviews: formData.get('allow_reviews') === 'on',
        })
        .eq('id', user?.id);

      if (error) throw error;

      await refetch();
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar as configurações');
    } finally {
      setIsLoading(false);
    }
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
                name="store_name"
                defaultValue={profile?.store_name}
                placeholder="Nome da sua loja"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">CNPJ/CPF</Label>
              <Input
                id="document"
                name="document"
                defaultValue={profile?.document ?? ''}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={profile?.whatsapp ?? ''}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                name="instagram"
                defaultValue={profile?.instagram ?? ''}
                placeholder="@seuperfil"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição da Loja</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={profile?.store_description ?? ''}
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
            {profile?.logo_url && (
              <div className="mb-2">
                <img 
                  src={profile.logo_url} 
                  alt="Logo atual" 
                  className="w-32 h-32 object-contain rounded-lg border"
                />
              </div>
            )}
            <Input name="logo" type="file" accept="image/*" />
          </div>

          <div className="space-y-2">
            <Label>Banner da Loja</Label>
            {profile?.banner_url && (
              <div className="mb-2">
                <img 
                  src={profile.banner_url} 
                  alt="Banner atual" 
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}
            <Input name="banner" type="file" accept="image/*" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme_color">Cor Principal</Label>
            <Input
              type="color"
              id="theme_color"
              name="theme_color"
              defaultValue={profile?.theme_color ?? '#000000'}
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
              name="custom_domain"
              defaultValue={profile?.custom_domain ?? ''}
              placeholder="www.minhaloja.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subdomain">Subdomínio Gratuito</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain"
                name="subdomain"
                defaultValue={profile?.subdomain ?? ''}
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
              <Label htmlFor="is_public">Página Pública da Loja</Label>
              <p className="text-sm text-muted-foreground">
                Permite que clientes vejam sua loja online
              </p>
            </div>
            <Switch 
              id="is_public"
              name="is_public"
              defaultChecked={profile?.is_public}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_reviews">Comentários e Avaliações</Label>
              <p className="text-sm text-muted-foreground">
                Permite que clientes deixem avaliações na sua loja
              </p>
            </div>
            <Switch 
              id="allow_reviews"
              name="allow_reviews"
              defaultChecked={profile?.allow_reviews}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  );
}
