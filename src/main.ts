import { App, Editor, MarkdownView, Modal, Plugin, Setting } from 'obsidian';

const isBlank = (str: string): boolean => !/\S+/.test(str);

// TODO: rename shouldInsert to something like insertRequested
// create an actual shouldInsert() function that does all validation checks
class AddLinkModal extends Modal {
  editor: Editor;
  linkText?: string;
  linkUrl?: string;
  shouldInsert: boolean;
  keydownHandler?: (e: KeyboardEvent) => void;

  constructor(app: App, editor: Editor) {
    super(app);
    this.editor = editor;
    this.shouldInsert = false;
  }

  onOpen() {
    this.shouldInsert = false;

    this.modalEl.classList.add('add-link');
    this.titleEl.setText('Add Link');

    new Setting(this.contentEl).addText((text) =>
      text.setPlaceholder('Text').onChange((value) => {
        console.log('linkText', { value, 'this.linkText': this.linkText });
        this.linkText = value;
      })
    );

    new Setting(this.contentEl).addText((text) =>
      text.setPlaceholder('URL').onChange((value) => {
        console.log('linkUrl', { value, 'this.linkUrl': this.linkUrl });
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

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.shouldInsert = true;
        this.close();
      }
    };

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

    keydownHandler && window.removeEventListener('keydown', keydownHandler);
    contentEl.empty();

    if (!shouldInsert) {
      return;
    }

    if (!linkText || isBlank(linkText) || !linkUrl || isBlank(linkUrl)) {
      return;
    }

    try {
      const url = new URL(linkUrl);

      // remove twitter tracking links
      if (url.hostname === 'twitter.com') {
        url.search = '';
      }

      const markdownLink = `[${linkText}][${url.toString()}]`;

      editor.replaceSelection(markdownLink);
    } catch (TypeError) {
      console.error(`Invalid url:`, linkUrl);
    }
  }
}

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
