
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Profile {
  id: string;
  store_name: string;
  store_description: string | null;
  whatsapp: string | null;
  telegram: string | null;
  instagram: string | null;
}

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user?.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
          setStoreName(data.store_name || "");
          setStoreDescription(data.store_description || "");
          setWhatsapp(data.whatsapp || "");
          setTelegram(data.telegram || "");
          setInstagram(data.instagram || "");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      getProfile();
    }
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          store_name: storeName,
          store_description: storeDescription,
          whatsapp: whatsapp || null,
          telegram: telegram || null,
          instagram: instagram || null,
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-display mb-6">Configurações da Loja</h2>

        <div className="space-y-6">
          <div>
            <label className="label">Nome da Loja</label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Digite o nome da sua loja"
            />
          </div>

          <div>
            <label className="label">Descrição da Loja</label>
            <Textarea
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="Digite uma breve descrição da sua loja"
            />
          </div>

          <div>
            <label className="label">WhatsApp</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 5511999999999 (apenas números)"
            />
            <p className="text-sm text-neutral-600 mt-1">
              Digite apenas números, incluindo código do país (55) e DDD
            </p>
          </div>

          <div>
            <label className="label">Telegram</label>
            <Input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="Seu username do Telegram (sem @)"
            />
          </div>

          <div>
            <label className="label">Instagram</label>
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Seu username do Instagram (sem @)"
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
