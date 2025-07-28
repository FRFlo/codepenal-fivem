<script lang="ts">
    import type { CalculationResult } from '../types';
    import { formatCurrency, formatDuration } from '../offenses';

    let { result }: {
        result: CalculationResult;
    } = $props();
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

    <!-- Charges nécessitant un dossier d'arrestation -->
    {#if Object.keys(result.offensesByCategory).length > 0}
        {@const arrestationOffenses = Object.values(result.offensesByCategory).flat().filter(offense => 
            offense.legal_procedures.includes('Dossier d\'Arrestation')
        )}
        {#if arrestationOffenses.length > 0}
            <div class="bg-red-50 border border-red-200 rounded-lg shadow">
                <div class="px-4 py-3 border-b border-red-200">
                    <h3 class="text-lg font-medium text-red-900 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        Dossier d'Arrestation requis
                    </h3>
                </div>
                <div class="p-4">
                    <p class="text-red-800 mb-3 font-medium">
                        Les charges suivantes nécessitent la rédaction d'un Dossier d'Arrestation :
                    </p>
                    <ul class="space-y-2">
                        {#each arrestationOffenses as offense}
                            <li class="flex items-start">
                                <span class="text-red-600 mr-2">•</span>
                                <div class="flex-1">
                                    <span class="text-red-900 font-medium">{offense.offense}</span>
                                    {#if offense.quantity > 1}
                                        <span class="text-red-600 ml-1">(x{offense.quantity})</span>
                                    {/if}
                                    <div class="text-sm text-red-700 mt-1">
                                        {offense.category_name} • {formatCurrency(offense.fine * offense.quantity)} • {formatDuration(offense.duration_minutes * offense.quantity)}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}
    {/if}

    <!-- Charges nécessitant une comparution immédiate -->
    {#if Object.keys(result.offensesByCategory).length > 0}
        {@const comparutionOffenses = Object.values(result.offensesByCategory).flat().filter(offense => 
            offense.legal_procedures.includes('Comparution immédiate')
        )}
        {#if comparutionOffenses.length > 0}
            <div class="bg-orange-50 border border-orange-200 rounded-lg shadow">
                <div class="px-4 py-3 border-b border-orange-200">
                    <h3 class="text-lg font-medium text-orange-900 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                        </svg>
                        Comparution immédiate requise
                    </h3>
                </div>
                <div class="p-4">
                    <p class="text-orange-800 mb-3 font-medium">
                        Les charges suivantes nécessitent une Comparution immédiate :
                    </p>
                    <ul class="space-y-2">
                        {#each comparutionOffenses as offense}
                            <li class="flex items-start">
                                <span class="text-orange-600 mr-2">•</span>
                                <div class="flex-1">
                                    <span class="text-orange-900 font-medium">{offense.offense}</span>
                                    {#if offense.quantity > 1}
                                        <span class="text-orange-600 ml-1">(x{offense.quantity})</span>
                                    {/if}
                                    <div class="text-sm text-orange-700 mt-1">
                                        {offense.category_name} • {formatCurrency(offense.fine * offense.quantity)} • {formatDuration(offense.duration_minutes * offense.quantity)}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}
    {/if}

    <!-- Charges nécessitant un rapport d'arrestation -->
    {#if Object.keys(result.offensesByCategory).length > 0}
        {@const rapportOffenses = Object.values(result.offensesByCategory).flat().filter(offense => 
            offense.legal_procedures.includes('Rapport d\'arrestation')
        )}
        {#if rapportOffenses.length > 0}
            <div class="bg-blue-50 border border-blue-200 rounded-lg shadow">
                <div class="px-4 py-3 border-b border-blue-200">
                    <h3 class="text-lg font-medium text-blue-900 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                        </svg>
                        Rapport d'arrestation requis
                    </h3>
                </div>
                <div class="p-4">
                    <p class="text-blue-800 mb-3 font-medium">
                        Les charges suivantes nécessitent un Rapport d'arrestation :
                    </p>
                    <ul class="space-y-2">
                        {#each rapportOffenses as offense}
                            <li class="flex items-start">
                                <span class="text-blue-600 mr-2">•</span>
                                <div class="flex-1">
                                    <span class="text-blue-900 font-medium">{offense.offense}</span>
                                    {#if offense.quantity > 1}
                                        <span class="text-blue-600 ml-1">(x{offense.quantity})</span>
                                    {/if}
                                    <div class="text-sm text-blue-700 mt-1">
                                        {offense.category_name} • {formatCurrency(offense.fine * offense.quantity)} • {formatDuration(offense.duration_minutes * offense.quantity)}
                                    </div>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}
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