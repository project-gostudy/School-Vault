import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { AxiosIngestionService } from './services/ingestion';
import { AiPlannerService } from './services/ai';
import { v4 as uuidv4 } from 'uuid';

// --- Configuration ---
const PORT = 3000;

// --- Services ---
const ingestion = new AxiosIngestionService();
const planner = new AiPlannerService(process.env.PERPLEXITY_API_KEY || 'mock');

// --- In-memory Store (Mocking DB Persistence for now, keeping it simple) ---
let currentAssignments: any[] = [];
let currentPlan: any = null;

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
    return currentAssignments;
});

server.get('/plan/today', async () => {
    return currentPlan;
});

server.post('/plan/generate', async () => {
    console.log('[Orchestrator] Manual generation triggered...');
    try {
        // 1. Ingest
        const assignments = await ingestion.fetchAssignments();
        currentAssignments = assignments;
        
        // 2. Plan (Always generate if triggered)
        console.log('[Orchestrator] Generating fresh AI plan...');
        const plan = await planner.generatePlan(assignments, {});
        currentPlan = plan;
        
        console.log('[Orchestrator] Generation completed successfully.');
        return { success: true, assignmentsCount: assignments.length, planDate: plan.date };
    } catch (error: any) {
        console.error('[Orchestrator] Generation failed', error);
        return { success: false, error: error.message };
    }
});

server.patch('/assignments/:id', async (request: any, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    
    currentAssignments = currentAssignments.map(a => 
        a.id === id ? { ...a, status } : a
    );
    
    return { success: true };
});

// --- Bootstrap ---

const start = async () => {
  try {
    // Start Server
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`[Server] Running on http://localhost:${PORT}`);
    
    // Initial fetch to have data ready
    ingestion.fetchAssignments().then(data => {
        currentAssignments = data;
        console.log('[Server] Initial assignments loaded.');
    }).catch(err => console.error('[Server] Initial fetch failed', err));

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
