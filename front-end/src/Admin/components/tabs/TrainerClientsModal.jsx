import React from 'react';

export default function TrainerClientsModal({ open, onClose, trainer, clients = [], loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4">Clients for {trainer?.name}</h2>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No clients assigned to this trainer.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 border">Name</th>
                  <th className="px-3 py-2 border">Email</th>
                  <th className="px-3 py-2 border">Phone</th>
                  <th className="px-3 py-2 border">Trainer Description</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td className="px-3 py-2 border">{client.fullName}</td>
                    <td className="px-3 py-2 border">{client.email}</td>
                    <td className="px-3 py-2 border">{client.phone}</td>
                    <td className="px-3 py-2 border">{client.trainerDescription || <span className="italic text-gray-400">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 