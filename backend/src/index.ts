import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import cron from 'node-cron';
import { AxiosIngestionService } from './services/ingestion';
import { AiPlannerService } from './services/ai';
import { AsanaSyncService } from './services/sync';

// --- Configuration ---
const PORT = 3000;
const CRON_SCHEDULE = '*/15 * * * *'; // Every 15 minutes

// --- Services ---
const ingestion = new AxiosIngestionService();
const planner = new AiPlannerService(process.env.PERPLEXITY_API_KEY || 'mock');
const sync = new AsanaSyncService();

// --- Server ---
const server = Fastify({ logger: true });

server.register(cors, { 
  origin: '*', // For development
});

// --- API Endpoints ---

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

server.get('/assignments', async () => {
    // In a real app, this would query the DB
    const assignments = await ingestion.fetchAssignments();
    return assignments;
});

// --- Orchestration Logic ---

async function runOrchestration() {
    console.log('[Orchestrator] Starting cycle...');
    try {
        // 1. Ingest
        const assignments = await ingestion.fetchAssignments();
        
        // 2. Mock Change Detection (Always true for prototype)
        const hasChanges = true; 
        
        if (hasChanges) {
            console.log('[Orchestrator] Changes detected. Planning...');
            
            // 3. Plan
            const plan = await planner.generatePlan(assignments, {});
            
            // 4. Sync
            await sync.syncPlan(plan);
            
            console.log('[Orchestrator] Cycle completed successfully.');
        } else {
            console.log('[Orchestrator] No changes. Skipping.');
        }

    } catch (error) {
        console.error('[Orchestrator] Cycle failed', error);
    }
}

// --- Bootstrap ---

const start = async () => {
  try {
    // Schedule Cron
    cron.schedule(CRON_SCHEDULE, runOrchestration);
    console.log(`[Cron] Scheduled orchestration for ${CRON_SCHEDULE}`);

    // Start Server
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Server] Running on http://localhost:${PORT}`);
    
    // Run once on startup for demo purposes
    runOrchestration();

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
