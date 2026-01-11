import { PlannerService, DailyPlan, Assignment, DailyPlanSchema } from '../../types';
import { z } from 'zod';

export class AiPlannerService implements PlannerService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generatePlan(assignments: Assignment[], constraints: any): Promise<DailyPlan> {
    console.log('[AiPlanner] Generating plan for', assignments.length, 'assignments');

    // MOCK: If no API key, return a mock plan to avoid crashing
    if (!this.apiKey || this.apiKey === 'mock') {
        return this.generateMockPlan(assignments);
    }

    const prompt = this.constructPrompt(assignments, constraints);
    
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    { 
                        role: 'system', 
                        content: `You are a professional Academic Secretary and Task Scheduling Engine. 
Your goal is to organize school homework into a logical daily schedule.

CRITICAL RULES:
- DO NOT use your search capabilities. Use ONLY the data provided in the user prompt.
- DO NOT introduce yourself or talk about your capabilities.
- YOU MUST output ONLY raw JSON. No markdown backticks, no comments, no conversational text.
- The JSON must be a single object matching the schema exactly.` 
                    },
                    { 
                        role: 'user', 
                        content: `Schedule these assignments:
${prompt}

Output format:
{
  "date": "YYYY-MM-DD",
  "reasoning": "...",
  "blocks": [
    {
      "startTime": "ISO8601",
      "endTime": "ISO8601",
      "activity": "...",
      "type": "focus",
      "relatedAssignmentId": "..."
    }
  ]
}` 
                    }
                ]
            })
        });

        const data = await response.json();
        console.log('[AiPlanner] API Data:', JSON.stringify(data));

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${data.error?.message || response.statusText}`);
        }

        const rawJson = data.choices?.[0]?.message?.content;
        
        console.log('[AiPlanner] Raw response content:', rawJson);

        if (!rawJson) throw new Error('Empty AI response content');

        // Parse and Validate - More robust extraction
        const jsonMatch = rawJson.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('[AiPlanner] No JSON found in:', rawJson);
            throw new Error('AI response did not contain valid JSON object');
        }
        return DailyPlanSchema.parse(JSON.parse(jsonMatch[0]));

    } catch (error) {
        console.error('[AiPlanner] Planning failed', error);
        throw new Error('AI Planning failed');
    }
  }

  private constructPrompt(assignments: Assignment[], constraints: any): string {
    return JSON.stringify({
        task: "Schedule these assignments",
        input: assignments,
        constraints: constraints,
        schema: "DailyPlanSchema" // In reality, we'd inject the full schema structure here
    });
  }

  private generateMockPlan(assignments: Assignment[]): DailyPlan {
      const now = new Date();
      return {
          date: now.toISOString().split('T')[0],
          reasoning: "Mock plan generated because API key is missing.",
          blocks: assignments.map((a, i) => ({
              startTime: new Date(now.getTime() + i * 3600000).toISOString(),
              endTime: new Date(now.getTime() + (i + 1) * 3600000).toISOString(),
              activity: a.title,
              type: 'focus',
              relatedAssignmentId: a.id
          }))
      };
  }
}
