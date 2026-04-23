<script lang="ts">
	import Icon from '@iconify/svelte';
	import QRCode from 'qrcode';

	type PortalItem = { port: number; url: string };

	let {
		src = '',
		debug = false,
		portals = [] as PortalItem[],
		selectedPort = null as number | null,
		showMenu = false,
		showInfo = false,
		copied = false,
		qrError = '',
		qrCodeCanvas = null as HTMLCanvasElement | null,
		onPortChange,
		onToggleMenu,
		onCopyLink,
		onOpenNewTab,
		onShowQrCode,
		onCloseOverlays
	} = $props<{
		src?: string;
		debug?: boolean;
		portals?: PortalItem[];
		selectedPort?: number | null;
		showMenu?: boolean;
		showInfo?: boolean;
		copied?: boolean;
		qrError?: string;
		qrCodeCanvas?: HTMLCanvasElement | null;
		onPortChange?: (event: Event) => void;
		onToggleMenu?: () => void;
		onCopyLink?: () => void;
		onOpenNewTab?: () => void;
		onShowQrCode?: () => void;
		onCloseOverlays?: () => void;
	}>();

	let localQrCodeCanvas: HTMLCanvasElement | null = null;

	async function renderQRCode(url: string) {
		try {
			if (!localQrCodeCanvas) return;

			await QRCode.toCanvas(localQrCodeCanvas, url, {
				width: 180,
				margin: 1,
				errorCorrectionLevel: 'M',
				color: {
					dark: '#f4f4f5',
					light: '#111111'
				}
			});
		} catch (error) {
			console.error('Failed to generate QR code:', error);
			qrError = 'Unable to generate QR code';
		}
	}

	$effect(() => {
		if (showInfo && src && localQrCodeCanvas) {
			renderQRCode(src);
		}
	});
</script>

{#if portals.length > 0 || debug}
	<div class="flex h-full min-h-0 w-full min-w-0 flex-col border-t border-white/10 bg-white">
		<div
			class="flex h-8 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900 px-3 text-[11px] font-medium tracking-wide text-white/70"
		>
			<div class="flex items-center gap-2">
				<Icon icon="mingcute:eye-2-line" width="11" height="11" />
				<span>Portal</span>

				{#if portals.length > 0}
					<div class="relative">
						<select
							class="h-6 min-w-[80px] appearance-none rounded-md border border-white/20 bg-zinc-800 pr-6 pl-2 text-[11px] font-medium text-white/70 outline-none hover:border-white/30 hover:text-white focus:border-[#4f8cff] focus:ring-2 focus:ring-[#4f8cff]/30"
							on:change={onPortChange}
							value={selectedPort ?? undefined}
							aria-label="Select portal port"
						>
							{#each portals as item (item.port)}
								<option value={item.port}>:{item.port}</option>
							{/each}
						</select>
						<div
							class="pointer-events-none absolute inset-y-0 right-1 flex items-center text-white/45"
						>
							<Icon icon="mingcute:down-line" width="12" height="12" />
						</div>
					</div>
				{/if}
			</div>

			{#if src}
				<div class="relative flex items-center gap-1.5">
					<button
						on:click={onToggleMenu}
						class="inline-flex cursor-pointer items-center gap-1 rounded border-none bg-transparent px-1.5 py-0.5 text-[11px] text-white/55 hover:text-white/80"
					>
						<Icon icon="mingcute:settings-2-line" width="11" height="11" />
						<span>{copied ? 'Copied!' : 'Menu'}</span>
					</button>

					{#if showMenu}
						<div
							class="absolute top-[calc(100%+4px)] right-0 z-30 min-w-[168px] rounded-lg border border-white/10 bg-zinc-900 p-1 shadow-[0_12px_26px_rgba(0,0,0,0.22)]"
						>
							<button
								on:click={onCopyLink}
								class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] text-white/70 hover:bg-white/5 hover:text-white"
							>
								<Icon icon="mingcute:copy-2-line" width="11" height="11" />
								Copy link
							</button>
							<button
								on:click={onOpenNewTab}
								class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] text-white/70 hover:bg-white/5 hover:text-white"
							>
								<Icon icon="mingcute:external-link-line" width="11" height="11" />
								Open in new tab
							</button>
							<button
								on:click={onShowQrCode}
								class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] text-white/70 hover:bg-white/5 hover:text-white"
							>
								<Icon icon="mingcute:qrcode-2-line" width="11" height="11" />
								Show QR code
							</button>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		{#if src}
			<div class="relative min-h-0 flex-1">
				<iframe {src} id="portal" title="Portal content" class="h-full min-h-0 w-full"></iframe>

				{#if showInfo}
					<div
						class="absolute inset-0 z-30 flex items-center justify-center bg-black/55 backdrop-blur-sm"
					>
						<div class="relative w-[230px] rounded-lg border border-white/20 bg-[#111111] p-3">
							<button
								on:click={onCloseOverlays}
								class="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/80 hover:bg-white/20"
							>
								<Icon icon="mingcute:close-line" width="10" height="10" />
								Close
							</button>

							<div class="rounded-md border border-white/10 bg-zinc-900 p-2">
								<canvas bind:this={localQrCodeCanvas} width="180" height="180"></canvas>
							</div>

							{#if qrError}
								<div class="mt-2 text-center text-[10px] text-rose-300/90">{qrError}</div>
							{:else}
								<div class="mt-2 truncate text-center text-[10px] text-white/55">{src}</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{:else if debug}
			<div class="flex h-full w-full items-center justify-center text-xs text-white/40">
				Portal debug mode (no URL)
			</div>
		{/if}
	</div>
{/if}
