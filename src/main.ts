import { Plugin, Notice, TFile, TFolder } from "obsidian";
import { downloadAndReplaceImages } from "./downloader";
import { SaveLocalImagesSettingTab } from "./settings-tab";
import { DEFAULT_SETTINGS } from "./types";
import type { SaveLocalImagesSettings } from "./types";

export default class SaveLocalImagesPlugin extends Plugin {
	settings!: SaveLocalImagesSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new SaveLocalImagesSettingTab(this.app, this));

		this.addCommand({
			id: "save-all-remote-images",
			name: "Save all remote images locally",
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (!file || file.extension !== "md") {
					return false;
				}
				if (!checking) {
					void this.saveImages(file);
				}
				return true;
			},
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFolder) {
					menu.addItem((item) => {
						item.setTitle("Save all remote images locally")
							.setIcon("image-down")
							.onClick(() => {
								void this.saveImagesInFolder(file);
							});
					});
				}
			}),
		);
	}

	private async saveImages(file: TFile): Promise<void> {
		try {
			await downloadAndReplaceImages(this.app, file, this.settings.showNotice);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Unknown error";
			new Notice(`Failed to save images: ${msg}`);
		}
	}

	private collectMarkdownFiles(folder: TFolder): TFile[] {
		const out: TFile[] = [];
		const walk = (f: TFolder) => {
			for (const child of f.children) {
				if (child instanceof TFile && child.extension === "md") {
					out.push(child);
				} else if (child instanceof TFolder) {
					walk(child);
				}
			}
		};
		walk(folder);
		return out;
	}

	private async saveImagesInFolder(folder: TFolder): Promise<void> {
		const files = this.collectMarkdownFiles(folder);

		if (files.length === 0) {
			new Notice("No Markdown notes found in this folder.");
			return;
		}

		new Notice(`Scanning ${files.length} note(s) for remote images...`);

		let notesWithImages = 0;
		let totalSaved = 0;
		let totalFailed = 0;
		const errors: string[] = [];

		for (const file of files) {
			try {
				const result = await downloadAndReplaceImages(this.app, file, false);
				if (result.total > 0) notesWithImages++;
				totalSaved += result.saved;
				totalFailed += result.failed;
				for (const err of result.errors) {
					errors.push(`${file.path}: ${err}`);
				}
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : "Unknown error";
				errors.push(`${file.path}: ${msg}`);
				totalFailed++;
			}
		}

		const failedSuffix = totalFailed > 0 ? `, ${totalFailed} failed` : "";
		const summary =
			`${files.length} note(s) scanned, ${notesWithImages} contained images, ` +
			`${totalSaved} image(s) saved${failedSuffix}.`;
		new Notice(summary, 8000);

		if (errors.length > 0) {
			console.error("Save remote images errors:\n" + errors.join("\n"));
		}
	}

	async loadSettings(): Promise<void> {
		const data = (await this.loadData()) as Partial<SaveLocalImagesSettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) };
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
