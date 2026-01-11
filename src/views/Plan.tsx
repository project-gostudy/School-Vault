import { useStore } from '../store';
import { MainWrapper } from '../components/layout/MainWrapper';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export function Plan() {
  const { todaysPlan, generatePlan, isPlanning } = useStore();
  const [showReasoning, setShowReasoning] = useState(false);

  useEffect(() => {
      if (todaysPlan.length === 0 && !isPlanning) {
          generatePlan();
      }
  }, [generatePlan, todaysPlan, isPlanning]);

  return (
    <MainWrapper>
       <header className="flex items-center justify-between">
            <div>
                <h1 className="text-4xl text-ink">Plan</h1>
                <p className="text-lg text-subtle mt-1">AI-optimized schedule</p>
            </div>
            {isPlanning && (
                <div className="flex items-center gap-2 text-sage animate-pulse">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium">Optimizing...</span>
                </div>
            )}
       </header>

       <section className="space-y-8">
           {/* Timeline */}
           <div className="relative border-l border-ui-border ml-3 space-y-8 pl-8 py-2">
                {todaysPlan.map((block, idx) => (
                    <div key={block.id} className="relative animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className={clsx(
                            "absolute -left-[39px] top-0 w-5 h-5 rounded-full border-4 border-paper",
                            block.type === 'focus' ? "bg-ink" : block.type === 'break' ? "bg-sage" : "bg-clay"
                        )} />
                        
                        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-2">
                            <span className="text-sm font-medium text-subtle w-16 tabular-nums">
                                {format(new Date(block.startTime), 'h:mm a')}
                            </span>
                            <h3 className={clsx("text-xl font-display", block.type === 'free' ? "text-sage" : "text-ink")}>
                                {block.description}
                            </h3>
                        </div>
                        
                        {block.taskId && (
                            <p className="text-subtle text-sm max-w-md">
                                Working on <span className="text-ink font-medium">{block.taskId}</span>
                            </p>
                        )}
                        
                        <div className="text-sm text-subtle/50 mt-1">
                            {format(new Date(block.endTime), 'h:mm a')}
                        </div>
                    </div>
                ))}
           </div>

           {/* AI Reasoning Toggle */}
           <div className="border-t border-ui-border pt-8">
               <button 
                onClick={() => setShowReasoning(!showReasoning)}
                className="flex items-center gap-2 text-subtle hover:text-ink transition-colors text-sm font-medium"
               >
                   {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                   {showReasoning ? "Hide Reasoning" : "Why this schedule?"}
               </button>

               {showReasoning && (
                   <div className="mt-4 p-4 bg-paper rounded-xl border border-ui-border text-subtle text-sm leading-relaxed animate-in fade-in slide-in-from-top-2">
                       <p className="mb-2"><strong className="text-ink">Perplexity Reasoning:</strong></p>
                       <ul className="list-disc list-inside space-y-1">
                           <li>Calculus is scheduled first during peak cognitive hours (4:00 PM).</li>
                           <li>A 15-minute recharge break is inserted before Literature to prevent fatigue.</li>
                           <li>Evening is completely protected for personal projects starting at 5:30 PM.</li>
                       </ul>
                   </div>
               )}
           </div>
       </section>
    </MainWrapper>
  );
}
