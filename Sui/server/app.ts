import cors from 'cors';
import express from 'express';
import serveStatic from 'serve-static';
import DbCursor from './app/db/dbCursor';
import DbEvents from './app/db/dbEvents';
import DbResults from './app/db/dbResults';

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(
    "/",
    serveStatic('../dist', {
        index: ['index.html', '/']
    })
)

app.get('/', async (req, res) => {
	return res.send({ message: '🚀 API is functional 🚀' });
});

import AIRouters from './app/routers/ai';
import AgentRouters from './app/routers/agent';

app.use('/v1/ai', AIRouters);
app.use('/v1/ai', AgentRouters);

import { setupListeners } from './app/indexer/event-indexer';

DbResults.init();
DbCursor.init();
DbEvents.init();

setupListeners();

app.listen(3000, () => console.log(`Server ready at: http://localhost:3000`));

process.on('uncaughtException', err => {
    console.error('uncaughtException', err)
})