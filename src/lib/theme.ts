import { writable } from "svelte/store";
import { browser } from "$app/environment";

/**
 * Store pour gérer le thème de l'application
 */
function createThemeStore() {
	const { subscribe, set } = writable<boolean>(false);

	/**
	 * Applique le thème sombre basé sur les préférences système
	 */
	function applySystemTheme(): void {
		if (!browser) return;

		const html = document.documentElement;
		const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

		if (isDark) {
			html.classList.add("dark");
		} else {
			html.classList.remove("dark");
		}

		set(isDark);
	}

	/**
	 * Initialise le thème au chargement de la page
	 */
	function init(): void {
		if (!browser) return;

		// Appliquer le thème initial
		applySystemTheme();

		// Écouter les changements de préférences système
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", applySystemTheme);
	}

	return {
		subscribe,
		init,
	};
}

export const theme = createThemeStore();
