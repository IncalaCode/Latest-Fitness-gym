import React, { useState, useRef } from 'react';
import PackageForm from '../forms/PackageForm';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Checkbox,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Chip,
  Snackbar
} from '@mui/material';
import usePackages from '../../hooks/usePackages';
import usePackageSubmit from '../../hooks/usePackageSubmit';
import usePackageDelete from '../../hooks/usePackageDelete';
import CircularProgress from '@mui/material/CircularProgress';

const PackagesTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    packages,
    exportPackages,
    loading,
    error,
    refresh
  } = usePackages();

  const [selected, setSelected] = useState([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    fields: ['name', 'price', 'duration', 'accessLevel'],
    all: false
  });

  const { handlePackageSubmit, loading: submitLoading } = usePackageSubmit();

  const [localPackages, setLocalPackages] = useState([]);

  // Local state for search and sort
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Keep localPackages in sync with packages
  React.useEffect(() => {
    setLocalPackages(packages);
  }, [packages]);

  // Filter and sort localPackages in memory
  const filteredPackages = localPackages
    .filter(pkg =>
      pkg.name.toLowerCase().includes(search.toLowerCase()) ||
      (pkg.description && pkg.description.toLowerCase().includes(search.toLowerCase()))
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

  const fieldOptions = [
    { id: 'name', label: 'Name' },
    { id: 'price', label: 'Price' },
    { id: 'duration', label: 'Duration' },
    { id: 'accessLevel', label: 'Access Level' },
    { id: 'numberOfPasses', label: 'Passes' },
    { id: 'requiresTrainer', label: 'Requires Trainer' },
    { id: 'isRenewable', label: 'Renewable' },
    { id: 'benefits', label: 'Benefits' }
  ];

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.length === packages.length) {
      setSelected([]);
    } else {
      setSelected(packages.map(pkg => pkg.id));
    }
  };

  const handleSort = (property) => {
    if (sortBy === property) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(property);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    exportPackages(
      filteredPackages,
      exportOptions.fields,
      exportOptions.format
    );
    setExportDialogOpen(false);
  };

  const handleCreatePackage = () => {
    setCurrentPackage(null);
    setShowPackageForm(true);
  };

  const handleEditPackage = (pkg) => {
    setCurrentPackage(pkg);
    setShowPackageForm(true);
  };

  const handlePackageFormSubmit = async (formData, packageData) => {
    const result = await handlePackageSubmit(formData, packageData, () => {
      refresh();
      setShowPackageForm(false);
      setCurrentPackage(null);
    });
    return result;
  };

  const handleCancelPackageForm = () => {
    setShowPackageForm(false);
    setCurrentPackage(null);
  };

  // Use the new delete hook
  const deleteHook = usePackageDelete({
    onDeleted: (deletedIds) => {
      setLocalPackages(prev => prev.filter(pkg => !deletedIds.includes(pkg.id)));
      setSelected(prev => prev.filter(id => !deletedIds.includes(id)));
    }
  });

  // Mobile card component for packages
  const PackageCard = ({ pkg }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3">
            {pkg.name}
          </Typography>
          <Checkbox
            checked={selected.indexOf(pkg.id) !== -1}
            onChange={() => handleSelect(pkg.id)}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Price: <strong>${pkg.price}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Duration: <strong>{pkg.duration} days</strong>
          </Typography>
          <Chip
            label={pkg.accessLevel}
            size="small"
            color="primary"
            sx={{ mb: 1 }}
          />
          {pkg.benefits && Array.isArray(pkg.benefits) && pkg.benefits.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Benefits:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {pkg.benefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={() => handleEditPackage(pkg)}
          fullWidth
        >
          Edit Package
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => deleteHook.handleDeleteClick(pkg)}
          fullWidth
          sx={{ mt: 1 }}
          disabled={deleteHook.deleting}
        >
          {deleteHook.deleting && deleteHook.pendingDelete && deleteHook.pendingDelete.id === pkg.id ? (
            <CircularProgress size={18} color="inherit" />
          ) : 'Delete'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {showPackageForm ? (
        <PackageForm
          packageData={currentPackage}
          onSubmit={handlePackageFormSubmit}
          onCancel={handleCancelPackageForm}
          loading={submitLoading}
        />
      ) : (
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
              label="Search Packages"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: isMobile ? 1 : 0, minWidth: isMobile ? '100%' : '300px' }}
            />
            <Box sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 1,
              width: isMobile ? '100%' : 'auto'
            }}>
              <Button
                variant="contained"
                onClick={handleCreatePackage}
                fullWidth={isMobile}
              >
                Create Package
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
                variant="contained"
                color="error"
                onClick={() => deleteHook.handleBulkDeleteClick(selected)}
                disabled={deleteHook.bulkDeleting}
              >
                {deleteHook.bulkDeleting ? <CircularProgress size={18} color="inherit" /> : `Delete Selected (${selected.length})`}
              </Button>
        )}
      </Box>

      {isMobile ? (
        // Mobile Card View
        <Box>
              {filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
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
                    indeterminate={selected.length > 0 && selected.length < packages.length}
                    checked={packages.length > 0 && selected.length === packages.length}
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
                <TableCell align="right">
                  <TableSortLabel
                        active={sortBy === 'price'}
                        direction={sortBy === 'price' ? sortOrder : 'asc'}
                    onClick={() => handleSort('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                        active={sortBy === 'accessLevel'}
                        direction={sortBy === 'accessLevel' ? sortOrder : 'asc'}
                    onClick={() => handleSort('accessLevel')}
                  >
                    Access Level
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                        active={sortBy === 'duration'}
                        direction={sortBy === 'duration' ? sortOrder : 'asc'}
                    onClick={() => handleSort('duration')}
                  >
                    Duration (days)
                  </TableSortLabel>
                </TableCell>
                    <TableCell>Benefits</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                  {filteredPackages.map((pkg) => (
                <TableRow key={pkg.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.indexOf(pkg.id) !== -1}
                      onChange={() => handleSelect(pkg.id)}
                    />
                  </TableCell>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell align="right">${pkg.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={pkg.accessLevel}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="right">{pkg.duration}</TableCell>
                      <TableCell>
                        {pkg.benefits && Array.isArray(pkg.benefits) && pkg.benefits.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {pkg.benefits.map((benefit, index) => (
                              <Chip
                                key={index}
                                label={benefit}
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditPackage(pkg)}
                    >
                      Edit
                    </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => deleteHook.handleDeleteClick(pkg)}
                          sx={{ ml: 1 }}
                          disabled={deleteHook.deleting}
                        >
                          {deleteHook.deleting && deleteHook.pendingDelete && deleteHook.pendingDelete.id === pkg.id ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : 'Delete'}
                        </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Packages</DialogTitle>
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

          <Snackbar
            open={deleteHook.snackbarOpen}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            message={deleteHook.pendingDelete ? `Package "${deleteHook.pendingDelete.name}" will be deleted. Undo?` : ''}
            action={
              <Button color="secondary" size="small" onClick={deleteHook.handleUndoDelete}>
                UNDO
              </Button>
            }
          />
          <Snackbar
            open={deleteHook.bulkDeleteSnackbarOpen}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            message={`Delete ${selected.length} selected package(s)? Undo?`}
            action={
              <Button color="secondary" size="small" onClick={deleteHook.handleUndoBulkDelete}>
                UNDO
              </Button>
            }
          />
        </Paper>
      )}
    </Box>
  );
};

export default PackagesTab;