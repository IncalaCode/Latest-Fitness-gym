import { useState, useEffect } from 'react';

export default function TrainerReassignModal({ open, onClose, member, trainers = [], onSubmit, loading }) {
  const [selectedTrainer, setSelectedTrainer] = useState(member?.trainerId || '');
  useEffect(() => {
    setSelectedTrainer(member?.trainerId || '');
  }, [member]);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    onSubmit(selectedTrainer || null);
  };

  if (!open) return null;

  const currentTrainer = trainers.find(tr => String(tr.id) === String(member?.trainerId));
  console.log('DEBUG currentTrainer:', currentTrainer, 'member.trainerId:', member?.trainerId, 'trainers:', trainers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4">Reassign/Remove Trainer</h2>
        <div className="mb-4">
          <div className="font-semibold">Member:</div>
          <div>{member?.name}</div>
        </div>
        <div className="mb-2 text-sm text-gray-700">
          <span className="font-semibold">Current Trainer:</span>{' '}
          {currentTrainer ? `${currentTrainer.name} (${currentTrainer.email})` : <span className="italic text-gray-400">No trainer assigned</span>}
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">Assign Trainer</div>
          <select
            className="w-full border rounded-lg p-2"
            value={selectedTrainer || ''}
            onChange={e => setSelectedTrainer(e.target.value)}
            disabled={loading}
          >
            <option value="">None (Remove Trainer)</option>
            {trainers.map(tr => (
              <option key={tr.id} value={tr.id}>{tr.name} ({tr.email})</option>
            ))}
          </select>
          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
} 