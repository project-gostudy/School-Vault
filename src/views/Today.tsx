import { format } from 'date-fns';
import { useStore } from '../store';
import { MainWrapper } from '../components/layout/MainWrapper';
import { Card } from '../components/ui/Card';
import { Clock, Coffee, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

export function Today() {
  const { todaysPlan, refreshData, tasks, markTaskComplete } = useStore();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Find the first unfinished focus block
  const currentFocus = todaysPlan.find(p => p.type === 'focus' && tasks.find(t => t.id === p.taskId && !t.isCompleted));
  /* const nextBreak = todaysPlan.find(p => p.type === 'break'); */
  const freeTimeBlock = todaysPlan.find(p => p.type === 'free');

  return (
    <MainWrapper>
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl text-ink">Today</h1>
        <p className="text-lg text-subtle font-body">{format(new Date(), 'EEEE, MMMM do')}</p>
      </header>

      {/* Primary Focus State */}
      {currentFocus ? (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-subtle">Current Focus</h2>
                <div className="flex items-center gap-2 text-sage text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Until {format(new Date(currentFocus.endTime), 'h:mm a')}</span>
                </div>
            </div>
            
            <Card className="flex flex-col gap-6 relative overflow-hidden group">
                <div className="space-y-2">
                    <h3 className="text-3xl font-display text-ink">{currentFocus.description}</h3>
                    {currentFocus.taskId && (
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper border border-ui-border text-subtle text-sm">
                            <span>{tasks.find(t => t.id === currentFocus.taskId)?.title}</span>
                         </div>
                    )}
                </div>

                <div className="pt-4 border-t border-ui-border flex justify-end">
                    <button 
                        onClick={() => currentFocus.taskId && markTaskComplete(currentFocus.taskId)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-white font-medium hover:bg-slate-700 transition-colors active:scale-95"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span>Complete Task</span>
                    </button>
                </div>
            </Card>
        </section>
      ) : (
        <section>
            <Card className="bg-sage/10 border-sage/20">
                <div className="flex items-center gap-4">
                    <CheckCircle className="w-8 h-8 text-sage" />
                    <div>
                        <h3 className="text-xl text-ink">All tasks completed</h3>
                        <p className="text-subtle">Enjoy your free time.</p>
                    </div>
                </div>
            </Card>
        </section>
      )}

      {/* Secondary Info (Free Time) */}
      {freeTimeBlock && (
          <section className="animate-in slide-in-from-bottom-8 duration-700 delay-100">
             <div className="flex items-center gap-3 text-subtle">
                <Coffee className="w-5 h-5 opacity-70" />
                <span className="text-lg">Free time starts at <span className="text-ink font-medium">{format(new Date(freeTimeBlock.startTime), 'h:mm a')}</span></span>
             </div>
          </section>
      )}

    </MainWrapper>
  );
}
