<script lang="ts">
	import Icon from '@iconify/svelte';
	import pkg from '@leaningtech/browserpod/package.json';
</script>

<footer
	class="hidden h-9 shrink-0 items-center justify-between border-t border-white/6 bg-[#111111] px-4 md:flex"
>
	<span class="text-[12px] text-white/25">Made with BrowserPod v{pkg.version}</span>
	<a
		href="https://labs.leaningtech.com/blog/browserpod-20"
		target="_blank"
		rel="noopener noreferrer"
		class="flex items-center gap-1 text-[12px] text-white/25 transition hover:text-white/55"
	>
		<span>Latest: Git, bash, BrowserPod 2.0</span>
		<Icon icon="mingcute:arrow-right-up-line" width="13" height="13" />
	</a>
</footer>
