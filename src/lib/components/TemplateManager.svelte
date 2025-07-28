<script lang="ts">
    import { onMount } from 'svelte';
    import type { Template, SelectedOffense } from '../types';
    import { loadTemplates, createTemplate, deleteTemplate, markTemplateAsUsed, formatDate, exportTemplateToUrl, importTemplateFromUrl, clearTemplateFromUrl, hasTemplateInUrl } from '../templates';
    import { formatCurrency } from '../offenses';

    let { selectedOffenses, onLoadTemplate } = $props<{
        selectedOffenses: SelectedOffense[];
        onLoadTemplate: (offenses: SelectedOffense[]) => void;
    }>();

    let templates = $state<Template[]>([]);
    let showSaveDialog = $state(false);
    let templateName = $state('');
    let templateDescription = $state('');
    let showDeleteConfirm = $state(false);
    let templateToDelete = $state<Template | null>(null);
    let showShareDialog = $state(false);
    let templateToShare = $state<Template | null>(null);
    let shareUrl = $state('');
    let showImportDialog = $state(false);
    let importData = $state<{ name: string; description: string; offenses: SelectedOffense[] } | null>(null);
    let showCopyNotification = $state(false);

    // Charger les templates au montage
    let templatesLoaded = $derived(() => {
        templates = loadTemplates();
    });

    onMount(() => {
        // Charger les templates initialement
        templates = loadTemplates();
        
        // Vérifier s'il y a un template à importer dans l'URL
        if (hasTemplateInUrl()) {
            const imported = importTemplateFromUrl();
            if (imported) {
                importData = imported;
                showImportDialog = true;
            }
        }
    });

    function openSaveDialog() {
        if (selectedOffenses.length === 0) return;
        showSaveDialog = true;
        templateName = '';
        templateDescription = '';
    }

    function saveTemplate() {
        if (!templateName.trim()) return;
        
        createTemplate(templateName.trim(), templateDescription.trim(), selectedOffenses);
        templates = loadTemplates();
        showSaveDialog = false;
        templateName = '';
        templateDescription = '';
    }

    function loadTemplate(template: Template) {
        markTemplateAsUsed(template.id);
        templates = loadTemplates();
        onLoadTemplate(template.offenses);
    }

    function confirmDelete(template: Template) {
        templateToDelete = template;
        showDeleteConfirm = true;
    }

    function deleteTemplateConfirmed() {
        if (templateToDelete) {
            deleteTemplate(templateToDelete.id);
            templates = loadTemplates();
            templateToDelete = null;
        }
        showDeleteConfirm = false;
    }

    function openShareDialog(template: Template) {
        templateToShare = template;
        shareUrl = exportTemplateToUrl(template);
        showShareDialog = true;
    }

    function copyShareUrl() {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showCopyNotification = true;
            setTimeout(() => {
                showCopyNotification = false;
            }, 2000);
        });
    }

    function confirmImport() {
        if (importData) {
            createTemplate(importData.name, importData.description, importData.offenses);
            templates = loadTemplates();
            clearTemplateFromUrl();
            showImportDialog = false;
            importData = null;
        }
    }

    function cancelImport() {
        clearTemplateFromUrl();
        showImportDialog = false;
        importData = null;
    }

    function getTemplateSummary(offenses: SelectedOffense[]) {
        const totalFine = offenses.reduce((sum, o) => sum + (o.fine * o.quantity), 0);
        const totalDuration = offenses.reduce((sum, o) => sum + (o.duration_minutes * o.quantity), 0);
        return `${offenses.length} infraction${offenses.length > 1 ? 's' : ''} • ${formatCurrency(totalFine)} • ${totalDuration} min`;
    }
</script>

<div class="space-y-4">
    <!-- Bouton pour sauvegarder le template actuel -->
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Templates sauvegardés</h3>
        <button
            onclick={openSaveDialog}
            disabled={selectedOffenses.length === 0}
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Sauvegarder le template actuel
        </button>
    </div>

    <!-- Liste des templates -->
    {#if templates.length === 0}
        <div class="bg-gray-50 rounded-lg p-6 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun template sauvegardé</h3>
            <p class="mt-1 text-sm text-gray-500">
                Sauvegardez des configurations fréquentes pour les réutiliser rapidement.
            </p>
        </div>
    {:else}
        <div class="grid gap-4">
            {#each templates as template}
                <div class="bg-white rounded-lg shadow border border-gray-200">
                    <div class="p-4">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-medium text-gray-900">{template.name}</h4>
                                {#if template.description}
                                    <p class="text-sm text-gray-600 mt-1">{template.description}</p>
                                {/if}
                                <p class="text-sm text-gray-500 mt-2">
                                    {getTemplateSummary(template.offenses)}
                                </p>
                                <div class="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                    <span>Créé le {formatDate(template.createdAt)}</span>
                                    {#if template.lastUsed}
                                        <span>Utilisé le {formatDate(template.lastUsed)}</span>
                                    {/if}
                                </div>
                            </div>
                            <div class="flex items-center space-x-2 ml-4">
                                <button
                                    onclick={() => loadTemplate(template)}
                                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Charger
                                </button>
                                <button
                                    onclick={() => openShareDialog(template)}
                                    class="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    Partager
                                </button>
                                <button
                                    onclick={() => confirmDelete(template)}
                                    class="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Modal de sauvegarde -->
{#if showSaveDialog}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Sauvegarder le template</h3>
                <div class="space-y-4">
                    <div>
                        <label for="template-name" class="block text-sm font-medium text-gray-700 mb-1">
                            Nom du template *
                        </label>
                        <input
                            id="template-name"
                            type="text"
                            bind:value={templateName}
                            placeholder="Ex: Infractions routières courantes"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label for="template-description" class="block text-sm font-medium text-gray-700 mb-1">
                            Description (optionnel)
                        </label>
                        <textarea
                            id="template-description"
                            bind:value={templateDescription}
                            placeholder="Description du template..."
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>Ce template contient {selectedOffenses.length} infraction{selectedOffenses.length > 1 ? 's' : ''}.</p>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button
                        onclick={() => showSaveDialog = false}
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Annuler
                    </button>
                    <button
                        onclick={saveTemplate}
                        disabled={!templateName.trim()}
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sauvegarder
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Modal de partage -->
{#if showShareDialog}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Partager le template</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            URL de partage
                        </label>
                        <div class="flex">
                            <input
                                type="text"
                                value={shareUrl}
                                readonly
                                class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-600"
                            />
                            <button
                                onclick={copyShareUrl}
                                class="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                Copier
                            </button>
                        </div>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>Partagez cette URL avec d'autres officiers pour qu'ils puissent importer ce template.</p>
                    </div>
                </div>
                <div class="flex justify-end mt-6">
                    <button
                        onclick={() => showShareDialog = false}
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Notification de copie -->
{#if showCopyNotification}
    <div class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-pulse">
        <div class="flex items-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            URL copiée !
        </div>
    </div>
{/if}

<!-- Modal d'import -->
{#if showImportDialog}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Importer un template</h3>
                <div class="space-y-4">
                    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h4 class="font-medium text-blue-900">{importData?.name}</h4>
                        {#if importData?.description}
                            <p class="text-sm text-blue-700 mt-1">{importData.description}</p>
                        {/if}
                        <p class="text-sm text-blue-600 mt-2">
                            {getTemplateSummary(importData?.offenses || [])}
                        </p>
                    </div>
                    <div class="text-sm text-gray-600">
                        <p>Voulez-vous importer ce template partagé ?</p>
                    </div>
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button
                        onclick={cancelImport}
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Annuler
                    </button>
                    <button
                        onclick={confirmImport}
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Importer
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Modal de confirmation de suppression -->
{#if showDeleteConfirm}
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
                <p class="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer le template "{templateToDelete?.name}" ? Cette action est irréversible.
                </p>
                <div class="flex justify-end space-x-3">
                    <button
                        onclick={() => showDeleteConfirm = false}
                        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Annuler
                    </button>
                    <button
                        onclick={deleteTemplateConfirmed}
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if} 