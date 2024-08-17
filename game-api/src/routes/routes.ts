import { Router } from "express";
import axios from 'axios';
import { env } from "../env";

const router = Router();
const baseApi = env.GAME_API_BASE_URL;

router.get('/game/search/:search', async (req, res) => {
    try {
        const search = req.params.search;
        const response = await axios.get(`${baseApi}search/?api_key=${env.API_KEY}&format=json&query="${search}"&resources=game&field_list=name`)
        res.json(response.data);
    } catch (error) {
        res.status(500).send(`Erro: ${error}`)
    }
});

router.all('*', (req, res) => {
    return res.status(404).json('Rota inexistente!');
});

export default router;