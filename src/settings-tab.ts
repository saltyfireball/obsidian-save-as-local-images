import { PluginSettingTab, Setting } from "obsidian";
import type { App } from "obsidian";
import type SaveLocalImagesPlugin from "./main";

export class SaveLocalImagesSettingTab extends PluginSettingTab {
	plugin: SaveLocalImagesPlugin;

	constructor(app: App, plugin: SaveLocalImagesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("About").setHeading();

		containerEl.createEl("p", {
			text: "Save as Local Images finds all remote/external images in the current note " +
				"and downloads them into your vault's attachment folder. " +
				"After downloading, all URLs are rewritten to point to the local copies.",
			cls: "setting-item-description",
		});

		new Setting(containerEl).setName("How to use").setHeading();

		const instructions = containerEl.createEl("div", { cls: "sli-settings-instructions" });

		const steps = instructions.createEl("ol");
		steps.createEl("li", {
			text: "Open a note that contains remote images",
		});
		steps.createEl("li", {
			text: "Run the \"save all remote images locally\" command from the palette",
		});
		steps.createEl("li", {
			text: "The plugin downloads each image and saves it under your vault's attachment folder, " +
				"organized by the note's path (e.g. attachments/games/re/game1/)",
		});
		steps.createEl("li", {
			text: "Remote urls in the note are rewritten to point to the local files",
		});

		instructions.createEl("p", {
			text: "Supported formats: markdown images ![alt](url), HTML <img src=\"url\">, " +
				"and wiki embeds ![[url]].",
		});

		new Setting(containerEl).setName("Behavior").setHeading();

		new Setting(containerEl)
			.setName("Show progress notices")
			.setDesc("Display notices showing how many images were found, downloaded, and any errors.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showNotice).onChange(async (value) => {
					this.plugin.settings.showNotice = value;
					await this.plugin.saveSettings();
				}),
			);
	}
}
