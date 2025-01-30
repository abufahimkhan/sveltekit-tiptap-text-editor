<script lang="ts">
    import type { Editor } from "@tiptap/core";

    export let editor: Editor | null;
    export let clearContent: () => void;
</script>

<div class="flex flex-col lg:flex-row gap-1">
    <button
        on:click={() => editor?.chain().focus().toggleBold().run()}
        class="font-mono bg-green-800 hover:bg-gray-700 text-white rounded-full text-[8px] sm:text-sm px-4 py-2"
    >
        Bold
    </button>
    <button
        on:click={() => editor?.chain().focus().toggleItalic().run()}
        class="font-mono bg-sky-800 hover:bg-gray-700 text-white rounded-full text-[8px] sm:text-sm px-4 py-2"
    >
        Italic
    </button>
    <button
        on:click={() => editor?.chain().focus().toggleStrike().run()}
        class="font-mono bg-yellow-800 hover:bg-gray-700 text-white rounded-full text-[8px] sm:text-sm px-4 py-2"
    >
        Strike
    </button>
    <button
        on:click={clearContent}
        class="bg-red-600 hover:bg-red-500 text-white rounded-full text-[8px] sm:text-sm px-4 py-2"
    >
        Clear All
    </button>
</div>
