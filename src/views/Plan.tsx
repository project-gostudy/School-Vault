import { useStore } from '../store';
import { MainWrapper } from '../components/layout/MainWrapper';
import { format } from 'date-fns';
import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import clsx from 'clsx';

export function Plan() {
  const { todaysPlan, generatePlan, isPlanning, reasoning } = useStore();
  const [showReasoning, setShowReasoning] = useState(false);

  const hasPlan = todaysPlan.length > 0;

  return (
    <MainWrapper>
       <header className="flex items-center justify-between mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div>
                <h1 className="text-6xl text-ink font-display font-bold tracking-tight">Schedule</h1>
                <p className="text-xl text-ink font-body italic mt-1 opacity-60 ml-1">AI-optimized for today</p>
            </div>
            {isPlanning && (
                <div className="flex items-center gap-3 text-accent animate-pulse">
                    <Sparkles className="w-6 h-6" />
                    <span className="text-sm font-bold uppercase tracking-widest">Optimizing</span>
                </div>
            )}
       </header>

       <section className="space-y-16 mt-8">
           {hasPlan ? (
               <>
                {/* Timeline */}
                <div className="relative border-l-4 border-grey-light ml-4 space-y-16 pl-12 py-4">
                        {todaysPlan.map((block: any, idx: number) => (
                            <div key={block.id} className="relative animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className={clsx(
                                    "absolute -left-[54px] top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm transition-all hover:scale-150",
                                    block.type === 'focus' ? "bg-accent" : block.type === 'break' ? "bg-ink opacity-40" : "bg-grey-medium"
                                )} />
                                
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-ink/80 tabular-nums tracking-tighter uppercase px-3 py-1 bg-grey-light rounded-lg">
                                            {format(new Date(block.startTime), 'h:mm a')}
                                        </span>
                                        <div className="h-[2px] flex-1 bg-grey-light" />
                                    </div>
                                    
                                    <div className="group bg-white p-6 rounded-[32px] border border-grey-medium shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="flex items-start justify-between">
                                            <h3 className={clsx("text-3xl font-display font-medium leading-tight", block.type === 'free' ? "text-subtle" : "text-ink")}>
                                                {block.activity}
                                            </h3>
                                            <span className={clsx(
                                                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-grey-light",
                                                block.type === 'focus' ? "text-accent" : "text-ink/40"
                                            )}>
                                                {block.type}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-6 text-subtle/50 font-body italic text-sm">
                                            <span>
                                                Starts {format(new Date(block.startTime), 'h:mm a')}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-grey-medium" />
                                            <span>
                                                Ends {format(new Date(block.endTime), 'h:mm a')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                {/* AI Reasoning Toggle */}
                <div className="pt-12">
                    <button 
                        onClick={() => setShowReasoning(!showReasoning)}
                        className="flex items-center gap-4 text-ink hover:text-accent transition-all group"
                    >
                        <div className="w-10 h-10 rounded-full bg-ink border border-ink flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-colors">
                            {showReasoning ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
                        </div>
                        <span className="text-base font-bold uppercase tracking-widest">
                            {showReasoning ? "Hide Logic" : "View Planning Logic"}
                        </span>
                    </button>

                    {showReasoning && (
                        <div className="mt-8 p-10 bg-grey-light/30 rounded-[40px] border border-grey-medium text-ink text-base leading-relaxed animate-in fade-in slide-in-from-top-6 duration-700">
                            <div className="flex items-start gap-6">
                                <Sparkles className="w-8 h-8 text-accent shrink-0 mt-1" />
                                <div className="space-y-4">
                                    <p className="font-display font-bold text-2xl">AI Strategy Brief</p>
                                    <p className="whitespace-pre-line text-ink/70 leading-relaxed font-body text-lg italic">
                                        {reasoning || "Compiling the optimal sequence for your workload..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-16">
                    <button 
                         onClick={() => generatePlan()}
                         disabled={isPlanning}
                         className="px-10 py-4 border-2 border-grey-medium text-ink/40 hover:text-ink hover:border-ink rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 disabled:opacity-30"
                    >
                        {isPlanning ? "Re-Optimizing..." : "Regenerate Full Schedule"}
                    </button>
                </div>
               </>
           ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center space-y-10 animate-in fade-in zoom-in-95 duration-1000">
                    <div className="w-32 h-32 rounded-[40px] bg-grey-light border-2 border-grey-medium flex items-center justify-center rotate-3">
                        <Calendar className="w-16 h-16 text-ink/10" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-4xl font-display font-bold text-ink">Schedule is Empty</h2>
                        <p className="text-xl text-subtle font-body italic max-w-sm mx-auto opacity-70">
                            Let the AI orchestrate your study blocks based on pending assignments.
                        </p>
                    </div>
                    <button 
                        onClick={() => generatePlan()}
                        disabled={isPlanning}
                        className="group relative bg-accent text-white px-12 py-6 rounded-3xl font-bold text-xl shadow-2xl shadow-accent/40 active:scale-95 overflow-hidden transition-all hover:scale-105"
                    >
                        {isPlanning ? (
                            <div className="relative z-10 flex items-center gap-4">
                                <span className="animate-spin w-6 h-6 border-4 border-white/20 border-t-white rounded-full" />
                                Processing...
                            </div>
                        ) : (
                            <div className="relative z-10 flex items-center gap-4">
                                <Sparkles className="w-7 h-7" />
                                Build My Schedule
                            </div>
                        )}
                        <div className="absolute inset-0 bg-ink translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
               </div>
           )}
       </section>
    </MainWrapper>
  );
}
