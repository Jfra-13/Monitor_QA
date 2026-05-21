import type { PingLog } from "@/core/apiClient";
import { useState } from "react";

interface Props {
  data: PingLog[]; // Esperamos los últimos 50 pings
}

const ITEMS_PER_PAGE = 10;

export default function PingHistoryTable({ data }: Props) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  // Calculamos qué items mostrar en la página actual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = data.slice(startIndex, endIndex);

  const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((page) => Math.max(page - 1, 1));

  if (data.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-500">No hay registros de pings para este endpoint.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="table w-full">
        <thead className="bg-slate-50/50">
          <tr className="text-slate-500 uppercase text-xs tracking-wider">
            <th>Resultado</th>
            <th>Código HTTP</th>
            <th>Latencia</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {currentItems.map((ping) => (
            <tr key={ping.id} className="hover:bg-slate-50/80 transition-colors">
              <td>
                <div className={`badge badge-sm border-none ${ping.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {ping.success ? 'Éxito' : 'Fallo'}
                </div>
              </td>
              <td className="text-slate-600">{ping.statusCode}</td>
              <td className="text-slate-600 font-medium">{ping.responseTimeMs} ms</td>
              <td className="text-slate-400 text-sm">
                {new Date(ping.timestamp).toLocaleString('es-ES')}
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