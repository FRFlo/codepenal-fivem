<script lang="ts">
import { onMount } from "svelte";
import CalculationResults from "$lib/components/CalculationResults.svelte";
import OffenseSelector from "$lib/components/OffenseSelector.svelte";
import TemplateManager from "$lib/components/TemplateManager.svelte";
import { calculateResults, loadOffenses } from "$lib/offenses";
import type { CalculationResult, Offense, SelectedOffense } from "$lib/types";

const ACTIVE_TAB_STORAGE_KEY = "lspd_active_tab";

let offenses = $state<Offense[]>([]);
let selectedOffenses = $state<SelectedOffense[]>([]);
let searchTerm = $state("");
let loading = $state(true);
let error = $state("");
let activeTab = $state<"calculator" | "templates">("calculator");

let calculationResult = $derived(
	selectedOffenses.length > 0 ? calculateResults(selectedOffenses) : null,
);

/**
 * Charge l'onglet actif depuis le localStorage
 */
function loadActiveTab(): "calculator" | "templates" {
	try {
		const stored = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
		return stored === "templates" ? "templates" : "calculator";
	} catch (error) {
		console.error("Erreur lors du chargement de l'onglet actif:", error);
		return "calculator";
	}
}

/**
 * Sauvegarde l'onglet actif dans le localStorage
 */
function saveActiveTab(tab: "calculator" | "templates"): void {
	try {
		localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
	} catch (error) {
		console.error("Erreur lors de la sauvegarde de l'onglet actif:", error);
	}
}

onMount(async () => {
	// Charger l'onglet actif depuis le localStorage
	activeTab = loadActiveTab();

	try {
		offenses = await loadOffenses();
	} catch (err) {
		error = "Erreur lors du chargement des infractions";
		console.error(err);
	} finally {
		loading = false;
	}
});

function clearAll() {
	selectedOffenses = [];
}

function handleTemplateLoad(offenses: SelectedOffense[]) {
	selectedOffenses = offenses;
	activeTab = "calculator"; // Retourner à l'onglet calculateur
	saveActiveTab(activeTab);
}

function setActiveTab(tab: "calculator" | "templates") {
	activeTab = tab;
	saveActiveTab(tab);
}
</script>

<svelte:head>
    <title>Code Pénal SASP - Calculateur d'infractions</title>
    <meta name="description" content="Calculateur d'infractions et de peines pour les joueurs SASP" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Code Pénal SASP</h1>
                    <p class="text-gray-600 dark:text-gray-400">Calculateur d'infractions et de peines</p>
                </div>
                {#if selectedOffenses.length > 0 && activeTab === 'calculator'}
                    <button
                        onclick={clearAll}
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                        Effacer tout
                    </button>
                {/if}
            </div>
        </div>
    </header>

    <!-- Navigation des onglets -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="flex space-x-8">
                <button
                    onclick={() => setActiveTab('calculator')}
                    class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'calculator' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}"
                >
                    Calculateur
                </button>
                <button
                    onclick={() => setActiveTab('templates')}
                    class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'templates' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}"
                >
                    Templates
                </button>
            </nav>
        </div>
    </div>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {#if loading}
            <div class="flex justify-center items-center py-12">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des infractions...</p>
                </div>
            </div>
        {:else if error}
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
                        <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            {#if activeTab === 'calculator'}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Sélecteur d'infractions -->
                    <div>
                        <OffenseSelector
                            {offenses}
                            bind:selectedOffenses
                            bind:searchTerm
                        />
                    </div>

                    <!-- Résultats -->
                    <div>
                        {#if calculationResult}
                            <CalculationResults result={calculationResult} />
                        {:else}
                            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                                <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune infraction sélectionnée</h3>
                                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Commencez par sélectionner des infractions pour voir les résultats.
                                </p>
                            </div>
                        {/if}
                    </div>
                </div>
            {:else if activeTab === 'templates'}
                <div class="max-w-4xl mx-auto">
                    <TemplateManager 
                        {selectedOffenses}
                        onLoadTemplate={handleTemplateLoad}
                    />
                </div>
            {/if}
        {/if}
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Calculateur d'infractions SASP - Basé sur le code pénal officiel</p>
                <p class="mt-1">Utilisez cet outil pour calculer rapidement les peines et procédures requises</p>
            </div>
        </div>
    </footer>
</div>
