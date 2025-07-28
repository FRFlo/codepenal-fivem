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
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
                Rechercher une infraction
            </label>
            <input
                id="search"
                type="text"
                bind:value={searchTerm}
                placeholder="Ex: excès de vitesse, possession..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div class="sm:w-48">
            <label for="category" class="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
            </label>
            <select
                id="category"
                bind:value={selectedCategory}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Toutes les catégories</option>
                {#each categories as category}
                    <option value={category}>{category}</option>
                {/each}
            </select>
        </div>
    </div>

    <!-- Liste des infractions disponibles -->
    <div class="bg-white rounded-lg shadow">
        <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">
                Infractions disponibles ({filteredOffenses.length})
            </h3>
        </div>
        <div class="max-h-96 overflow-y-auto">
            {#each filteredOffenses as offense}
                <div class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center">
                    <div class="flex-1">
                        <div class="font-medium text-gray-900">{offense.offense}</div>
                        <div class="text-sm text-gray-500">
                            {offense.category_name} • {formatCurrency(offense.fine)} • {offense.duration_minutes} min
                        </div>
                    </div>
                    <button
                        onclick={() => addOffense(offense)}
                        class="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Ajouter
                    </button>
                </div>
            {/each}
        </div>
    </div>

    <!-- Infractions sélectionnées -->
    {#if selectedOffenses.length > 0}
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">
                    Infractions sélectionnées ({selectedOffenses.length})
                </h3>
            </div>
            <div class="divide-y divide-gray-200">
                {#each selectedOffenses as offense}
                    <div class="px-4 py-3 flex justify-between items-center">
                        <div class="flex-1">
                            <div class="font-medium text-gray-900">{offense.offense}</div>
                            <div class="text-sm text-gray-500">
                                {offense.category_name} • {formatCurrency(offense.fine)} • {offense.duration_minutes} min
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button
                                onclick={() => updateQuantity(offense, offense.quantity - 1)}
                                class="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                -
                            </button>
                            <span class="w-8 text-center font-medium">{offense.quantity}</span>
                            <button
                                onclick={() => updateQuantity(offense, offense.quantity + 1)}
                                class="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                +
                            </button>
                            <button
                                onclick={() => removeOffense(offense)}
                                class="ml-2 px-2 py-1 text-red-600 hover:text-red-800"
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