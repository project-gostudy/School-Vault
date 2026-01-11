import { IngestionService, Assignment } from '../../types';
import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class AxiosIngestionService implements IngestionService {
    private customerId?: string;
    private username?: string;
    private password?: string;

    constructor() {
        this.customerId = process.env.AXIOS_CUSTOMER_ID;
        this.username = process.env.AXIOS_USERNAME;
        this.password = process.env.AXIOS_PASSWORD;
    }

    async fetchAssignments(): Promise<Assignment[]> {
        console.log('[Ingestion] Starting live sync cycle...');
        
        if (!this.username || !this.password) {
            console.warn('[Ingestion] No credentials found. Returning mock data.');
            return this.getMockAssignments();
        }

        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            console.log('[Ingestion] Logging into Axios...');
            const loginUrl = 'https://registrofamiglie.axioscloud.it/Pages/SD/SD_Login.aspx';
            await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
            
            // Fill login form
            await page.fill('#customerid', this.customerId || '');
            await page.fill('input[name="username"]', this.username || '');
            await page.fill('input[name="password"]', this.password || '');
            
            console.log('[Ingestion] Submitting login form...');
            await page.click('button[type="submit"]');

            // Wait for URL change or dashboard
            console.log('[Ingestion] Waiting for dashboard navigation...');
            let attempts = 0;
            while (attempts < 20) {
                const url = page.url();
                if (url.includes('SD_Dashboard.aspx')) break;
                if (url.includes('SD_Login.aspx')) {
                    const errorMsg = await page.textContent('.alert-danger:not(.display-hide)');
                    if (errorMsg && errorMsg.trim().length > 0) {
                        throw new Error(`Login failed: ${errorMsg.trim()}`);
                    }
                }
                await new Promise(r => setTimeout(r, 1000));
                attempts++;
            }
            
            console.log('[Ingestion] Current URL:', page.url());

            // Direct dashboard access if needed (sometimes required to clear modals)
            if (!page.url().includes('SD_Dashboard.aspx')) {
                console.log('[Ingestion] Navigating directly to Dashboard...');
                await page.goto('https://registrofamiglie.axioscloud.it/Pages/SD/SD_Dashboard.aspx', { waitUntil: 'domcontentloaded' });
            }

            // 1. Wait for dashboard content (tiles) to load
            console.log('[Ingestion] Waiting for dashboard tiles to appear...');
            try {
                // Wait for any tile or the specific Registro di Classe tile
                await page.waitForSelector('.family-tile, [data-action="FAMILY_REGISTRO_CLASSE"]', { timeout: 15000 });
                console.log('[Ingestion] Dashboard tiles loaded.');
            } catch (err) {
                console.warn('[Ingestion] Tiles did not appear within timeout. Current body text:', await page.evaluate(() => document.body.innerText.substring(0, 200)));
            }

            // 2. Navigate to "Registro di Classe"
            console.log('[Ingestion] Looking for "Registro di Classe" navigation...');
            
            let clicked = false;
            // The screenshot shows "Registro di Classe" is a tile. 
            // We'll try specific Metronic/Axios selectors or text.
            const rclaSelectors = [
                'li.family-tile[data-action="FAMILY_REGISTRO_CLASSE"]',
                '[data-action="FAMILY_REGISTRO_CLASSE"]',
                'text="Registro di Classe"',
                '.btn-box-axios:has-text("Registro di Classe")'
            ];

            for (const selector of rclaSelectors) {
                try {
                    const target = page.locator(selector).first();
                    if (await target.isVisible({ timeout: 3000 })) {
                        console.log(`[Ingestion] Found target with selector: ${selector}. Clicking...`);
                        await target.click();
                        clicked = true;
                        break;
                    }
                } catch (e: any) {
                    // Ignore and try next
                }
            }

            if (!clicked) {
                console.warn('[Ingestion] Specific selectors failed. Trying broad click on text...');
                await page.locator('text="Registro di Classe"').first().click({ timeout: 5000 }).catch((err: any) => {
                    console.error('[Ingestion] Broad text click failed:', err.message);
                });
            }

            // 3. Wait for the table to appear (ajax load)
            console.log('[Ingestion] Waiting for assignments table (#table-rcla)...');
            let foundFrame: any = null;
            for (let i = 0; i < 30; i++) {
                for (const frame of page.frames()) {
                    try {
                        const isVisible = await frame.locator('#table-rcla').isVisible();
                        if (isVisible) {
                            foundFrame = frame;
                            break;
                        }
                    } catch (e: any) {}
                }
                if (foundFrame) break;
                await page.waitForTimeout(1000);
            }

            if (!foundFrame) throw new Error('Timeout waiting for #table-rcla in all frames');
            
            console.log('[Ingestion] Table #table-rcla found in frame:', foundFrame.url());
            
            const rawAssignments = await foundFrame.evaluate(() => {
                const rows = Array.from(document.querySelectorAll('#table-rcla tbody tr'));
                const results: any[] = [];

                rows.forEach(row => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length < 3) return;

                    const dateRaw = cells[0].innerText.split('\n')[0].trim();
                    const compitiHtml = cells[2].innerHTML;

                    const parts = compitiHtml.split(/<br\s*\/?>/i);

                    parts.forEach(part => {
                        const cleanPart = part.replace(/&nbsp;/g, ' ').replace(/<[^>]*>?/gm, '').trim();
                        if (!cleanPart) return;

                        const boldMatch = part.match(/<b>(.*?):<\/b>(.*)/s);
                        if (boldMatch) {
                            results.push({
                                subject: boldMatch[1].trim(),
                                title: boldMatch[2].replace(/<[^>]*>?/gm, '').trim(),
                                dueDate: dateRaw
                            });
                        } else {
                            const fallbackMatch = cleanPart.match(/^(.*?):(.*)/s);
                            if (fallbackMatch) {
                                results.push({
                                    subject: fallbackMatch[1].trim(),
                                    title: fallbackMatch[2].trim(),
                                    dueDate: dateRaw
                                });
                            }
                        }
                    });
                });
                return results;
            });

            console.log(`[Ingestion] Scraped ${rawAssignments.length} assignments.`);

            return rawAssignments.map((a: any) => ({
                id: uuidv4(),
                externalId: `axios_${a.subject}_${a.dueDate}_${crypto.createHash('md5').update(a.title).digest('hex').substring(0, 8)}`,
                title: a.title,
                subject: a.subject,
                dueDate: this.parseItalianDate(a.dueDate),
                status: 'pending',
                description: ''
            }));
            
        } catch (e) {
            console.error('[Ingestion] Failed to fetch. Current URL:', page.url());
            throw e;
        } finally {
            await browser.close();
        }
    }

    private parseItalianDate(dateStr: string): string {
        // "12/01/2026" -> ISO "2026-01-12T00:00:00Z"
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}T08:00:00Z`;
    }

    private getMockAssignments(): Assignment[] {
        return [
            {
                id: uuidv4(),
                externalId: 'ext_math_001',
                title: 'Math Exercises Ch. 5',
                subject: 'Mathematics',
                dueDate: new Date(Date.now() + 86400000).toISOString(),
                status: 'pending',
                description: 'Complete exercises 1-10 on page 42'
            },
            {
                id: uuidv4(),
                externalId: 'ext_hist_002',
                title: 'History Essay: WW2',
                subject: 'History',
                dueDate: new Date(Date.now() + 172800000).toISOString(),
                status: 'pending',
                description: 'Write a 500 word essay on the causes of WW2'
            }
        ];
    }
}
