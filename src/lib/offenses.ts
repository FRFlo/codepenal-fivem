import type { Offense, SelectedOffense, CalculationResult } from './types';

/**
 * Charge les infractions depuis le fichier JSON
 */
export async function loadOffenses(): Promise<Offense[]> {
    const response = await fetch('/code.json');
    return response.json();
}

/**
 * Calcule les résultats basés sur les infractions sélectionnées
 */
export function calculateResults(selectedOffenses: SelectedOffense[]): CalculationResult {
    const result: CalculationResult = {
        totalFine: 0,
        totalDurationMinutes: 0,
        allSeizures: [],
        allPenalties: [],
        allProcedures: [],
        allNotes: [],
        offensesByCategory: {}
    };

    // Grouper par catégorie
    selectedOffenses.forEach(offense => {
        if (!result.offensesByCategory[offense.category_name]) {
            result.offensesByCategory[offense.category_name] = [];
        }
        result.offensesByCategory[offense.category_name].push(offense);
    });

    // Calculer les totaux
    selectedOffenses.forEach(offense => {
        result.totalFine += offense.fine * offense.quantity;
        result.totalDurationMinutes += offense.duration_minutes * offense.quantity;
        
        // Ajouter les saisies, peines, procédures et notes
        result.allSeizures.push(...offense.immediate_seizures_or_restrictions);
        result.allPenalties.push(...offense.other_immediate_penalties);
        result.allProcedures.push(...offense.legal_procedures);
        result.allNotes.push(...offense.additional_notes);
    });

    // Supprimer les doublons
    result.allSeizures = [...new Set(result.allSeizures)];
    result.allPenalties = [...new Set(result.allPenalties)];
    result.allProcedures = [...new Set(result.allProcedures)];
    result.allNotes = [...new Set(result.allNotes)];

    return result;
}

/**
 * Formate la durée en heures et minutes
 */
export function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
        return `${remainingMinutes} minutes`;
    } else if (remainingMinutes === 0) {
        return `${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
        return `${hours} heure${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
    }
}

/**
 * Formate le montant en dollars
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
} 