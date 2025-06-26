import { useState, useEffect, useRef } from 'react';
import { API_URL, GET_HEADER } from '../../config/config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const UNDO_TIMEOUT = 3000;

const useTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    fields: ['name', 'email', 'phone', 'memberCount'],
    all: false
  });
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [newTrainer, setNewTrainer] = useState({ name: '', email: '', phone: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Undo states
  const [pendingDelete, setPendingDelete] = useState(null);
  const [undoSnackbarOpen, setUndoSnackbarOpen] = useState(false);
  const undoTimeoutRef = useRef(null);

  const [pendingBulkDelete, setPendingBulkDelete] = useState([]);
  const [bulkUndoSnackbarOpen, setBulkUndoSnackbarOpen] = useState(false);
  const bulkUndoTimeoutRef = useRef(null);

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return 'Name can only contain letters and spaces';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (!phone) {
      return 'Phone number is required';
    }
    
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Ethiopian phone number validation
    // Format: +251XXXXXXXXX (13 digits) or 09XXXXXXXXX (10 digits) or 07XXXXXXXXX (10 digits)
    if ( cleanPhone.startsWith('251')) {
      return null; // Valid +251 format
    }
    if ( (cleanPhone.startsWith('09') || cleanPhone.startsWith('07'))) {
      return null; // Valid 09 or 07 format
    }
    
    return 'Please enter a valid Ethiopian phone number (+251XXXXXXXXX, 09XXXXXXXXX, or 07XXXXXXXXX)';
  };

  const validateTrainer = (trainer) => {
    const nameError = validateName(trainer.name);
    if (nameError) return nameError;
    
    const emailError = validateEmail(trainer.email);
    if (emailError) return emailError;
    
    const phoneError = validatePhone(trainer.phone);
    if (phoneError) return phoneError;
    
    return null;
  };

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const { headers } = await GET_HEADER();
      const res = await fetch(`${API_URL}/trainers/with-members`, {
        method: 'GET',
        headers
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setTrainers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch trainers' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrainers();
    return () => {
      clearTimeout(undoTimeoutRef.current);
      clearTimeout(bulkUndoTimeoutRef.current);
    };
  }, []);

  // Filtering and sorting
  const filteredTrainers = trainers
    .filter(tr =>
      tr.name.toLowerCase().includes(search.toLowerCase()) ||
      tr.email.toLowerCase().includes(search.toLowerCase()) ||
      tr.phone.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSelect = (id) => {
    setSelected(selected.includes(id) ? selected.filter(sid => sid !== id) : [...selected, id]);
  };

  const handleSelectAll = () => {
    if (selected.length === filteredTrainers.length) setSelected([]);
    else setSelected(filteredTrainers.map(tr => tr.id));
  };

  // Export functions
  const exportTrainers = (data, fields, format) => {
    if (format === 'csv') {
      exportCSV(data, fields);
    } else if (format === 'pdf') {
      exportPDF(data, fields);
    }
  };

  // Export CSV
  const exportCSV = (data, fields) => {
    const fieldLabels = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      memberCount: 'Assigned Members'
    };

    const rows = data.map(tr => {
      const row = {};
      fields.forEach(field => {
        row[fieldLabels[field]] = tr[field] || 0;
      });
      return row;
    });

    const csv = [Object.keys(rows[0]).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trainers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export PDF
  const exportPDF = (data, fields) => {
    const fieldLabels = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      memberCount: 'Assigned Members'
    };

    const doc = new jsPDF();
    doc.text('Trainers', 14, 16);
    
    const headers = fields.map(field => fieldLabels[field]);
    const body = data.map(tr => 
      fields.map(field => tr[field] || 0)
    );

    autoTable(doc, {
      head: [headers],
      body: body
    });
    doc.save('trainers.pdf');
  };

  const handleExport = () => {
    exportTrainers(
      filteredTrainers,
      exportOptions.fields,
      exportOptions.format
    );
    setExportDialogOpen(false);
  };

  // Undoable Delete
  const handleDelete = (id) => {
    const trainer = trainers.find(t => t.id === id);
    setPendingDelete(trainer);
    setTrainers(trainers.filter(t => t.id !== id));
    setUndoSnackbarOpen(true);
    undoTimeoutRef.current = setTimeout(() => {
      performDelete(id);
      setPendingDelete(null);
      setUndoSnackbarOpen(false);
    }, UNDO_TIMEOUT);
  };

  const performDelete = async (id) => {
    setDeleteLoading(true);
    try {
      const { headers } = await GET_HEADER();
      const res = await fetch(`${API_URL}/trainers/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Delete failed');
      }
      setSnackbar({ open: true, message: 'Trainer deleted successfully' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Delete failed' });
      fetchTrainers(); // restore trainers if backend delete fails
    }
    setDeleteLoading(false);
  };

  const handleUndoDelete = () => {
    clearTimeout(undoTimeoutRef.current);
    setTrainers(prev => pendingDelete ? [pendingDelete, ...prev] : prev);
    setPendingDelete(null);
    setUndoSnackbarOpen(false);
  };

  // Undoable Bulk Delete
  const handleBulkDelete = () => {
    const trainersToDelete = trainers.filter(t => selected.includes(t.id));
    setPendingBulkDelete(trainersToDelete);
    setTrainers(trainers.filter(t => !selected.includes(t.id)));
    setBulkUndoSnackbarOpen(true);
    bulkUndoTimeoutRef.current = setTimeout(() => {
      performBulkDelete(selected);
      setPendingBulkDelete([]);
      setBulkUndoSnackbarOpen(false);
      setSelected([]);
    }, UNDO_TIMEOUT);
  };

  const performBulkDelete = async (ids) => {
    setDeleteLoading(true);
    try {
      const { headers } = await GET_HEADER();
      await Promise.all(ids.map(id =>
        fetch(`${API_URL}/trainers/${id}`, {
          method: 'DELETE',
          headers
        })
      ));
      setSnackbar({ open: true, message: 'Selected trainers deleted successfully' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Bulk delete failed' });
      fetchTrainers(); // restore trainers if backend delete fails
    }
    setDeleteLoading(false);
  };

  const handleUndoBulkDelete = () => {
    clearTimeout(bulkUndoTimeoutRef.current);
    setTrainers(prev => [...pendingBulkDelete, ...prev]);
    setPendingBulkDelete([]);
    setBulkUndoSnackbarOpen(false);
    setSelected([]);
  };

  // Edit
  const handleEdit = (trainer) => {
    setCurrentTrainer({ ...trainer });
    setEditDialogOpen(true);
  };
  
  const handleEditSave = async () => {
    const validationError = validateTrainer(currentTrainer);
    if (validationError) {
      setSnackbar({ open: true, message: validationError });
      return;
    }
    
    setFormLoading(true);
    try {
      const { headers } = await GET_HEADER({ isJson: true });
      const res = await fetch(`${API_URL}/trainers/${currentTrainer.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(currentTrainer)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }
      
      setSnackbar({ open: true, message: 'Trainer updated successfully' });
      setEditDialogOpen(false);
      fetchTrainers();
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Update failed' });
    }
    setFormLoading(false);
  };

  // Create
  const handleCreate = () => {
    setNewTrainer({ name: '', email: '', phone: '' });
    setCreateDialogOpen(true);
  };

  const handleCreateSave = async () => {
    const validationError = validateTrainer(newTrainer);
    if (validationError) {
      setSnackbar({ open: true, message: validationError });
      return;
    }
    
    setFormLoading(true);
    try {
      const { headers } = await GET_HEADER({ isJson: true });
      const res = await fetch(`${API_URL}/trainers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newTrainer)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Creation failed');
      }
      
      setSnackbar({ open: true, message: 'Trainer created successfully' });
      setCreateDialogOpen(false);
      fetchTrainers();
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Creation failed' });
    }
    setFormLoading(false);
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return {
    // State
    trainers,
    selected,
    search,
    sortBy,
    sortOrder,
    loading,
    editDialogOpen,
    createDialogOpen,
    exportDialogOpen,
    exportOptions,
    currentTrainer,
    newTrainer,
    snackbar,
    deleteLoading,
    formLoading,
    filteredTrainers,
    pendingDelete,
    undoSnackbarOpen,
    pendingBulkDelete,
    bulkUndoSnackbarOpen,

    // Actions
    setSearch,
    setSortBy,
    setSortOrder,
    setEditDialogOpen,
    setCreateDialogOpen,
    setExportDialogOpen,
    setExportOptions,
    setCurrentTrainer,
    setNewTrainer,
    closeSnackbar,
    handleSelect,
    handleSelectAll,
    handleDelete,
    handleBulkDelete,
    handleUndoDelete,
    handleUndoBulkDelete,
    handleEdit,
    handleEditSave,
    handleCreate,
    handleCreateSave,
    handleExport
  };
};

export default useTrainers; 