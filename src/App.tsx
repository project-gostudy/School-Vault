import { useState } from 'react';
import { Today } from './views/Today';
import { Plan } from './views/Plan';
import { LayoutGrid, Calendar, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';

type ViewState = 'today' | 'plan' | 'settings';

function App() {
  const [view, setView] = useState<ViewState>('today');

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-sage/30">
      
      {/* Content */}
      <div className="pb-20">
        {view === 'today' && <Today />}
        {view === 'plan' && <Plan />}
        {view === 'settings' && (
            <div className="flex h-[80vh] items-center justify-center text-subtle">
                <div className="text-center space-y-2">
                    <p className="font-display text-xl">System Status</p>
                    <div className="flex flex-col gap-1 text-sm">
                        <span className="text-sage">Axios Famiglia • Connected</span>
                        <span className="text-sage">Perplexity API • Active</span>
                        <span className="text-sage">Asana • Synced</span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Navigation Dock */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-ui-border rounded-full shadow-lg px-6 py-3 flex items-center gap-8 z-50">
        <button 
            onClick={() => setView('today')}
            className={clsx("transition-colors duration-300", view === 'today' ? "text-ink" : "text-subtle/50 hover:text-subtle")}
            aria-label="Today"
        >
            <LayoutGrid className="w-6 h-6" />
        </button>
        
        <button 
            onClick={() => setView('plan')}
            className={clsx("transition-colors duration-300", view === 'plan' ? "text-ink" : "text-subtle/50 hover:text-subtle")}
            aria-label="Plan"
        >
            <Calendar className="w-6 h-6" />
        </button>

        <div className="w-px h-6 bg-ui-border" />

        <button 
            onClick={() => setView('settings')}
            className={clsx("transition-colors duration-300", view === 'settings' ? "text-ink" : "text-subtle/50 hover:text-subtle")}
            aria-label="Settings"
        >
            <SettingsIcon className="w-5 h-5" />
        </button>
      </nav>

    </div>
  );
}

export default App;
