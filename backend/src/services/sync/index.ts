import { SyncService, DailyPlan } from '../../types';

export class AsanaSyncService implements SyncService {
    private personalAccessToken?: string;
    private workspaceId?: string;

    constructor() {
        this.personalAccessToken = process.env.ASANA_PAT;
        this.workspaceId = process.env.ASANA_WORKSPACE_ID;
    }

    async syncPlan(plan: DailyPlan): Promise<void> {
        console.log('[Sync] Syncing plan to Asana...', plan.date);

        if (!this.personalAccessToken) {
            console.warn('[Sync] No Asana PAT found. Skipping sync.');
            return;
        }

        // 1. Fetch existing tasks for the day to enable idempotency
        // 2. Diff changes
        // 3. Create/Update tasks

        for (const block of plan.blocks) {
            if (block.type === 'focus') {
                await this.createOrUpdateTask(block);
            }
        }
    }

    private async createOrUpdateTask(block: any) {
        console.log(`[Sync] upserting task: ${block.activity} (${block.startTime})`);
        // Actual HTTP calls to Asana API would go here using native fetch
    }
}
