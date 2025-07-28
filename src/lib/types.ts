export interface Offense {
	category_id: number;
	category_name: string;
	offense: string;
	fine: number;
	duration_minutes: number;
	immediate_seizures_or_restrictions: string[];
	other_immediate_penalties: string[];
	legal_procedures: string[];
	additional_notes: string[];
}

export interface SelectedOffense extends Offense {
	quantity: number;
}

export interface CalculationResult {
	totalFine: number;
	totalDurationMinutes: number;
	allSeizures: string[];
	allPenalties: string[];
	allProcedures: string[];
	allNotes: string[];
	offensesByCategory: Record<string, SelectedOffense[]>;
}

export interface Template {
	id: string;
	name: string;
	description: string;
	offenses: SelectedOffense[];
	createdAt: number;
	lastUsed?: number;
}
