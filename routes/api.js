const express = require('express');
const router = express.Router();
const methods = require('../utils/methodsMiddleware');
const registerController = require('../controllers/registerController');
const commonstudentsController = require('../controllers/commonstudentsController');
const suspendController = require('../controllers/suspendController');
const retrievefornotificationsController = require('../controllers/retrievefornotificationsController');

router.all("/api/register", methods(['POST']), registerController);

// Part 2
router.all("/api/commonstudents", methods(['GET']), commonstudentsController);

// Part 3
router.all("/api/suspend", methods(['POST']), suspendController);

// Part 4
router.all("/api/retrievefornotifications", methods(['POST']), retrievefornotificationsController);

module.exports = router;