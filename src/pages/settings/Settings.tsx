
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display mb-1">Configurações</h1>
        <p className="text-neutral-600">Gerencie suas preferências</p>
      </div>

      <div className="grid gap-6">
        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
              <SettingsIcon className="text-primary" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-medium">Configurações da Loja</h2>
              <p className="text-neutral-600">Personalize sua experiência</p>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label htmlFor="store-name" className="label">Nome da Loja</label>
              <input
                type="text"
                id="store-name"
                placeholder="Digite o nome da sua loja"
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="label">Descrição</label>
              <textarea
                id="description"
                placeholder="Digite uma descrição para sua loja"
                className="input-field min-h-[100px]"
              />
            </div>

            <button type="submit" className="btn-primary">
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
