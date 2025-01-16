<script lang="ts">
    export let errorMessage: string;
    export let aiErrorMessage: string;
</script>

{#if aiErrorMessage}
    <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
        {aiErrorMessage}
    </div>
{/if}
{#if errorMessage}
    <div class="text-red-700">{errorMessage}</div>
{/if}
