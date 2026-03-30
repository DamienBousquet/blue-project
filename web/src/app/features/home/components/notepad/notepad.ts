import { Component, ViewChild, ElementRef, SecurityContext, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-notepad',
  imports: [FormsModule],
  templateUrl: './notepad.html',
  styleUrl: './notepad.scss',
})
export class Notepad {
  id = input<string>();
  titleInput = input<string>();
  contentInput = input<string>();
  titleOutput = output<string[]>();
  contentOutput = output<string[]>();
  @ViewChild('editor') editor!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('inputName') inputName!: ElementRef<HTMLInputElement>;
  MAX_LENGTH: number = 2000;
  notepadPath: string = '/Notepad.png';
  title: string = '';
  defaultTitle = 'Sans titre';
  text: string = '';
  isTextChanged: boolean = false;
  isFileOpen: boolean = false;
  isViewOpen: boolean = false;
  fontSize: number = 14;
  defaultFontSize: number = 14;
  maxFontSize: number = 21;
  minFontSize: number = 11;
  isTextAlreadySaveAs: boolean = false;
  showSavePanel: boolean = false;
  disableEditor: boolean = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const titleInput = this.titleInput();
    if (titleInput) {
      this.setTitle(titleInput);
    } else {
      this.setTitle(this.defaultTitle);
    }

    const contentInput = this.contentInput();
    if (contentInput !== undefined) {
      this.text = contentInput;
      this.isTextAlreadySaveAs = true;
    }
  }

  ngAfterViewInit() {
    const el: HTMLTextAreaElement = this.editor?.nativeElement;
    if (el) {
      el.value = this.text;
    }
    this.fontSize = this.defaultFontSize;
  }

  onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (!this.isTextAlreadySaveAs) {
        this.showSavePanel = true;
      } else {
        this.saveEditor();
        const id = this.id();
        if (id) this.contentOutput.emit([id, this.text]);
      }
    }
  }

  saveEditor() {
    this.isTextChanged = false;
    this.text = this.sanitizer.sanitize(SecurityContext.HTML, this.text) || '';
    this.text = this.decodeHtmlEntities(this.text);
  }

  //sanitizing text change some char like é -> &#233, the decoding undo this
  decodeHtmlEntities(text: string): string {
    return text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  }

  // used just for setup of notepad
  setEditor(text: string) {
    if (text.length > this.MAX_LENGTH) return;
    this.text = this.sanitizer.sanitize(SecurityContext.HTML, text) || '';
  }

  setTitle(title: string) {
    if (title.length > 10) return;
    this.title = this.sanitizer.sanitize(SecurityContext.HTML, title) || this.title;
  }

  textChanged(e: any) {
    this.isTextChanged = true;
  }

  clickOnFile() {
    this.isFileOpen = true;
    this.isViewOpen = false;
  }

  clickPanelSave() {
    if (!this.isTextAlreadySaveAs) {
      this.clickPanelSaveAs();
    }
    this.saveEditor();
  }

  clickPanelSaveAs() {
    this.showSavePanel = true;
    this.isFileOpen = false;
    this.disableEditor = true;
  }

  clickOnView() {
    this.isViewOpen = true;
    this.isFileOpen = false;
  }

  onEditorFocus() {
    this.isFileOpen = false;
    this.isViewOpen = false;
  }

  zoomIn() {
    if (this.fontSize > this.maxFontSize) return;
    this.fontSize++;
  }

  zoomOut() {
    if (this.fontSize < this.minFontSize) return;
    this.fontSize--;
  }

  resetZoom() {
    this.fontSize = this.defaultFontSize;
    this.isViewOpen = false;
  }

  clickButtonCancelSaveAs() {
    this.showSavePanel = false;
    this.disableEditor = false;
  }

  clickButtonSaveAs() {
    const el: HTMLInputElement = this.inputName?.nativeElement;
    if (!this.checkInputValidity(el)) {
      el.style.border = 'solid red 1px';
      return;
    }

    this.showSavePanel = false;
    this.disableEditor = false;
    this.saveEditor();
    this.isTextAlreadySaveAs = true;

    //title
    const newTitle = this.sanitizer.sanitize(SecurityContext.HTML, el.value) || this.defaultTitle;
    this.setTitle(newTitle);
    const id = this.id();
    if (id) this.titleOutput.emit([id, this.title]);

    if (id) this.contentOutput.emit([id, this.text]);
  }

  checkInputValidity(input: HTMLInputElement): boolean {
    if (input) {
      const length = input.value.length;
      if (length > 0 && length < 11) return true;
    }
    return false;
  }
}
