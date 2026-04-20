export async function bootCLI() {
	const { BrowserPod } = await import('@leaningtech/browserpod');

	const consoleElement = document.querySelector('#console');
	const pod = await BrowserPod.boot({ apiKey: import.meta.env.VITE_BP_APIKEY });
	const terminal = await pod.createDefaultTerminal(consoleElement);

	const homePath = '/home/user';
	const projectPath = `${homePath}/project`;
	await pod.createDirectory(projectPath);
	await copyFile(pod, `project/package.json`, homePath);

	await pod.run('npm', ['install', '--ignore-scripts'], {
		echo: true,
		terminal: terminal,
		cwd: projectPath
	});

	await pod.run('npm', ['run', 'gemini'], {
		echo: true,
		terminal: terminal,
		cwd: projectPath
	});
}

export async function copyFile(pod, path, prefix) {
	const normalizedPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
	const f = await pod.createFile(`${normalizedPrefix}/${path}`, 'binary');
	const resp = await fetch(path);
	const buf = await resp.arrayBuffer();
	await f.write(buf);
	await f.close();
}
