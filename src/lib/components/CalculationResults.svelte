<script lang="ts">
    import type { CalculationResult } from '../types';
    import { formatCurrency, formatDuration } from '../offenses';

    export let result: CalculationResult;
</script>

<div class="space-y-6">
    <!-- Résumé principal -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">Résumé de la peine</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
                <div class="text-3xl font-bold">{formatCurrency(result.totalFine)}</div>
                <div class="text-blue-100">Amende totale</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold">{formatDuration(result.totalDurationMinutes)}</div>
                <div class="text-blue-100">Temps de détention</div>
            </div>
            <div class="text-center">
                <div class="text-3xl font-bold">{result.allProcedures.length}</div>
                <div class="text-blue-100">Procédures requises</div>
            </div>
        </div>
    </div>

    <!-- Détails par catégorie -->
    {#if Object.keys(result.offensesByCategory).length > 0}
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Détails par catégorie</h3>
            </div>
            <div class="divide-y divide-gray-200">
                {#each Object.entries(result.offensesByCategory) as [category, offenses]}
                    <div class="p-4">
                        <h4 class="font-medium text-gray-900 mb-2">{category}</h4>
                        <div class="space-y-2">
                            {#each offenses as offense}
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-gray-600">
                                        {offense.offense} {offense.quantity > 1 ? `(x${offense.quantity})` : ''}
                                    </span>
                                    <span class="font-medium">
                                        {formatCurrency(offense.fine * offense.quantity)} • {formatDuration(offense.duration_minutes * offense.quantity)}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Saisies et restrictions immédiates -->
    {#if result.allSeizures.length > 0}
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Saisies et restrictions immédiates</h3>
            </div>
            <div class="p-4">
                <ul class="space-y-2">
                    {#each result.allSeizures as seizure}
                        <li class="flex items-start">
                            <span class="text-red-500 mr-2">•</span>
                            <span class="text-gray-700">{seizure}</span>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}

    <!-- Autres peines immédiates -->
    {#if result.allPenalties.length > 0}
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Autres peines immédiates</h3>
            </div>
            <div class="p-4">
                <ul class="space-y-2">
                    {#each result.allPenalties as penalty}
                        <li class="flex items-start">
                            <span class="text-orange-500 mr-2">•</span>
                            <span class="text-gray-700">{penalty}</span>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}

    <!-- Procédures légales -->
    {#if result.allProcedures.length > 0}
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Procédures légales requises</h3>
            </div>
            <div class="p-4">
                <ul class="space-y-2">
                    {#each result.allProcedures as procedure}
                        <li class="flex items-start">
                            <span class="text-blue-500 mr-2">•</span>
                            <span class="text-gray-700">{procedure}</span>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}

    <!-- Notes additionnelles -->
    {#if result.allNotes.length > 0}
        <div class="bg-white rounded-lg shadow">
            <div class="px-4 py-3 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Notes additionnelles</h3>
            </div>
            <div class="p-4">
                <ul class="space-y-2">
                    {#each result.allNotes as note}
                        <li class="flex items-start">
                            <span class="text-yellow-500 mr-2">•</span>
                            <span class="text-gray-700">{note}</span>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}
</div> 