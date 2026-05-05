// backend/src/routes/auth.ts
import express from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser); // ✅ Needed for registering
router.post('/login', loginUser);       // ✅ Already present
router.post('/logout', logoutUser);     // ✅ Session tracking

export default router;
