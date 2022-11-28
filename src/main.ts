import { App, Editor, MarkdownView, Modal, Plugin, Setting } from 'obsidian';

export default class AddLink extends Plugin {
  async onload() {
    this.addCommand({
      id: 'add-external-markdown-link',
      name: 'Add external link',
      icon: 'external-link',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        new AddLinkModal(this.app, editor).open();
      },
    });
  }

  onunload() {}
}

class AddLinkModal extends Modal {
  editor: Editor;
  linkText?: string;
  linkUrl?: string;
  shouldInsert: boolean;

  constructor(app: App, editor: Editor) {
    super(app);
    this.editor = editor;
    this.shouldInsert = false;
  }

  keydownHandler(e: KeyboardEvent) {
    e.preventDefault();

    if (e.key === 'Enter') {
      this.shouldInsert = true;
      this.close();
    }
  }

  onOpen() {
    this.shouldInsert = false;

    this.modalEl.classList.add('add-link');
    this.titleEl.setText('Add Link');

    new Setting(this.contentEl).setName('Text').addText((text) =>
      text.setPlaceholder('Link text').onChange((value) => {
        this.linkText = value;
      })
    );

    new Setting(this.contentEl).setName('URL').addText((text) =>
      text.setPlaceholder('URL').onChange((value) => {
        this.linkUrl = value;
      })
    );

    new Setting(this.contentEl).addButton((button) =>
      button
        .setButtonText('Insert ↩')
        .setCta()
        .onClick(() => {
          this.shouldInsert = true;
          this.close();
        })
    );

    window.addEventListener('keydown', this.keydownHandler);
  }

  onClose() {
    const {
      contentEl,
      editor,
      keydownHandler,
      linkText,
      linkUrl,
      shouldInsert,
    } = this;

    window.removeEventListener('keydown', keydownHandler);

    if (shouldInsert && linkText && linkUrl) {
      // TODO: add http if missing
      // TODO: cleanup twitter urls
      editor.replaceSelection(`[${linkText}](${linkUrl})`);
    }

    contentEl.empty();
  }
}
