import { useState } from 'react';
import { Today } from './views/Today';
import { Plan } from './views/Plan';
import { LayoutGrid, Calendar } from 'lucide-react';
import clsx from 'clsx';

import logo from './assets/logo.png';

type ViewState = 'today' | 'plan';

function App() {
  const [view, setView] = useState<ViewState>('today');

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-accent/10">
      
      {/* Top Logo */}
      <div className="pt-12 flex justify-center animate-in fade-in duration-1000">
        <img src={logo} alt="Logo" className="w-12 h-12 transition-all duration-500 cursor-pointer hover:scale-110" />
      </div>

      {/* Content */}
      <div className="pb-32">
        {view === 'today' && <Today />}
        {view === 'plan' && <Plan />}
      </div>

      {/* Navigation Dock - Minimalist Redesign */}
      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border border-grey-medium rounded-3xl shadow-2xl shadow-ink/5 px-4 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10 duration-1000">
        <button 
            onClick={() => setView('today')}
            className={clsx(
                "group relative p-4 rounded-2xl transition-all duration-300",
                view === 'today' ? "bg-ink text-white" : "text-ink/30 hover:bg-grey-light hover:text-ink"
            )}
            aria-label="Today"
        >
            <LayoutGrid className="w-6 h-6 relative z-10" />
            {view === 'today' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
            )}
        </button>
        
        <button 
            onClick={() => setView('plan')}
            className={clsx(
                "group relative p-4 rounded-2xl transition-all duration-300",
                view === 'plan' ? "bg-ink text-white" : "text-ink/30 hover:bg-grey-light hover:text-ink"
            )}
            aria-label="Schedule"
        >
            <Calendar className="w-6 h-6 relative z-10" />
            {view === 'plan' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent rounded-full" />
            )}
        </button>
      </nav>

    </div>
  );
}

export default App;
