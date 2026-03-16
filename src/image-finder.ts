const REMOTE_URL_CONTEXTS = [
	/!\[[^\]]*]\(\s*(https?:\/\/[^)\s]+)/g,
	/<img\b[^>]*\bsrc\s*=\s*"(https?:\/\/[^"]+)"/gi,
	/!\[\[(https?:\/\/[^\]]+)]]/g,
	/]\(\s*(https?:\/\/[^)\s]+)/g,
];

const IMAGE_EXTENSIONS = [
	".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg",
	".webp", ".ico", ".tiff", ".tif", ".avif",
];

function looksLikeImage(url: string): boolean {
	const cleaned = (url.split("?")[0] ?? url).toLowerCase();
	return IMAGE_EXTENSIONS.some((ext) => cleaned.endsWith(ext));
}

export function findRemoteImageUrls(content: string): string[] {
	const urls = new Set<string>();

	for (const pattern of REMOTE_URL_CONTEXTS) {
		pattern.lastIndex = 0;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(content)) !== null) {
			const url = (match[1] ?? "").trim();
			if (url && looksLikeImage(url)) {
				urls.add(url);
			}
		}
	}

	return Array.from(urls);
}

export function extensionFromUrl(url: string): string {
	const cleaned = (url.split("?")[0] ?? url).toLowerCase();
	if (cleaned.endsWith(".jpg") || cleaned.endsWith(".jpeg")) return "jpg";
	if (cleaned.endsWith(".png")) return "png";
	if (cleaned.endsWith(".gif")) return "gif";
	if (cleaned.endsWith(".bmp")) return "bmp";
	if (cleaned.endsWith(".svg")) return "svg";
	if (cleaned.endsWith(".webp")) return "webp";
	if (cleaned.endsWith(".ico")) return "ico";
	if (cleaned.endsWith(".tiff") || cleaned.endsWith(".tif")) return "tiff";
	if (cleaned.endsWith(".avif")) return "avif";
	return "png";
}

export function extensionFromContentType(contentType: string): string {
	const ct = contentType.toLowerCase();
	if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
	if (ct.includes("png")) return "png";
	if (ct.includes("gif")) return "gif";
	if (ct.includes("bmp")) return "bmp";
	if (ct.includes("svg")) return "svg";
	if (ct.includes("webp")) return "webp";
	if (ct.includes("ico") || ct.includes("icon")) return "ico";
	if (ct.includes("tiff")) return "tiff";
	if (ct.includes("avif")) return "avif";
	return "png";
}
