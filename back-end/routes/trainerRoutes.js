const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), trainerController.createTrainer);
router.get('/with-members', trainerController.getAllTrainers);
router.get('/search', trainerController.searchTrainers);
router.get('/:id', trainerController.getTrainerById);
router.put('/:id', authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), trainerController.updateTrainer);
router.delete('/:id', authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), trainerController.deleteTrainer);

// Member assignment routes
router.post('/assign-member', authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), trainerController.assignMemberToTrainer);
router.delete('/remove-member/:memberId', authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), trainerController.removeMemberFromTrainer);
router.get('/:id/clients', trainerController.getTrainerClients);

module.exports = router; 