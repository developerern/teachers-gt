const express = require('express');
const router = express.Router();
const methods = require('../utils/methodsMiddleware');
const registerController = require('../controllers/registerController');
const commonstudentsController = require('../controllers/commonstudentsController');
const suspendController = require('../controllers/suspendController');
const retrievefornotificationsController = require('../controllers/retrievefornotificationsController');

router.all("/api/register", methods(['POST']), registerController);

router.all("/api/commonstudents", methods(['GET']), commonstudentsController);

router.all("/api/suspend", methods(['POST']), suspendController);

router.all("/api/retrievefornotifications", methods(['POST']), retrievefornotificationsController);

module.exports = router;