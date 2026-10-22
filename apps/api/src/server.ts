import express from 'express';
import cors from 'cors';
import router from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = express()

app.use(cors())
app.use(express.json());
app.use(router);
app.use(errorHandler);

const server = app.listen(env.PORT, () => { console.log(`Server Running on port ${env.PORT}`) })

// Encerramento gracioso: fecha o servidor HTTP e a conexão do Prisma
const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
