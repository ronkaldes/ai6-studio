import { OpportunityCard as OppCardType } from "@/types";

export function OpportunityCard({ card }: { card: OppCardType }) {
  if (!card) return null;

  return (
    <div className="flex flex-col gap-4 mt-4 text-sm text-foreground">
      {card.kill_risks && card.kill_risks.length > 0 && (
        <div className="flex flex-col gap-2 rounded-r-md bg-destructive/5 border-l-2 border-destructive p-3">
          <div className="font-bold text-destructive flex items-center gap-2 uppercase tracking-wide text-xs">
            ⚠ Kill Conditions
          </div>
          <ul className="list-disc list-outside ml-4 space-y-1 text-muted-foreground mr-2">
            {card.kill_risks.map((risk, idx) => (
              <li key={idx} className="text-foreground">{risk}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 bg-muted/40 p-4 rounded-md border border-border mt-2">
        <div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest block mb-1">The Problem</span>
          <p className="leading-relaxed">{card.problem}</p>
        </div>
        <div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest block mb-1">Why Now</span>
          <p className="leading-relaxed">{card.why_now}</p>
        </div>
        <div>
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest block mb-1">Studio Angle</span>
          <p className="leading-relaxed text-primary/90">{card.studio_angle}</p>
        </div>
        <div className="pt-2 border-t border-border/50">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest block mb-1">Sprint Hypothesis</span>
          <p className="leading-relaxed font-medium">{card.sprint_hypothesis}</p>
        </div>
      </div>
    </div>
  );
}
