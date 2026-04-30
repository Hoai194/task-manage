import { Router } from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import auth from '../middleware/auth.js';

const projectRouter = Router();

projectRouter.use(auth);

projectRouter.get('/', getProjects);         
projectRouter.post('/', createProject);        
projectRouter.put('/:id', updateProject);      
projectRouter.delete('/:id', deleteProject);   

export default projectRouter;