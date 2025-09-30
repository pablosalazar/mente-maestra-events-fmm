import { ActivityForm } from "@/features/activities/components/ActivityForm";
import Modal, { ModalBody, ModalFooter } from "@/components/ui/Modal";
import Switch from "@/components/ui/Switch";
import { useModal } from "@/hooks/useModal";
import { Plus, Calendar, Hash, Trash2 } from "lucide-react";
import { useActivityContext } from "../context/ActivityContext";
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
} from "../hooks/activity-hooks";
import { useSetActivityCode } from "@/features/settings/hooks/settings-hooks";
import { Loader } from "@/components/loader/Loader";
import { toast } from "sonner";
import { formatDateToSpanishIntl } from "@/utils/date";
import { useState } from "react";
import type { Activity } from "../types";
import { useSettings } from "@/features/settings/context/SettingsContext";

export default function ActivitiesList() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    settings: { activityCode },
    refetch: refetchSettings,
  } = useSettings();
  const { form } = useActivityContext();
  const { data: activities, isLoading, error } = useActivities();
  const { mutateAsync: createActivity, isPending: isCreating } =
    useCreateActivity();
  const { mutateAsync: updateActivity, isPending: isUpdating } =
    useUpdateActivity();
  const { mutateAsync: deleteActivity, isPending: isDeleting } =
    useDeleteActivity();
  const { mutateAsync: setActivityCode, isPending: isUpdatingCode } =
    useSetActivityCode();
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(
    null
  );

  const isModalLoading = isCreating || isUpdating;
  const isEditMode = !!editingActivity;

  const handleCloseModal = () => {
    closeModal();
    form.reset();
    setEditingActivity(null);
  };

  const handleOpenCreateModal = () => {
    setEditingActivity(null);
    form.reset({
      name: "",
      date: new Date(),
    });
    openModal();
  };

  const handleOpenEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    form.reset({
      name: activity.name,
      date: activity.date,
    });
    openModal();
  };

  const updateActivityCode = async (code: string) => {
    const newCode = code !== activityCode ? code : null;

    try {
      await setActivityCode(newCode);
      toast.success("Código de actividad actualizado con éxito");
      refetchSettings();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          `Error al actualizar el código de actividad: ${error.message}`
        );
      } else {
        toast.error("Error al actualizar el código de actividad");
      }
    }
  };

  const handleDeleteActivity = async (activity: Activity) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el evento "${activity.name}"? Esta acción no se puede deshacer.`
    );

    if (confirmDelete) {
      setDeletingActivityId(activity.id);
      try {
        await deleteActivity(activity.id);
        toast.success("Evento eliminado con éxito");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(`Error al eliminar el evento: ${error.message}`);
        } else {
          toast.error("Error al eliminar el evento");
        }
      } finally {
        setDeletingActivityId(null);
      }
    }
  };

  const submitForm = async () => {
    const isValid = await form.trigger();

    if (isValid) {
      const data = form.getValues();

      try {
        if (isEditMode && editingActivity) {
          await updateActivity({
            id: editingActivity.id,
            ...data,
          });
          toast.success("Evento actualizado con éxito");
        } else {
          await createActivity(data);
          toast.success("Evento guardado con éxito");
        }
        form.reset();
        setEditingActivity(null);
        closeModal();
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

  return (
    <>
      {isLoading && <Loader message="Cargando eventos..." />}
      {isModalLoading && (
        <Loader
          message={
            isEditMode ? "Actualizando evento..." : "Guardando evento..."
          }
        />
      )}
      {isDeleting && <Loader message="Eliminando evento..." />}
      {isUpdatingCode && (
        <Loader message="Actualizando código de actividad..." />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>

            <button
              onClick={handleOpenCreateModal}
              className="button button-primary"
            >
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
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity, index) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {index + 1}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={activityCode === activity.id}
                            onChange={() => updateActivityCode(activity.id)}
                            size="sm"
                            disabled={isUpdatingCode}
                          />
                          <span
                            className={`text-sm font-medium ${
                              activityCode === activity.id
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {activityCode === activity.id
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleOpenEditModal(activity)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors disabled:text-indigo-300 disabled:cursor-not-allowed"
                            disabled={
                              isDeleting ||
                              isUpdatingCode ||
                              activityCode === activity.id
                            }
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity)}
                            disabled={
                              deletingActivityId === activity.id ||
                              isDeleting ||
                              isUpdatingCode ||
                              activityCode === activity.id
                            }
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {deletingActivityId === activity.id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3 mr-1" />
                                Eliminar
                              </>
                            )}
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
                  onClick={handleOpenCreateModal}
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
        title={isEditMode ? "Editar Evento" : "Registrar Evento"}
        size="md"
      >
        <ModalBody>
          <ActivityForm />
        </ModalBody>

        <ModalFooter>
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isCreating || isUpdating}
          >
            Cancelar
          </button>
          <button
            onClick={submitForm}
            className="button button-primary"
            disabled={isCreating || isUpdating}
          >
            {isEditMode ? "Actualizar" : "Registrar"}
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}
