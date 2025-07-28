<script lang="ts">
    import type { Offense, SelectedOffense } from '../types';
    import { formatCurrency } from '../offenses';

    let { offenses, selectedOffenses = $bindable(), searchTerm = $bindable() }: {
        offenses: Offense[];
        selectedOffenses: SelectedOffense[];
        searchTerm: string;
    } = $props();

    let selectedCategory = $state('');

    let filteredOffenses = $derived(
        offenses.filter((offense: Offense) => {
            const matchesSearch = offense.offense.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !selectedCategory || offense.category_name === selectedCategory;
            return matchesSearch && matchesCategory;
        })
    );

    let categories = $derived([...new Set(offenses.map((o: Offense) => o.category_name))]);

    function addOffense(offense: Offense) {
        const existing = selectedOffenses.find((o: SelectedOffense) => o.offense === offense.offense);
        if (existing) {
            existing.quantity += 1;
            selectedOffenses = [...selectedOffenses];
        } else {
            selectedOffenses = [...selectedOffenses, { ...offense, quantity: 1 }];
        }
    }

    function removeOffense(offense: SelectedOffense) {
        selectedOffenses = selectedOffenses.filter((o: SelectedOffense) => o.offense !== offense.offense);
    }

    function updateQuantity(offense: SelectedOffense, newQuantity: number) {
        if (newQuantity <= 0) {
            removeOffense(offense);
        } else {
            offense.quantity = newQuantity;
            selectedOffenses = [...selectedOffenses];
        }
    }
</script>

<div class="space-y-6">
    <!-- Filtres -->
    <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rechercher une infraction
            </label>
            <input
                id="search"
                type="text"
                bind:value={searchTerm}
                placeholder="Ex: excès de vitesse, possession..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
        </div>
        <div class="sm:w-48">
            <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catégorie
            </label>
            <select
                id="category"
                bind:value={selectedCategory}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
                <option value="">Toutes les catégories</option>
                {#each categories as category}
                    <option value={category}>{category}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Liste des infractions disponibles -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Infractions disponibles ({filteredOffenses.length})
            </h3>
        </div>
        <div class="max-h-96 overflow-y-auto">
            {#each filteredOffenses as offense}
                <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center">
                    <div class="flex-1">
                        <div class="font-medium text-gray-900 dark:text-white">{offense.offense}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            {offense.category_name} • {formatCurrency(offense.fine)} • {offense.duration_minutes} min
                        </div>
                    </div>
                    <button
                        onclick={() => addOffense(offense)}
                        class="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        Ajouter
                    </button>
                </div>
            {/each}
        </div>
    </div>

    <!-- Infractions sélectionnées -->
    {#if selectedOffenses.length > 0}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                    Infractions sélectionnées ({selectedOffenses.length})
                </h3>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
                {#each selectedOffenses as offense}
                    <div class="px-4 py-3 flex justify-between items-center">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900 dark:text-white">{offense.offense}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                {offense.category_name} • {formatCurrency(offense.fine)} • {offense.duration_minutes} min
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button
                                onclick={() => updateQuantity(offense, offense.quantity - 1)}
                                class="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                -
                            </button>
                            <span class="w-8 text-center font-medium text-gray-900 dark:text-white">{offense.quantity}</span>
                            <button
                                onclick={() => updateQuantity(offense, offense.quantity + 1)}
                                class="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                +
                            </button>
                            <button
                                onclick={() => removeOffense(offense)}
                                class="ml-2 px-2 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div> 