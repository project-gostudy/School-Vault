import { format } from 'date-fns';
import { useStore } from '../store';
import { MainWrapper } from '../components/layout/MainWrapper';
import { Clock, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export function Today() {
  const { todaysPlan, refreshData, tasks, markTaskComplete } = useStore();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Find the first unfinished focus block
  const currentFocus = todaysPlan.find((p: any) => p.type === 'focus' && tasks.find((t: any) => t.id === p.id && !t.isCompleted));

  return (
    <MainWrapper>
      <header className="flex flex-col gap-1 mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-6xl font-display font-bold tracking-tight text-ink">Today's Tasks</h1>
        <p className="text-2xl text-ink font-body italic opacity-80">{format(new Date(), 'EEEE, MMMM do')}</p>
      </header>

      {/* Primary Focus State */}
      {currentFocus ? (
        <section className="flex flex-col items-center justify-center space-y-12 py-10 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-accent/10 flex items-center justify-center animate-pulse">
                     <Clock className="w-10 h-10 text-accent" />
                </div>
            </div>

            <div className="text-center space-y-4 max-w-lg">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-subtle">Active Session</h2>
                <h3 className="text-4xl font-display text-ink leading-tight">{currentFocus.activity}</h3>
                <p className="text-subtle font-body italic">Scheduled until {format(new Date(currentFocus.endTime), 'h:mm a')}</p>
            </div>
            
            <button 
                onClick={() => markTaskComplete(currentFocus.id)}
                className="group relative px-12 py-5 bg-ink text-white rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-ink/20 active:scale-95 overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-accent" />
                    Complete Current Task
                </span>
                <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center ">
                <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="text-center space-y-2 max-w-sm mx-auto">
                <p className="font-body text-xl text-ink leading-relaxed">
                    You've cleared all scheduled tasks for this block.<br />
                    Take a moment to recharge.
                </p>
            </div>

            {/* Completed Tasks section shown in screenshot */}
            <div className="mt-16 w-full max-w-sm bg-grey-light/30 border border-grey-medium p-8 rounded-[32px] space-y-6">
                <h2 className="text-center text-sm font-bold text-ink tracking-wide">Completed Tasks:</h2>
                <div className="space-y-3">
                    {tasks.filter((t: any) => t.isCompleted).map((task: any) => (
                        <div key={task.id} className="p-4 bg-grey-light border border-grey-medium rounded-xl text-center">
                            <span className="text-ink font-body text-base">{task.title}</span>
                        </div>
                    ))}
                    {tasks.filter((t: any) => t.isCompleted).length === 0 && (
                        <div className="p-4 bg-grey-light/50 border border-grey-medium/50 rounded-xl text-center italic opacity-40">
                             <span className="text-ink font-body text-sm">No tasks finished yet</span>
                        </div>
                    )}
                </div>
            </div>
        </section>
      )}

    </MainWrapper>
  );
}
