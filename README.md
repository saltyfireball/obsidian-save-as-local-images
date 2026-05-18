# Save as Local Images

An [Obsidian](https://obsidian.md) plugin that downloads remote/external images and saves them locally to your vault. After downloading, every URL is rewritten to point to the local copy.

Works on both desktop and mobile.

## Features

- **Save images in a single note** -- command palette: "Save all remote images locally"
- **Save images for a whole folder (recursive)** -- right-click any folder in the file explorer and choose "Save all remote images locally". Walks every Markdown note in the folder and its subfolders, downloads remote images, rewrites URLs in place, and reports a summary.
- **Automatic folder structure** -- images are saved under your vault's configured attachment folder, nested by the note's path (e.g. `attachments/games/re/game1/`).
- **Supports all common image syntaxes** in the body of the note:
  - Markdown: `![alt](url)`
  - HTML: `<img src="url">`
  - Wiki embeds: `![[url]]`
  - Linked images: `[![alt](url)](url)` are collapsed to plain images after rewrite when the link and image point to the same URL.
- **Frontmatter image URLs** -- bare image URLs in frontmatter properties (e.g. `cover: https://example.com/cover.png`) are also downloaded and rewritten.
- **URL rewriting** -- after saving, every occurrence of the remote URL in the note is replaced with the local file path.
- **Safe link targets** -- local paths that contain spaces, parentheses, or angle brackets are wrapped with `<...>` so Obsidian's link resolver handles them correctly (no `%2C`/`%20` over-encoding).
- **Unique filenames** -- each downloaded image gets a 12-character random ID-based filename to avoid collisions.
- **Content-type detection** -- file extensions are determined from the HTTP `Content-Type` header, falling back to the URL extension.
- **Per-file error handling** -- a failed download is reported individually and does not stop the rest. Errors from folder runs are also logged to the console.
- **Progress notices** -- shows how many images were found, saved, and any failures. Can be disabled in settings. Folder runs always show a single summary notice regardless of the setting.

## How to Use

### Single note

1. Open a note that contains remote images.
2. Open the command palette (`Ctrl/Cmd + P`).
3. Run **Save as Local Images: Save all remote images locally**.

### Whole folder

1. Right-click any folder in the file explorer.
2. Choose **Save all remote images locally**.
3. The plugin walks every `.md` file under that folder (recursively), downloads remote images, rewrites the URLs, and shows a summary notice when done.

In both cases the plugin will:

- Scan the note for remote image URLs.
- Download each image.
- Save it under your attachment folder, nested by the note's location.
- Rewrite every URL in the note to point to the local file.

### Folder Structure

If your vault's attachment folder is set to `attachments` and you run the command on a note at `games/re/game1.md`, the images will be saved to:

```
attachments/games/re/game1/
  abc123def456.png
  ghi789jkl012.jpg
  ...
```

## Supported Image Patterns

| Pattern         | Example                                          |
| --------------- | ------------------------------------------------ |
| Markdown        | `![screenshot](https://example.com/img.png)`     |
| HTML            | `<img src="https://example.com/img.png">`        |
| Wiki embed      | `![[https://example.com/img.png]]`               |
| Linked image    | `[![alt](https://.../img.png)](https://.../img.png)` |
| Frontmatter URL | `cover: https://example.com/cover.png`           |

Supported file types: PNG, JPG/JPEG, GIF, BMP, SVG, WebP, ICO, TIFF, AVIF.

## Installation

### Obsidian Community Plugin

This plugin is available in the official Obsidian community plugin directory. Install it from **Settings > Community plugins > Browse** and search for "Save as Local Images" or "Save as Local Images by saltyfireball".

Community plugin page: <https://community.obsidian.md/plugins/sfb-save-as-local-images>

## More Plugins by saltyfireball

Browse all of my published Obsidian plugins on my profile: <https://community.obsidian.md/users/saltyfireball>

## Settings

- **Show progress notices** -- display notices showing how many images were found, downloaded, and any errors (enabled by default). Applies to single-note runs; folder runs always show one summary notice.

## License

[MIT](LICENSE)
