<script lang="ts">
	import Terminal from '$lib/components/Terminal.svelte';
	import Portal from '$lib/components/Portal.svelte';

	import { onMount, tick } from 'svelte';
	import { bootCLI } from '$lib/utils/main';

	type PortalItem = { port: number; url: string };
	type PortalUpdate = { port: number; url: string | null; active: boolean };

	let portalUrl: string | '' = '';
	let portalDebug = false;
	let portals: PortalItem[] = [];
	let selectedPort: number | null = null;
	let showPortalMenu = false;
	let showPortalInfo = false;
	let copied = false;
	let qrCodeCanvas: HTMLCanvasElement | null = null;
	let qrError = '';
	let copiedTimeout: ReturnType<typeof setTimeout>;
	let terminalComponent: any;

	function applyPortalUpdate(update: PortalUpdate) {
		const next = [...portals];
		const idx = next.findIndex((item) => item.port === update.port);

		if (update.active && update.url) {
			if (idx >= 0) {
				next[idx] = { port: update.port, url: update.url };
			} else {
				next.push({ port: update.port, url: update.url });
			}

			next.sort((a, b) => a.port - b.port);
			portals = next;

			selectedPort = update.port;
			portalUrl = update.url;

			// Trigger terminal resize after portal appears
			tick().then(() => {
				terminalComponent?.triggerResize();
			});
			return;
		}

		if (idx >= 0) {
			next.splice(idx, 1);
		}
		portals = next;

		if (selectedPort === update.port || !next.some((item) => item.port === selectedPort)) {
			const fallback = next[0];
			selectedPort = fallback?.port ?? null;
			portalUrl = fallback?.url ?? '';
		}
	}

	function onPortChange(event: Event) {
		const value = Number((event.currentTarget as HTMLSelectElement).value);
		if (!Number.isInteger(value)) return;

		selectedPort = value;
		const selected = portals.find((item) => item.port === value);
		portalUrl = selected?.url ?? '';
		closePortalOverlays();
	}

	function togglePortalMenu() {
		showPortalMenu = !showPortalMenu;
		if (showPortalMenu) showPortalInfo = false;
	}

	function closePortalOverlays() {
		showPortalMenu = false;
		showPortalInfo = false;
		qrError = '';
	}

	async function renderQRCode(url: string) {
		qrError = '';
		try {
			await tick();
			if (!qrCodeCanvas) return;

			await QRCode.toCanvas(qrCodeCanvas, url, {
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

	async function showQRCodePanel() {
		if (!portalUrl) return;
		showPortalMenu = false;
		showPortalInfo = true;
		await renderQRCode(portalUrl);
	}

	function openPortalInNewTab() {
		if (!portalUrl) return;
		showPortalMenu = false;
		window.open(portalUrl, '_blank', 'noopener,noreferrer');
	}

	async function copyPortalURL() {
		if (!portalUrl) return;
		showPortalMenu = false;
		await navigator.clipboard.writeText(portalUrl);
		copied = true;
		clearTimeout(copiedTimeout);
		copiedTimeout = setTimeout(() => (copied = false), 1200);
	}

	onMount(() => {
		bootCLI((update: PortalUpdate | string) => {
			if (typeof update === 'string') {
				let parsed: URL;
				try {
					parsed = new URL(update);
				} catch {
					return;
				}
				const port = Number(parsed.port);
				if (!Number.isInteger(port) || port <= 0) return;
				applyPortalUpdate({ port, url: update, active: true });
				return;
			}

			applyPortalUpdate(update);
		});

		return () => {
			clearTimeout(copiedTimeout);
		};
	});
</script>

<div class="flex h-full min-h-0 w-full min-w-0 flex-row">
	<div class="min-h-0 min-w-0 flex-1 overflow-hidden bg-black">
		<Terminal bind:this={terminalComponent} />
	</div>

	{#if portals.length > 0}
		<div
			class="portal-container relative flex min-h-0 min-w-0 flex-1 overflow-hidden border-l border-zinc-700"
		>
			<div class="min-h-0 min-w-0 flex-1 overflow-hidden">
				<Portal
					src={portalUrl}
					debug={portalDebug}
					{portals}
					{selectedPort}
					showMenu={showPortalMenu}
					showInfo={showPortalInfo}
					{copied}
					{qrError}
					{qrCodeCanvas}
					{onPortChange}
					onToggleMenu={togglePortalMenu}
					onCopyLink={copyPortalURL}
					onOpenNewTab={openPortalInNewTab}
					onShowQrCode={showQRCodePanel}
					onCloseOverlays={closePortalOverlays}
				/>
			</div>
		</div>
	{/if}
</div>
