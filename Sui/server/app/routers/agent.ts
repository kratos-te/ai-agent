import { Router } from 'express';
import aes from '../encryption/aes';
import Result from '../utils/result';
import DbEvents from '../db/dbEvents';
import DbResults from '../db/dbResults';
import { getMultiGetObjects } from '../utils/sui-utils';

const router: Router = Router();

router.post('/get-encrypt', async (req: any, res) => {
    try {
        if (!req.body.url) {
            res.json(Result.fail("Invalid params."))
            return;
        }
        const encrypted = aes.encrypt(req.body.url)
        res.json(Result.success(encrypted))
    } catch (e: any) {
        res.json(Result.err(500, e.message || String(e)));
    }
});

router.post('/get-agents', async (req: any, res) => {
    try {
        if (!req.body.address) {
            res.json(Result.fail("Invalid params."))
            return;
        }
        const address = req.body.address;

        const agents = DbEvents.GetAIAgents(address);
        const ids: string[] = [];
        for (var i = 0; i < agents.length; i++) {
            ids.push(agents[i].id);
        }

        const results = await getMultiGetObjects(ids);

        const balanceMap = new Map();
        for (var i = 0; i < results.length; i++) {
            const result = results[i].data;
            if (result && result.content && 'fields' in result.content) {
                const objectId = result.objectId;
                const fields = result.content.fields as any;
                balanceMap.set(objectId, fields.balance || 0);
            }
        }

        for (var i = 0; i < agents.length; i++) {
            agents[i].url = aes.decrypt(agents[i].encrypt_url)
            agents[i].balance = balanceMap.get(agents[i].id) || 0;
        }

        res.json(Result.success(agents));
    } catch (e: any) {
        res.json(Result.err(500, e.message || String(e)));
    }
});

router.post('/get-all-agents', async (req: any, res) => {
    try {
        const agents = DbEvents.GetAIAgents("");
        res.json(Result.success(agents));
    } catch (e: any) {
        res.json(Result.err(500, e.message || String(e)));
    }
});

router.post('/get-call-result', async (req: any, res) => {
    try {
        let id = req.body.id;
        let nonce = req.body.nonce;
        let caller = req.body.caller;

        if (!id || !nonce || !caller) {
            res.json(Result.fail("Invalid params."))
            return;
        }

        let result = DbResults.GetResult(caller, id, nonce);
        res.json(Result.success(result));
    } catch (e: any) {
        res.json(Result.err(500, e.message || String(e)));
    }
});

router.post('/get-caller-results', async (req: any, res) => {
    try {
        let caller = req.body.caller;

        if (!caller) {
            res.json(Result.fail("Invalid params."))
            return;
        }

        let results = DbResults.GetCallerHistorys(caller);
        res.json(Result.success(results));
    } catch (e: any) {
        res.json(Result.err(500, e.message || String(e)));
    }
});

export default router;
