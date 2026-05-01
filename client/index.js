import express from 'express'
import cors  from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';
import taskRouter from './routes/taskRoute.js';
import tagRouter from './routes/tagRoute.js';
import projectRouter from './routes/projectRoute.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
dotenv.config();
app.use(express.json());

connectDB();

app.use('/api/user', userRouter);
app.use('/api/task', taskRouter);
app.use('/api/tag', tagRouter);
app.use('/api/project', projectRouter);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=>{
    console.log(`SERVER RUN on port ${PORT}!!!`);
})
