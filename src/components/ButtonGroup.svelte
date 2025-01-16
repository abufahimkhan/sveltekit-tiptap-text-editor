<script lang="ts">
    import type { Editor } from "@tiptap/core";

    export let editor: Editor | null;
    export let clearContent: () => void;
</script>

<div class="flex items-center gap-2">
    <button
        on:click={() => editor?.chain().focus().toggleBold().run()}
        class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
    >
        Bold
    </button>
    <button
        on:click={() => editor?.chain().focus().toggleItalic().run()}
        class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
    >
        Italic
    </button>
    <button
        on:click={() => editor?.chain().focus().toggleStrike().run()}
        class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
    >
        Strike
    </button>
    <button
        on:click={clearContent}
        class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
    >
        Clear All
    </button>
</div>
