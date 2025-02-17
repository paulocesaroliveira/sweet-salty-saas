
import { Calendar as CalendarIcon } from "lucide-react";

const Calendar = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display mb-1">Agenda</h1>
        <p className="text-neutral-600">Gerencie suas entregas</p>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
            <CalendarIcon className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-medium">Calendário de Entregas</h2>
            <p className="text-neutral-600">Visualize e organize suas entregas</p>
          </div>
        </div>

        <div className="text-center py-12 text-neutral-600">
          <CalendarIcon className="mx-auto mb-4 text-neutral-400" size={48} />
          <p>Implementação do calendário em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
