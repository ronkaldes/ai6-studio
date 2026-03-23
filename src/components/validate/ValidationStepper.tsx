'use client';

import { useState } from 'react';
import { Idea } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { ProblemRefinement } from './ProblemRefinement';
import { OpportunityMemoView } from './OpportunityMemo';
import { AgentPanel } from './AgentPanel';
import { AssumptionMap } from './AssumptionMap';
import { ExperimentCards } from './ExperimentCards';
import { BoardSubmission } from './BoardSubmission';

const STEPS = [
  'Problem Refinement',
  'Opportunity Memo',
  'DVF Scoring',
  'Assumption Map',
  'Experiment Design',
  'Board Submission'
];

export function ValidationStepper({ initialIdea }: { initialIdea: Idea }) {
  const [idea, setIdea] = useState<Idea>(initialIdea);
  
  // Compute starting step
  let initialStep = 1;
  if (idea.stage === 'decision_gate' || idea.stage === 'active_sprint') initialStep = 7;
  else if (idea.experiments && (idea.experiments as any[]).length > 0) initialStep = 6;
  else if (idea.assumptionMap) initialStep = 5;
  else if (idea.dvfScores) initialStep = 4;
  else if (idea.opportunityMemo) initialStep = 3;

  const [currentStep, setCurrentStep] = useState(Math.min(initialStep, 6));
  const [validatedProblem, setValidatedProblem] = useState('');

  const handleStepComplete = (updatedIdea: Idea, stepData?: any) => {
    setIdea(updatedIdea);
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl mx-auto relative px-4">
        <div className="absolute left-0 top-[15px] w-full h-[2px] bg-border z-0" />
        {STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3 bg-background px-3">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                  isCompleted ? "bg-primary text-primary-foreground ring-4 ring-background" :
                  isCurrent ? "bg-background border-2 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] ring-4 ring-background" :
                  "bg-muted text-muted-foreground border-2 border-border box-border ring-4 ring-background"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span className={cn(
                "text-[10px] uppercase font-mono tracking-widest absolute top-10 w-28 text-center",
                isCurrent ? "text-primary font-bold" : "text-muted-foreground opacity-60"
              )}>
                {step.split(' ').map(w => <span key={w} className="block">{w}</span>)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="md:hidden flex items-center justify-between bg-surface p-4 rounded-xl border border-border mt-2">
        <span className="text-sm font-bold text-foreground">Step {currentStep} of 6</span>
        <span className="text-xs text-primary font-mono uppercase tracking-widest">{STEPS[currentStep - 1]}</span>
      </div>

      <div className="w-full mt-2 lg:mt-6 pb-12">
        {currentStep === 1 && (
          <ProblemRefinement idea={idea} onComplete={(p) => {
            setValidatedProblem(p);
            setCurrentStep(2);
          }} />
        )}
        {currentStep === 2 && (
          <OpportunityMemoView idea={idea} validatedProblem={validatedProblem} onComplete={handleStepComplete} />
        )}
        {currentStep === 3 && (
          <AgentPanel idea={idea} onComplete={handleStepComplete} />
        )}
        {currentStep === 4 && (
          <AssumptionMap idea={idea} onComplete={handleStepComplete} />
        )}
        {currentStep === 5 && (
          <ExperimentCards idea={idea} onComplete={handleStepComplete} />
        )}
        {currentStep === 6 && (
          <BoardSubmission idea={idea} onComplete={() => window.location.href = '/board'} />
        )}
      </div>
    </div>
  );
}
