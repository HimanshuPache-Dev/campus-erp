const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin'), facultyController.getFaculty);
router.post('/', authorize('admin'), facultyController.createFaculty);
router.get('/:id', authorize('admin', 'faculty'), facultyController.getFacultyById);
router.get('/:id/courses', authorize('faculty'), facultyController.getFacultyCourses);
router.put('/:id', authorize('admin'), facultyController.updateFaculty);
router.delete('/:id', authorize('admin'), facultyController.deleteFaculty);

module.exports = router;