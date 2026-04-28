import { normalizePath, requestUrl, Notice } from "obsidian";
import type { App, TFile } from "obsidian";
import { extensionFromUrl, extensionFromContentType, findRemoteImageUrls } from "./image-finder";

function generateId(): string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let id = "";
	for (let i = 0; i < 12; i++) {
		id += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return id;
}

async function ensureFolder(app: App, folderPath: string): Promise<void> {
	const normalized = normalizePath(folderPath);
	const existing = app.vault.getAbstractFileByPath(normalized);
	if (existing) return;

	const parts = normalized.split("/");
	let current = "";
	for (const part of parts) {
		current = current ? `${current}/${part}` : part;
		const found = app.vault.getAbstractFileByPath(current);
		if (!found) {
			await app.vault.createFolder(current);
		}
	}
}

function buildAttachmentFolder(app: App, file: TFile): string {
	const vault = app.vault as unknown as Record<string, unknown>;
	const config = (vault["config"] ?? {}) as Record<string, unknown>;
	const attachmentBase = (config["attachmentFolderPath"] as string | undefined) ?? "";

	const notePath = file.path;
	const noteDir = notePath.substring(0, notePath.lastIndexOf("/"));
	const noteName = file.basename;

	const subPath = noteDir ? `${noteDir}/${noteName}` : noteName;

	if (!attachmentBase || attachmentBase === "/") {
		return subPath;
	}

	if (attachmentBase === "./") {
		return noteDir ? `${noteDir}/${noteName}` : noteName;
	}

	if (attachmentBase.startsWith("./")) {
		const relative = attachmentBase.substring(2);
		const base = noteDir ? `${noteDir}/${relative}` : relative;
		return `${base}/${noteName}`;
	}

	return `${attachmentBase}/${subPath}`;
}

function escapeForRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Format a vault-relative path for use inside a markdown image link.
 * Wraps with angle brackets when the path contains characters that are
 * unsafe in `![](path)` syntax: whitespace, parens, or angle brackets.
 * Avoids URL-encoding (encodeURIComponent over-encodes commas/parens,
 * which Obsidian's link resolver does not reliably decode).
 */
function formatMarkdownLinkTarget(target: string): string {
	if (!target) return target;
	if (/[\s()<>]/.test(target)) {
		return `<${target}>`;
	}
	return target;
}

function collapseLinkedImages(content: string): string {
	const linkedImageRe = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)"]+)(?:\s+"[^"]*")?\s*\)/g;
	return content.replace(linkedImageRe, (_match, alt: string, imgSrc: string, linkHref: string) => {
		const trimmedHref = linkHref.trim();
		if (imgSrc === trimmedHref || !trimmedHref.startsWith("http")) {
			return `![${alt}](${imgSrc})`;
		}
		return _match;
	});
}

export interface DownloadResult {
	total: number;
	saved: number;
	failed: number;
	errors: string[];
}

export async function downloadAndReplaceImages(
	app: App,
	file: TFile,
	showNotice: boolean,
): Promise<DownloadResult> {
	const content = await app.vault.read(file);
	const urls = findRemoteImageUrls(content);

	const result: DownloadResult = {
		total: urls.length,
		saved: 0,
		failed: 0,
		errors: [],
	};

	if (urls.length === 0) {
		if (showNotice) {
			new Notice("No remote images found in this note.");
		}
		return result;
	}

	const attachmentFolder = buildAttachmentFolder(app, file);
	await ensureFolder(app, attachmentFolder);

	if (showNotice) {
		new Notice(`Found ${urls.length} remote image(s). Downloading...`);
	}

	const urlToLocal = new Map<string, string>();

	for (const url of urls) {
		try {
			const response = await requestUrl({ url });
			const buffer = response.arrayBuffer;

			const contentType = response.headers["content-type"] ?? "";
			let ext: string;
			if (contentType && contentType.includes("image/")) {
				ext = extensionFromContentType(contentType);
			} else {
				ext = extensionFromUrl(url);
			}

			const filename = `${generateId()}.${ext}`;
			const filePath = normalizePath(`${attachmentFolder}/${filename}`);

			await app.vault.createBinary(filePath, buffer);
			urlToLocal.set(url, filePath);
			result.saved++;
		} catch (e: unknown) {
			result.failed++;
			const msg = e instanceof Error ? e.message : "Unknown error";
			result.errors.push(`${url}: ${msg}`);
		}
	}

	let updatedContent = content;
	for (const [url, localPath] of urlToLocal) {
		const formatted = formatMarkdownLinkTarget(localPath);
		const pattern = new RegExp(escapeForRegex(url), "g");
		updatedContent = updatedContent.replace(pattern, formatted);
	}

	updatedContent = collapseLinkedImages(updatedContent);

	if (updatedContent !== content) {
		await app.vault.modify(file, updatedContent);
	}

	if (showNotice) {
		if (result.failed > 0) {
			new Notice(
				`Saved ${result.saved}/${result.total} images. ${result.failed} failed.`,
			);
		} else {
			new Notice(`All ${result.saved} images saved locally.`);
		}
	}

	return result;
}
