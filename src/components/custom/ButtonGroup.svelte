<script lang="ts">
    import type { Editor } from "@tiptap/core";

    export let editor: Editor | null;
    export let clearContent: () => void;
</script>

<div class="flex items-center gap-1">
    <button
        on:click={() => editor?.chain().focus().toggleBold().run()}
        class="font-mono px-4 py-1 bg-green-800 hover:bg-gray-700 text-white rounded-full text-sm"
    >
        Bold
    </button>
    <button
        on:click={() => editor?.chain().focus().toggleItalic().run()}
        class="font-mono px-4 py-1 bg-sky-800 hover:bg-gray-700 text-white rounded-full text-sm"
    >
        Italic
    </button>
    <button
        on:click={() => editor?.chain().focus().toggleStrike().run()}
        class="font-mono px-4 py-1 bg-yellow-800 hover:bg-gray-700 text-white rounded-full text-sm"
    >
        Strike
    </button>
    <button
        on:click={clearContent}
        class="px-4 py-1 bg-red-600 hover:bg-red-500 text-white rounded-full text-sm"
    >
        Clear All
    </button>
</div>
