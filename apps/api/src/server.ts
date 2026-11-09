import express from 'express';
import cors from 'cors';
import router from './routes/routes';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { listUndrawableCategories } from './services/roundService';

const app = express()

app.use(cors())
app.use(express.json());
app.use(router);
app.use(errorHandler);

const server = app.listen(env.PORT, () => { console.log(`Server Running on port ${env.PORT}`) })

// Não derruba o boot: o sorteio já pula essas categorias, mas o catálogo fica menor que o esperado
const warnAboutUndrawableCategories = async () => {
    const categories = await listUndrawableCategories();
    if (categories.length === 0) return;

    const names = categories.map((category) => category.name).join(', ');
    console.warn(`Categorias fora do sorteio por falta de dados no banco (rode db:seed): ${names}`);
};

warnAboutUndrawableCategories().catch((error) => {
    console.error('Não foi possível conferir as categorias do catálogo no banco.', error);
});

// Encerramento gracioso: fecha o servidor HTTP e a conexão do Prisma
const shutdown = async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
