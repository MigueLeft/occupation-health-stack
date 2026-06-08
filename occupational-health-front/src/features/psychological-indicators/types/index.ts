export interface PsychologicalIndicatorValue {
  id: string;
  name: string;
  sortOrder: number;
}

export interface PsychologicalIndicator {
  id: string;
  name: string;
  sortOrder: number;
  values: PsychologicalIndicatorValue[];
}

export interface PsychologicalIndicatorResult {
  indicatorId: string;
  valueId: string;
}
