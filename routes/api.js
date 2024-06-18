import express from 'express';
var router = express.Router();

import usersRouter from './controllers/users.js';
import friendsRouter from './controllers/friends.js';
import restaurantRouter from './controllers/restaurant.js';
import lobbiesRouter from './controllers/lobbies.js';
import userInfoRouter from './controllers/userInfo.js';

router.use('/users', usersRouter);
router.use('/friends', friendsRouter);
router.use('/explore', restaurantRouter);
router.use('/lobbies', lobbiesRouter);
router.use('/userInfo', userInfoRouter);

export default router;