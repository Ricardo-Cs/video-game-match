import express from 'express';
import cors from 'cors';
import router from './routes/routes';
import { env } from './env';

const app = express()

app.use(cors())
app.use(express.json());
app.use(router);

app.listen(env.PORT, () => { console.log('Server Running on port 3333') })