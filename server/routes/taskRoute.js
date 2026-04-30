import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,

  createSubTask,
  toggleSubTask,
  updateSubTask,
  deleteSubTask,
  getTasksByDateRange
} from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const taskRouter = Router();

taskRouter.use(auth); 

taskRouter.get('/', getTasks);           
taskRouter.post('/', createTask);        
taskRouter.put('/:id', updateTask);      
taskRouter.delete('/:id', deleteTask);   


// Sub tasks
taskRouter.post('/:id/subtasks', createSubTask);        
taskRouter.patch('/:id/subtasks/:subId/toggle', toggleSubTask); 
taskRouter.put('/:id/subtasks/:subId', updateSubTask); 
taskRouter.delete('/:id/subtasks/:subId', deleteSubTask);  

taskRouter.get('/calendar', getTasksByDateRange)

export default taskRouter;
