// src/modules/endpoints/components/AddEndpointModal.tsx
import { useStore } from '@nanostores/react';
import { useState } from 'react';
import { isModalOpen, closeModal, addEndpointToList } from '../endpointStore'; // Importamos addEndpointToList
import { api } from '@/core/apiClient';

export default function AddEndpointModal() {
  const isOpen = useStore(isModalOpen);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Tu backend debe retornar la nueva API creada con su ID generado
      const newEndpoint = await api.createEndpoint(name, url);
      
      addEndpointToList(newEndpoint); // Agregamos directo al store, la tabla se actualizará sola
      closeModal();
      setName(''); // Reseteamos inputs
      setUrl('');
    } catch (error) {
      alert("Error al registrar: " + error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="modal modal-open bg-slate-900/50 backdrop-blur-sm">
      <div className="modal-box border border-slate-200">
        <h3 className="font-bold text-lg mb-4">Registrar Nueva API</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text">Nombre del Servicio</span></label>
            <input 
              type="text" placeholder="Ej: Auth Service" 
              className="input input-bordered w-full"
              value={name} onChange={e => setName(e.target.value)} required 
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">URL del Endpoint</span></label>
            <input 
              type="url" placeholder="https://api.ejemplo.com" 
              className="input input-bordered w-full"
              value={url} onChange={e => setUrl(e.target.value)} required 
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
            <button type="submit" className={`btn btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Endpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}