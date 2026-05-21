import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { isDeleteModalOpen, deleteTargetId, closeDeleteModal, removeEndpointFromList } from '../endpointStore';
import { api } from '@/core/apiClient';

export default function ConfirmDeleteModal() {
  const isOpen = useStore(isDeleteModalOpen);
  const targetId = useStore(deleteTargetId);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCancel = () => {
    if (loading) return;
    closeDeleteModal();
  };

  const handleConfirm = async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      await api.deleteEndpoint(targetId);
      removeEndpointFromList(targetId);
      closeDeleteModal();
    } catch (err) {
      alert('Error al eliminar el endpoint: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Confirmar eliminación</h3>
        <p className="py-4">¿Estás seguro de que deseas eliminar este endpoint? Esta acción no se puede deshacer.</p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={handleCancel} disabled={loading}>Cancelar</button>
          <button className={`btn btn-error ${loading ? 'loading' : ''}`} onClick={handleConfirm} disabled={loading}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}