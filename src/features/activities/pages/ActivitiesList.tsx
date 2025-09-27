import { ActivityForm } from "@/features/activities/components/ActivityForm";
import Modal, { ModalBody, ModalFooter } from "@/components/ui/Modal";
import { useModal } from "@/hooks/useModal";
import { Plus, Calendar, Hash } from "lucide-react";
import { useActivityContext } from "../context/ActivityContext";
import { useActivities, useCreateActivity } from "../hooks/activity-hooks";
import { Loader } from "@/components/loader/Loader";
import { toast } from "sonner";
import { formatDateToSpanishIntl } from "@/utils/date";

export function ActivitiesList() {
  const { isOpen, openModal, closeModal } = useModal();
  const { form } = useActivityContext();
  const { data: activities, isLoading, error } = useActivities();
  const { mutateAsync, isPending } = useCreateActivity();

  const handleCloseModal = () => {
    closeModal();
    form.reset();
  };

  const submitForm = async () => {
    const isValid = await form.trigger();

    if (isValid) {
      const data = form.getValues();
      closeModal();
      try {
        await mutateAsync(data);
        form.reset();
        toast.success("Evento guardado con éxito");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-800">
            Error al cargar los eventos: {error.message}
          </div>
        </div>
      </div>
    );
  }

  console.log("activities", activities);

  return (
    <>
      {isLoading && <Loader message="Cargando eventos..." />}
      {isPending && <Loader message="Guardando evento..." />}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>

            <button onClick={openModal} className="button button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Evento
            </button>
          </div>

          {/* Activities Table */}
          {activities && activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Hash size={14} className="mr-1" />
                        Código
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre del Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        Fecha
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {activity.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateToSpanishIntl(activity.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-4">
                          <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-900 transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Calendar className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay eventos
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando tu primer evento.
              </p>
              <div className="mt-6">
                <button
                  onClick={openModal}
                  className="button button-primary mx-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Evento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Registrar Evento"
        size="md"
      >
        <ModalBody>
          <ActivityForm />
        </ModalBody>

        <ModalFooter>
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button onClick={submitForm} className="button button-primary">
            Registrar
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
