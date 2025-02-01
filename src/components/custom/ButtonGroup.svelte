<script lang="ts">
    import type { Editor } from "@tiptap/core";

    export let editor: Editor | null;
    export let clearContent: () => void;
</script>

<div class="flex flex-col lg:flex-row gap-1">
    <button
        on:click={clearContent}
        class="bg-red-600 hover:bg-red-500 text-white rounded-full text-[8px] sm:text-sm px-4 py-2"
    >
        Clear All
    </button>
</div>
