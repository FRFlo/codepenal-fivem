import type { SelectedOffense, Template } from "./types";

const STORAGE_KEY = "lspd_templates";

/**
 * Charge tous les templates depuis le localStorage
 */
export function loadTemplates(): Template[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error("Erreur lors du chargement des templates:", error);
		return [];
	}
}

/**
 * Sauvegarde tous les templates dans le localStorage
 */
export function saveTemplates(templates: Template[]): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
	} catch (error) {
		console.error("Erreur lors de la sauvegarde des templates:", error);
	}
}

/**
 * Crée un nouveau template
 */
export function createTemplate(
	name: string,
	description: string,
	offenses: SelectedOffense[],
): Template {
	const template: Template = {
		id: generateId(),
		name,
		description,
		offenses: [...offenses],
		createdAt: Date.now(),
	};

	const templates = loadTemplates();
	templates.push(template);
	saveTemplates(templates);

	return template;
}

/**
 * Met à jour un template existant
 */
export function updateTemplate(
	id: string,
	updates: Partial<Template>,
): Template | null {
	const templates = loadTemplates();
	const index = templates.findIndex((t) => t.id === id);

	if (index === -1) return null;

	templates[index] = { ...templates[index], ...updates };
	saveTemplates(templates);

	return templates[index];
}

/**
 * Supprime un template
 */
export function deleteTemplate(id: string): boolean {
	const templates = loadTemplates();
	const filtered = templates.filter((t) => t.id !== id);

	if (filtered.length === templates.length) return false;

	saveTemplates(filtered);
	return true;
}

/**
 * Marque un template comme utilisé
 */
export function markTemplateAsUsed(id: string): void {
	updateTemplate(id, { lastUsed: Date.now() });
}

/**
 * Génère un ID unique
 */
function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Formate la date pour l'affichage
 */
export function formatDate(timestamp: number): string {
	return new Date(timestamp).toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Exporte un template vers une URL partageable
 */
export function exportTemplateToUrl(template: Template): string {
	const shareData = {
		name: template.name,
		description: template.description,
		offenses: template.offenses,
	};

	const encoded = btoa(JSON.stringify(shareData));
	const url = new URL(window.location.href);
	url.searchParams.set("template", encoded);

	return url.toString();
}

/**
 * Importe un template depuis l'URL
 */
export function importTemplateFromUrl(): {
	name: string;
	description: string;
	offenses: SelectedOffense[];
} | null {
	const url = new URL(window.location.href);
	const templateParam = url.searchParams.get("template");

	if (!templateParam) return null;

	try {
		const decoded = atob(templateParam);
		const data = JSON.parse(decoded);

		// Validation des données
		if (!data.name || !data.offenses || !Array.isArray(data.offenses)) {
			throw new Error("Format de template invalide");
		}

		return {
			name: data.name,
			description: data.description || "",
			offenses: data.offenses,
		};
	} catch (error) {
		console.error("Erreur lors de l'import du template:", error);
		return null;
	}
}

/**
 * Nettoie l'URL en supprimant le paramètre template
 */
export function clearTemplateFromUrl(): void {
	const url = new URL(window.location.href);
	url.searchParams.delete("template");
	window.history.replaceState({}, "", url.toString());
}

/**
 * Vérifie si un template est disponible dans l'URL
 */
export function hasTemplateInUrl(): boolean {
	const url = new URL(window.location.href);
	return url.searchParams.has("template");
}
