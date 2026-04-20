<script lang="ts">
	import Terminal from '$lib/components/Terminal.svelte';
	import { onMount } from 'svelte';
	import { bootCLI } from '$lib/utils/main';

	onMount(() => {
		bootCLI();
	});
</script>

<div class="h-full min-h-0 w-full min-w-0">
	<Terminal />
</div>
