import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,

} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const PackageForm = ({
  packageData = null,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 30,
    accessLevel: 'full',
    startTime: '',
    endTime: '',
    numberOfPasses: '',
    requiresTrainer: false,
    isRenewable: true,
    isActive: true,
    benefits: []
  });

  // Update form data when packageData changes
  useEffect(() => {
    if (packageData) {
      const benefits = Array.isArray(packageData.benefits) ? packageData.benefits : [];
      setFormData({
        name: packageData.name || '',
        description: packageData.description || '',
        price: packageData.price || '',
        duration: packageData.duration || 30,
        accessLevel: packageData.accessLevel || 'full',
        startTime: packageData.startTime || '',
        endTime: packageData.endTime || '',
        numberOfPasses: packageData.numberOfPasses || '',
        requiresTrainer: packageData.requiresTrainer || false,
        isRenewable: packageData.isRenewable !== undefined ? packageData.isRenewable : true,
        isActive: packageData.isActive !== undefined ? packageData.isActive : true,
        benefits: benefits
      });
    } else {
      // Reset form for new package
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: 30,
        accessLevel: 'full',
        startTime: '',
        endTime: '',
        numberOfPasses: '',
        requiresTrainer: false,
        isRenewable: true,
        isActive: true,
        benefits: []
      });
    }
  }, [packageData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBenefitsChange = (newBenefits) => {
    setFormData(prev => ({
      ...prev,
      benefits: newBenefits
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Validate required fields
    if (!formData.name.trim()) throw new Error('Package name is required');
    if (!formData.price || parseFloat(formData.price) <= 0) throw new Error('Valid price is required');
    if (!formData.duration || parseInt(formData.duration) <= 0) throw new Error('Valid duration is required');

    // 🚫 Disallow unlimited passes
    if (!formData.numberOfPasses || parseInt(formData.numberOfPasses) <= 0) {
      throw new Error('Number of passes is required');
    }

    // ⛔ Enforce: passes < duration
    const passes = parseInt(formData.numberOfPasses);
    const duration = parseInt(formData.duration);
    if (passes > duration ) {
      throw new Error('Number of passes must be less than the duration');
    }

    // Special access time check
    if (formData.accessLevel === 'special' && (!formData.startTime || !formData.endTime)) {
      throw new Error('Start and end time are required for special access packages');
    }
    
    const result = await onSubmit(formData, packageData);

    if (result && result.success) {
      // handled by useEffect
    } else if (result && result.message) {
      throw new Error(result.message); // backend message
    } else {
      throw new Error('Something went wrong while creating the package');
    }
  } catch (error) {
    enqueueSnackbar(error.message, { variant: 'error' });
  }
};


  return (
    <Paper sx={{ p: 3, width: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {packageData ? 'Edit Package' : 'Create New Package'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {packageData ? 'Update package information below' : 'Fill out the form below to create a new package'}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              name="name"
              label="Package Name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              name="price"
              label="Price ($)"
              type="number"
              value={formData.price}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />

            <TextField
              name="duration"
              label="Duration (days)"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              inputProps={{ min: 1 }}
            />

            <TextField
              name="accessLevel"
              label="Access Level"
              select
              value={formData.accessLevel}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            >
              <MenuItem value="full">Full Access (24/7)</MenuItem>
            {/* <MenuItem value="off-peak">Off-Peak Hours</MenuItem>
            <MenuItem value="class-only">Class Only</MenuItem> */}
              <MenuItem value="special">Special Time Slot</MenuItem>
            </TextField>

          {formData.accessLevel === 'special' && (
            <>
                <TextField
                  name="startTime"
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  name="endTime"
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  required
                />
            </>
          )}

            <TextField
              name="numberOfPasses"
              label="Number of Passes"
              type="number"
              value={formData.numberOfPasses}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              inputProps={{ min: 1 }}
            />

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Benefits (type and press Enter to add)
            </Typography>
            <TextField
              label="Add Benefit"
              variant="outlined"
              fullWidth
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (value && !formData.benefits.includes(value)) {
                    handleBenefitsChange([...formData.benefits, value]);
                    e.target.value = '';
                  }
                }
              }}
              sx={{ mb: 2 }}
            />
            {formData.benefits.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.benefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    onDelete={() => {
                      const newBenefits = formData.benefits.filter((_, i) => i !== index);
                      handleBenefitsChange(newBenefits);
                    }}
                    deleteIcon={<CloseIcon />}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Package Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="requiresTrainer"
                    checked={formData.requiresTrainer}
                    onChange={handleChange}
                  />
                }
                label="Requires Trainer"
              />

              <FormControlLabel
                control={
                  <Switch
                    name="isRenewable"
                    checked={formData.isRenewable}
                    onChange={handleChange}
                  />
                }
                label="Renewable Package"
              />

              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              justifyContent: 'flex-end'
            }}>
              <Button
                onClick={onCancel}
                variant="outlined"
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Saving...' : (packageData ? 'Update Package' : 'Create Package')}
              </Button>
            </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default PackageForm;