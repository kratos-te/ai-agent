import { Router } from 'express';
import Result from '../utils/result';
import { translateToEn } from '../services/openai';

const router: Router = Router();

router.post('/text-to-en', async (req: any, res) => {
    try {
        const text = req.body.text;
        const result = await translateToEn(text)
        res.json(Result.success(result))
      } catch (e: any) {
        res.json(Result.err(500, e.message || String(e)));
      }
});

export default router;