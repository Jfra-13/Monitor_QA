import { atom } from 'nanostores';

interface Endpoint {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  isActive: boolean;
}

// Control del Modal de añadir
export const isModalOpen = atom(false);
export const openModal = () => isModalOpen.set(true);
export const closeModal = () => isModalOpen.set(false);

// Control del Modal de eliminar
export const isDeleteModalOpen = atom(false);
export const deleteTargetId = atom<string | null>(null);
export const openDeleteModal = (id: string) => {
  deleteTargetId.set(id);
  isDeleteModalOpen.set(true);
};
export const closeDeleteModal = () => {
  deleteTargetId.set(null);
  isDeleteModalOpen.set(false);
};

// Control de los datos de la Tabla
export const $endpoints = atom<Endpoint[]>([]);

export const setInitialEndpoints = (list: Endpoint[]) => $endpoints.set(list);
export const addEndpointToList = (item: Endpoint) => $endpoints.set([...$endpoints.get(), item]);
export const removeEndpointFromList = (id: string) => $endpoints.set($endpoints.get().filter(ep => ep.id !== id));
export const updateEndpointInList = (id: string, updatedFields: Partial<Endpoint>) => {
  $endpoints.set($endpoints.get().map(ep =>
    ep.id === id ? { ...ep, ...updatedFields } : ep
  ));
};