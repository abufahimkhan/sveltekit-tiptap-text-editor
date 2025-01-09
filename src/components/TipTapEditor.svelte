<script lang="ts">
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import { CohereClientV2 } from 'cohere-ai';

    let editorContainer: HTMLDivElement | null = null;
    let isLoading = writable(false);
    let errorMessage = writable("");
    let aiErrorMessage = writable("");  // New writable to handle AI-specific errors
    let editor: Editor | null = null;
    let customPrompt = writable("");

    const cohere = new CohereClientV2({
        token: 'oanpjy1v4fbhOiBG9oTCZYI4uetcFnlKsZiLKRU0',
    });

    // Function to send selected text to LLM API and replace with generated text
    const cohereResponse = async () => {
        if (!editor) return;

        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
        );

        if (!selectedText) return;

        isLoading.set(true);
        errorMessage.set("");
        aiErrorMessage.set("");  // Clear AI error message on new request

        const prompt = $customPrompt ? $customPrompt : `generate text based on this '${selectedText}'`;

        try {
            const response = await cohere.chat({
                model: 'command-r-plus',
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });

            const generatedText = response?.message?.content[0]?.text;

            if (generatedText) {
                // Replace the selected text with the regenerated text
                editor.commands.insertContentAt(
                    {
                        from: editor.state.selection.from,
                        to: editor.state.selection.to,
                    },
                    generatedText
                );
                animateGeneratedContent();
            } else {
                aiErrorMessage.set("AI could not generate a meaningful response. Please try again.");
            }
        } catch (err) {
            if (err instanceof Error) {
                errorMessage.set(err.message);
            } else {
                errorMessage.set("An unknown error occurred");
            }
        } finally {
            isLoading.set(false);
        }
    };

    // Function to animate the regenerated content
    const animateGeneratedContent = () => {
        const contentArea = editor?.view.dom.querySelector('.ProseMirror');
        if (contentArea) {
            contentArea.classList.add('opacity-0');
            setTimeout(() => {
                contentArea.classList.remove('opacity-0');
                contentArea.classList.add('transition-opacity', 'duration-1000', 'opacity-100');
            }, 50);
        }
    };

    // Editor setup and cleanup
    onMount(() => {
        editor = new Editor({
            extensions: [StarterKit],
            content: "",
        });

        if (editorContainer) {
            editorContainer.appendChild(editor.view.dom);
        }

        return () => editor?.destroy();
    });
</script>

<div class="max-w-5xl mx-auto p-8 space-y-6">
    <!-- AI-specific Error Message (Outside the editor area) -->
    {#if $aiErrorMessage}
        <div class="ai-error text-yellow-600 mt-2 text-sm animate-fadeIn">
            {$aiErrorMessage}
        </div>
    {/if}

    <!-- Editor Container with Tailwind styles -->
     <label class="text-sm font-semibold text-gray-700">Start typing</label>
    <div
        class="editor-container outline-none border text-gray-500 border-gray-300 rounded-lg p-4 bg-white shadow-md "
        bind:this={editorContainer}
    >
        
    </div>

    <!-- Custom Input Field for LLM Prompt (optional customization) -->
    <div class="flex flex-col space-y-2">
        <label for="llm-prompt" class="text-sm font-semibold text-gray-700">Customize LLM Prompt</label>
        <input
            id="llm-prompt"
            type="text"
            bind:value={$customPrompt}
            placeholder="Enter your custom prompt..."
            class="w-full p-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>

    <!-- Button to Regenerate with AI -->
    <button
        on:click={cohereResponse}
        class="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 ease-in-out disabled:bg-gray-400"
        disabled={$isLoading}
    >
        {#if $isLoading}
            <!-- Stylish spinner -->
            <div class="flex justify-center items-center space-x-2">
                <div class="w-6 h-6 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
                <span>Regenerating...</span>
            </div>
        {:else}
            Regenerate with AI
        {/if}
    </button>

    <!-- General Error Message Display -->
    {#if $errorMessage}
        <div class="error text-red-600 mt-2 text-sm animate-fadeIn">
            {$errorMessage}
        </div>
    {/if}
</div>

<style>
    /* Smooth error message fade-in animation */
    .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
