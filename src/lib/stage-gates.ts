import { Idea } from '@/types';

export interface GateConfig {
  required: string[];
}

export interface GateMap {
  [transitionKey: string]: GateConfig;
}

export const DEFAULT_STAGE_GATES: GateMap = {
  signal_to_refining: { required: [] },
  refining_to_validating: { required: ["opportunityMemo"] },
  validating_to_decision_gate: { required: ["ventureScore>=55", "experimentComplete>=1"] },
  decision_gate_to_active_sprint: { required: ["boardDecision:go|conditional"] },
  active_sprint_to_graduated: { required: ["sprintEndDate"] }
};

interface GateResult {
  allowed: boolean;
  reason?: string;
}

export function checkStageGate(idea: any, oldStage: string, newStage: string, gateConfigStr: string | null | undefined): GateResult {
  // Try parsing config fall back to default
  let config: GateMap = DEFAULT_STAGE_GATES;
  if (gateConfigStr) {
    try {
      config = JSON.parse(gateConfigStr);
    } catch(e) {
      console.warn("Invalid gate config string, using defaults");
    }
  }

  const transitionKey = `${oldStage}_to_${newStage}`;
  const rules = config[transitionKey];

  // If there are no specific rules for this transition, allow it
  if (!rules || !rules.required || rules.required.length === 0) {
    return { allowed: true };
  }

  // Evaluate each rule
  for (const rule of rules.required) {
    // Check if it's a ">=" numeric comparison
    if (rule.includes(">=")) {
      const [field, minStr] = rule.split(">=");
      const min = parseInt(minStr, 10);
      
      let actualField = field;
      if (field === "experimentComplete") actualField = "experiments";
      
      const val = idea[actualField];
      
      const num = Math.floor(
        typeof val === 'number' ? val : 
        (Array.isArray(val) ? val.length : 
          (val && typeof val === 'object' ? Object.keys(val).length : 0))
      );

      if (num < min) {
        return { allowed: false, reason: `${field} must be >= ${min} (current: ${num})` };
      }
      continue;
    }

    // Check if it's an enum or matching string config "key:value1|value2"
    if (rule.includes(":")) {
      const [field, allowedValuesStr] = rule.split(":");
      const allowedValues = allowedValuesStr.split("|");
      const current = idea[field];
      if (!current || !allowedValues.includes(String(current).toLowerCase())) {
        return { allowed: false, reason: `${field} must be one of [${allowedValues.join(',')}] (current: ${current || 'none'})` };
      }
      continue;
    }

    // Default existence check (e.g. "opportunityMemo")
    const val = idea[rule];
    
    // For json blocks like opportunityMemo, check if it's not strictly null/empty
    if (val === undefined || val === null || val === 'null' || val === '' || (typeof val === 'object' && Object.keys(val).length === 0)) {
       return { allowed: false, reason: `${rule} must be completed before advancing to ${newStage}` };
    }
  }

  return { allowed: true };
}
