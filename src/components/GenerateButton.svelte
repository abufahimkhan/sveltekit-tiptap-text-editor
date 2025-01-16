<script lang="ts">
    export let isLoading: boolean;
    export let onClick: () => void;
</script>

<button
    on:click={onClick}
    class="mt-4 w-fit py-2 px-5 text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
    disabled={isLoading}
>
    {#if isLoading}
        <span class="loading-spinner"></span> Generating...
    {/if}
    {#if !isLoading}
        Generate with AI
    {/if}
</button>
