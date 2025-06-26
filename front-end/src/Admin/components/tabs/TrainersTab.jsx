import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
  Paper, Checkbox, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Chip, Snackbar, CircularProgress, Typography, useTheme, useMediaQuery, MenuItem, FormControlLabel, Card, CardContent
} from '@mui/material';
import { Edit, Delete, FileDownload, Add } from '@mui/icons-material';
import useTrainers from '../../hooks/useTrainers';
import useTrainerClients from '../../hooks/useTrainerClients';
import TrainerClientsModal from './TrainerClientsModal';

const TrainersTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    // State
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
    selected,
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
    handleEdit,
    handleEditSave,
    handleCreate,
    handleCreateSave,
    handleExport,
    handleUndoDelete,
    handleUndoBulkDelete
  } = useTrainers();

  const [clientsModalOpen, setClientsModalOpen] = React.useState(false);
  const [clientsModalTrainer, setClientsModalTrainer] = React.useState(null);
  const [clientsModalClients, setClientsModalClients] = React.useState([]);
  const { clients, loading: trainerClientsLoading, getTrainerClients } = useTrainerClients();

  const handleSort = (property) => {
    if (sortBy === property) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(property);
      setSortOrder('asc');
    }
  };

  const fieldOptions = [
    { id: 'name', label: 'Name' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Phone' },
    { id: 'memberCount', label: 'Assigned Members' }
  ];

  const handleSeeClients = async (trainer) => {
    setClientsModalTrainer(trainer);
    setClientsModalOpen(true);
    try {
      const data = await getTrainerClients(trainer.id);
      setClientsModalClients(data);
    } catch {}
  };

  const handleCloseClientsModal = () => {
    setClientsModalOpen(false);
    setClientsModalTrainer(null);
    setClientsModalClients([]);
  };

  // Mobile card component for trainers
  const TrainerCard = ({ trainer }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3">
            {trainer.name}
          </Typography>
          <Checkbox
            checked={selected.indexOf(trainer.id) !== -1}
            onChange={() => handleSelect(trainer.id)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Email: <strong>{trainer.email}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Phone: <strong>{trainer.phone}</strong>
          </Typography>
          <Chip
            label={`${trainer.memberCount || 0} Assigned Members`}
            size="small"
            color="primary"
            sx={{ mb: 1 }}
          />
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={() => handleEdit(trainer)}
          fullWidth
        >
          Edit Trainer
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => handleDelete(trainer.id)}
          fullWidth
          sx={{ mt: 1 }}
          disabled={deleteLoading}
        >
          {deleteLoading ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
        </Button>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleSeeClients(trainer)}
          fullWidth
          sx={{ mt: 1 }}
        >
          See Clients
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 2,
        mb: 2
      }}>
        <TextField
          label="Search Trainers"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flexGrow: isMobile ? 1 : 0, minWidth: isMobile ? '100%' : '300px' }}
        />
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
          width: isMobile ? '100%' : 'auto'
        }}>
          <Button 
            startIcon={<Add />} 
            onClick={handleCreate} 
            variant="contained" 
            color="primary"
            fullWidth={isMobile}
          >
            Add Trainer
          </Button>
          <Button
            variant="contained"
            onClick={() => setExportDialogOpen(true)}
            disabled={!exportOptions.fields.length}
            fullWidth={isMobile}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {selected.length > 0 && (
          <Button 
            color="error" 
            onClick={handleBulkDelete} 
            disabled={deleteLoading} 
            variant="contained"
          >
            {deleteLoading ? <CircularProgress size={18} /> : `Delete Selected (${selected.length})`}
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        // Mobile Card View
        <Box>
          {filteredTrainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredTrainers.length}
                    checked={filteredTrainers.length > 0 && selected.length === filteredTrainers.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'email'}
                    direction={sortBy === 'email' ? sortOrder : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'phone'}
                    direction={sortBy === 'phone' ? sortOrder : 'asc'}
                    onClick={() => handleSort('phone')}
                  >
                    Phone
                  </TableSortLabel>
                </TableCell>
                <TableCell>Assigned Members</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrainers.map(tr => (
                <TableRow key={tr.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selected.includes(tr.id)} onChange={() => handleSelect(tr.id)} />
                  </TableCell>
                  <TableCell>{tr.name}</TableCell>
                  <TableCell>{tr.email}</TableCell>
                  <TableCell>{tr.phone}</TableCell>
                  <TableCell>
                    <Chip label={tr.memberCount || 0} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      startIcon={<Edit />} 
                      onClick={() => handleEdit(tr)} 
                      variant="outlined"
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<Delete />} 
                      color="error" 
                      onClick={() => handleDelete(tr.id)} 
                      variant="outlined" 
                      sx={{ ml: 1 }} 
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? <CircularProgress size={18} /> : 'Delete'}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={() => handleSeeClients(tr)}
                      sx={{ ml: 1 }}
                    >
                      See Clients
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Trainers</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Format"
            value={exportOptions.format}
            onChange={(e) => setExportOptions({...exportOptions, format: e.target.value})}
            fullWidth
            margin="normal"
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
          </TextField>
          <div style={{ marginTop: 16 }}>
            <h4>Select Fields to Export</h4>
            {fieldOptions.map((field) => (
              <FormControlLabel
                key={field.id}
                control={
                  <Checkbox
                    checked={exportOptions.fields.includes(field.id)}
                    onChange={(e) => {
                      const newFields = e.target.checked
                        ? [...exportOptions.fields, field.id]
                        : exportOptions.fields.filter(f => f !== field.id);
                      setExportOptions({...exportOptions, fields: newFields});
                    }}
                  />
                }
                label={field.label}
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">Export</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Trainer</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={currentTrainer?.name || ''}
            onChange={e => setCurrentTrainer({ ...currentTrainer, name: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Enter full name (letters and spaces only, 2-50 characters)"
          />
          <TextField
            label="Email"
            type="email"
            value={currentTrainer?.email || ''}
            onChange={e => setCurrentTrainer({ ...currentTrainer, email: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Enter a valid email address"
          />
          <TextField
            label="Phone"
            value={currentTrainer?.phone || ''}
            onChange={e => setCurrentTrainer({ ...currentTrainer, phone: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Enter Ethiopian phone number (+251XXXXXXXXX, 09XXXXXXXXX, or 07XXXXXXXXX)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={formLoading}>Cancel</Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained" 
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={18} /> : null}
          >
            {formLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Trainer</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={newTrainer.name}
            onChange={e => setNewTrainer({ ...newTrainer, name: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Enter full name (letters and spaces only, 2-50 characters)"
          />
          <TextField
            label="Email"
            type="email"
            value={newTrainer.email}
            onChange={e => setNewTrainer({ ...newTrainer, email: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Enter a valid email address"
          />
          <TextField
            label="Phone"
            value={newTrainer.phone}
            onChange={e => setNewTrainer({ ...newTrainer, phone: e.target.value })}
            fullWidth
            margin="normal"
            required
            helperText="Enter Ethiopian phone number (+251XXXXXXXXX, 09XXXXXXXXX, or 07XXXXXXXXX)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} disabled={formLoading}>Cancel</Button>
          <Button 
            onClick={handleCreateSave} 
            variant="contained" 
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={18} /> : null}
          >
            {formLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        message={snackbar.message}
      />
      <Snackbar
        open={undoSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={pendingDelete ? `Trainer "${pendingDelete.name}" will be deleted. Undo?` : ''}
        action={
          <Button color="secondary" size="small" onClick={handleUndoDelete}>
            UNDO
          </Button>
        }
      />
      <Snackbar
        open={bulkUndoSnackbarOpen}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={`Delete ${pendingBulkDelete.length} selected trainer(s)? Undo?`}
        action={
          <Button color="secondary" size="small" onClick={handleUndoBulkDelete}>
            UNDO
          </Button>
        }
      />

      <TrainerClientsModal
        open={clientsModalOpen}
        onClose={handleCloseClientsModal}
        trainer={clientsModalTrainer}
        clients={clientsModalClients}
        loading={trainerClientsLoading}
      />
    </Paper>
  );
};

export default TrainersTab; 