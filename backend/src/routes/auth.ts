// backend/src/routes/auth.ts
import express from 'express';
import { loginUser, registerUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser); // ✅ Needed for registering
router.post('/login', loginUser);       // ✅ Already present

export default router;
