const { Package } = require('../models');
const { Op } = require('sequelize');

exports.createPackage = async (req, res) => {
  try {
    const packageData = req.body;

    // Validate required fields
    if (!packageData.name || !packageData.price || !packageData.duration) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and duration are required fields'
      });
    }

    // Validate price and duration are positive numbers
    if (parseFloat(packageData.price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    if (parseInt(packageData.duration) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number'
      });
    }

    // Validate special access time slots
    if (packageData.accessLevel === 'special') {
      if (!packageData.startTime || !packageData.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Start time and end time are required for special access packages'
        });
      }

      // Validate time format and range
      if (packageData.startTime >= packageData.endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    // Validate benefits field
    if (packageData.benefits && !Array.isArray(packageData.benefits)) {
      return res.status(400).json({
        success: false,
        message: 'Benefits must be an array'
      });
    }

    // Clean up data - remove time fields if not special access
    const cleanedData = { ...packageData };
    if (packageData.accessLevel !== 'special') {
      delete cleanedData.startTime;
      delete cleanedData.endTime;
    }

    // Ensure benefits is an array
    if (!cleanedData.benefits) {
      cleanedData.benefits = [];
    }

    const newPackage = await Package.create(cleanedData);

    // Ensure benefits is properly formatted
    const createdPackageData = newPackage.toJSON();
    if (!createdPackageData.benefits || !Array.isArray(createdPackageData.benefits)) {
      createdPackageData.benefits = [];
    }

    res.status(201).json({
      success: true,
      data: createdPackageData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating package',
      error: error.message
    });
  }
};

exports.getAllPackages = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const where = {};
    
    if (activeOnly === 'true') {
      where.isActive = true;
    }

    const packages = await Package.findAll({ 
      where,
      order: [['price', 'ASC']],
      attributes: {
        include: [
          'startTime',
          'endTime'
        ]
      }
    });

    // Ensure benefits is always an array
    const packagesWithBenefits = packages.map(pkg => {
      const packageData = pkg.toJSON();
      if (!packageData.benefits || !Array.isArray(packageData.benefits)) {
        packageData.benefits =  JSON.parse(packageData.benefits) ||[];
      }
      return packageData;
    });

    res.status(200).json({
      success: true,
      count: packagesWithBenefits.length,
      data: packagesWithBenefits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching packages',
      error: error.message
    });
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);
    
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Ensure benefits is always an array
    const packageData = package.toJSON();
    if (!packageData.benefits || !Array.isArray(packageData.benefits)) {
      packageData.benefits = [];
    }

    res.status(200).json({
      success: true,
      data: packageData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching package',
      error: error.message
    });
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);

    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const updateData = req.body;

    // Validate price and duration if provided
    if (updateData.price !== undefined && parseFloat(updateData.price) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
      });
    }

    if (updateData.duration !== undefined && parseInt(updateData.duration) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be a positive number'
      });
    }

    // Validate special access time slots
    if (updateData.accessLevel === 'special') {
      if (!updateData.startTime || !updateData.endTime) {
        return res.status(400).json({
          success: false,
          message: 'Start time and end time are required for special access packages'
        });
      }

      // Validate time format and range
      if (updateData.startTime >= updateData.endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    // Validate benefits field
    if (updateData.benefits && !Array.isArray(updateData.benefits)) {
      return res.status(400).json({
        success: false,
        message: 'Benefits must be an array'
      });
    }

    // Clean up data - remove time fields if not special access
    const cleanedData = { ...updateData };
    if (updateData.accessLevel && updateData.accessLevel !== 'special') {
      cleanedData.startTime = null;
      cleanedData.endTime = null;
    }

    // Ensure benefits is an array
    if (!cleanedData.benefits) {
      cleanedData.benefits = [];
    }

    await package.update(cleanedData);

    // Fetch the updated package to ensure benefits are properly formatted
    const updatedPackage = await Package.findByPk(req.params.id);
    const updatedPackageData = updatedPackage.toJSON();
    if (!updatedPackageData.benefits || !Array.isArray(updatedPackageData.benefits)) {
      updatedPackageData.benefits = [];
    }

    res.status(200).json({
      success: true,
      data: updatedPackageData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating package',
      error: error.message
    });
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);
    
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await package.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting package',
      error: error.message
    });
  }
};