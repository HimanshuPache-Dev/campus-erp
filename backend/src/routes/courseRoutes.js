const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', courseController.getCourses);
router.post('/', authorize('admin'), courseController.createCourse);
router.get('/:id', courseController.getCourseById);
router.put('/:id', authorize('admin'), courseController.updateCourse);
router.delete('/:id', authorize('admin'), courseController.deleteCourse);
router.post('/:id/assign-faculty', authorize('admin'), courseController.assignFaculty);
router.get('/:id/faculty', courseController.getCourseFaculty);

module.exports = router;