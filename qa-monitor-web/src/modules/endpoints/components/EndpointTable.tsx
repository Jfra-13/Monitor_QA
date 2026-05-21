import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $endpoints, setInitialEndpoints, removeEndpointFromList, updateEndpointInList } from '../endpointStore';
import { api, type ApiEndpoint } from '@/core/apiClient';
import { openDeleteModal } from '../endpointStore';

interface Props {
  initialEndpoints: ApiEndpoint[];
}

const ITEMS_PER_PAGE = 10;

export default function EndpointTable({ initialEndpoints }: Props) {
  const endpoints = useStore($endpoints);
  const [currentPage, setCurrentPage] = useState(1);

  // Sincronizamos los datos del servidor al inicializar el componente
  useEffect(() => {
    setInitialEndpoints(initialEndpoints);
  }, [initialEndpoints]);

  const totalPages = Math.ceil(endpoints.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = endpoints.slice(startIndex, endIndex);

  const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((page) => Math.max(page - 1, 1));

  const handleDelete = async (id: string) => {
    openDeleteModal(id);
    // if (!confirm('¿Estás seguro de que deseas eliminar esta API?')) return;
    // try {
    //   await api.deleteEndpoint(id);
    //   removeEndpointFromList(id);
    // } catch (error) {
    //   alert('Error al eliminar el endpoint: ' + error);
    // }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      // Revisa si tu apiClient usa updateEndpoint o un método similar
      await api.updateEndpoint(id, { isActive: nextStatus }); 
      updateEndpointInList(id, { isActive: nextStatus });
    } catch (error) {
      alert('Error al cambiar el estado: ' + error);
    }
  };

  if (endpoints.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-500">No hay APIs registradas actualmente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="table w-full">
        <thead className="bg-slate-50/50">
          <tr className="text-slate-500 uppercase text-xs tracking-wider">
            <th>Estado</th>
            <th>Servicio</th>
            <th>URL</th>
            <th>Registro</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {currentItems.map((ep) => (
            <tr key={ep.id} className="hover:bg-slate-50/80 transition-colors">
              <td>
                <div className={`badge badge-sm border-none ${ep.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {ep.isActive ? 'Activo' : 'Inactivo'}
                </div>
              </td>
              <td className="font-bold text-slate-700">{ep.name}</td>
              <td className="text-slate-400 font-mono text-xs">{ep.url}</td>
              <td className="text-slate-400 text-sm">
                {new Date(ep.createdAt).toLocaleDateString()}
              </td>
              {/* Todas las acciones agrupadas en la misma celda de la tabla */}
              <td className="text-right space-x-1">
                <a href={`/endpoint/${ep.id}`} className="btn btn-ghost btn-xs text-blue-600 normal-case">
                  Auditar
                </a>
                <button 
                  className={`btn btn-ghost btn-xs normal-case ${ep.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                  onClick={() => toggleStatus(ep.id, ep.isActive)}
                >
                  {ep.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button 
                  className="btn btn-ghost btn-xs text-red-600 normal-case" 
                  onClick={() => handleDelete(ep.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="p-4 flex items-center justify-between bg-slate-50/50 border-t border-slate-200">
        <span className="text-sm text-slate-500">
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button onClick={goToPrevPage} disabled={currentPage === 1} className="btn btn-sm btn-ghost normal-case">Anterior</button>
          <button onClick={goToNextPage} disabled={currentPage === totalPages} className="btn btn-sm btn-ghost normal-case">Siguiente</button>
        </div>
      </div>
    </div>
  );
}
