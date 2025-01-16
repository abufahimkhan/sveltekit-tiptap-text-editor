<script lang="ts">
    import { onMount } from "svelte";
    import { Editor, Editor as TipTapEditor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";

    // Editor instance exported for two-way binding
    export let editor: TipTapEditor | null = null;

    // Reference to the container where the editor will be rendered
    let editorContainer: HTMLDivElement | null = null;

    // Function to initialize the TipTap editor
    const initializeEditor = (container: HTMLDivElement | null): Editor => {
        let isFirstLoad = true; // Ensure this variable is scoped correctly

        return new Editor({
            element: container || undefined,
            extensions: [StarterKit],
            content: "Write your prompt here...",
            onSelectionUpdate: ({ editor }) => {
                if (isFirstLoad) {
                    isFirstLoad = false;
                    editor.commands.setContent(""); // Clear the placeholder text when the user interacts for the first time
                }
            },
        });
    };

    // Initialize the editor on mount and clean up on unmount
    onMount(() => {
        if (editorContainer) {
            editor = initializeEditor(editorContainer);
        }

        return () => {
            if (editor) {
                editor.destroy();
                editor = null;
            }
        };
    });
</script>

<div
    bind:this={editorContainer}
    class="editor-container border border-gray-700 bg-gray-900 text-gray-200 rounded-lg p-4 shadow-md"
></div>
