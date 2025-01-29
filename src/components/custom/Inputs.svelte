<script>
  export let value = "";
  export let placeholder = "";
  export let className = "";
</script>

<input
  bind:value
  class={`w-full sm:w-3/4 bg-neutral-700 text-white p-2 rounded-md focus:ring-2 focus:ring-blue-500 ${className}`}
  placeholder={placeholder}
/>
