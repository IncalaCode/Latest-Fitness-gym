import { useState, useRef } from 'react';
import { API_URL, GET_HEADER } from '../../config/config';

export default function usePackageDelete({ onDeleted }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const deleteTimeoutRef = useRef(null);
  const [deleting, setDeleting] = useState(false);

  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [bulkDeleteSnackbarOpen, setBulkDeleteSnackbarOpen] = useState(false);
  const bulkDeleteTimeoutRef = useRef(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Single delete
  const handleDeleteClick = (pkg) => {
    setPendingDelete(pkg);
    setSnackbarOpen(true);
    deleteTimeoutRef.current = setTimeout(() => {
      finalizeDelete(pkg);
    }, 5000);
  };

  const handleUndoDelete = () => {
    setSnackbarOpen(false);
    setPendingDelete(null);
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }
  };

  const finalizeDelete = async (pkg) => {
    setDeleting(true);
    setSnackbarOpen(false);
    setPendingDelete(null);
    try {
      const { headers } = await GET_HEADER({ isJson: true });
      const response = await fetch(`${API_URL}/packages/${pkg.id}`, {
        method: 'DELETE',
        headers
      });
      if (response.ok && onDeleted) {
        onDeleted([pkg.id]);
      }
    } catch (error) {
      // Optionally handle error
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete
  const handleBulkDeleteClick = (ids) => {
    setPendingBulkDelete(ids);
    setBulkDeleteSnackbarOpen(true);
    bulkDeleteTimeoutRef.current = setTimeout(() => {
      finalizeBulkDelete(ids);
    }, 5000);
  };

  const handleUndoBulkDelete = () => {
    setBulkDeleteSnackbarOpen(false);
    setPendingBulkDelete(false);
    if (bulkDeleteTimeoutRef.current) {
      clearTimeout(bulkDeleteTimeoutRef.current);
      bulkDeleteTimeoutRef.current = null;
    }
  };

  const finalizeBulkDelete = async (ids) => {
    setBulkDeleting(true);
    setBulkDeleteSnackbarOpen(false);
    setPendingBulkDelete(false);
    const deletedIds = [];
    for (const id of ids) {
      try {
        const { headers } = await GET_HEADER({ isJson: true });
        const response = await fetch(`${API_URL}/packages/${id}`, {
          method: 'DELETE',
          headers
        });
        if (response.ok) deletedIds.push(id);
      } catch (error) {
        // Optionally handle error
      }
    }
    if (onDeleted) onDeleted(deletedIds);
    setBulkDeleting(false);
  };

  return {
    // Single delete
    pendingDelete,
    snackbarOpen,
    handleDeleteClick,
    handleUndoDelete,
    finalizeDelete,
    deleting,
    // Bulk delete
    pendingBulkDelete,
    bulkDeleteSnackbarOpen,
    handleBulkDeleteClick,
    handleUndoBulkDelete,
    finalizeBulkDelete,
    bulkDeleting
  };
} 