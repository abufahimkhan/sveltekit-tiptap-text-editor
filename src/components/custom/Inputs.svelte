<script>
  export let value = "";
  export let placeholder = "";
  export let className = "";
</script>

<input
  bind:value
  class={`w-full sm:w-full bg-neutral-700 text-white text-lg p-2 rounded-full focus:ring-2 focus:ring-blue-500 ${className}`}
  {placeholder}
/>
