import { Plugin, Notice } from "obsidian";
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
	}

	private async saveImages(file: import("obsidian").TFile): Promise<void> {
		try {
			await downloadAndReplaceImages(this.app, file, this.settings.showNotice);
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : "Unknown error";
			new Notice(`Failed to save images: ${msg}`);
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
