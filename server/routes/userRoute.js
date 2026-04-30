import { Router } from 'express'
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  removeAccount 
} from '../controllers/userController.js'
import auth from '../middleware/auth.js'

const userRouter = Router();

userRouter.post('/register', register);
userRouter.post('/login', login);

userRouter.use(auth);

userRouter.get('/me', getProfile);
userRouter.put('/me', updateProfile);
userRouter.delete('/me', removeAccount); 

export default userRouter;
