import { Component, EventEmitter, output, input, effect } from '@angular/core';
import { Loader } from '../../components/loader/loader';

@Component({
  selector: 'app-modal',
  imports: [Loader],
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="clickOnModalBackdrop()"></div>
    <div class="modal">
      @if (text() === '') {
        <app-loader />
      }
      @if (text() !== '') {
        <div class="modal-text">
          <p>{{ text() }}</p>
        </div>
        <div class="last-row">
          @if (!isLock()) {
            <div class="modal-button-container">
              <button class="modal-button green" (click)="closeModal.emit(true)">Valider</button>
            </div>
            <div class="modal-button-container">
              <button class="modal-button" (click)="closeModal.emit(false)">Annuler</button>
            </div>
          }
          @if (isLock()) {
            <div class="modal-button-container">
              <button class="modal-button" (click)="closeModal.emit(false)">Fermer</button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      p {
        font-family: 'Courier New', Courier, monospace;
      }
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
      }
      .modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        display: flex;
        flex-direction: column;
        width: 80%;
        max-width: 500px;
        padding: 25px;
        z-index: 1001;
      }
      .modal-text {
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .modal-text > p {
        text-align: center;
        color: black;
        font-size: 21px;
      }
      .last-row {
        display: flex;
        justify-content: center;
        margin-top: 30px;
      }
      .modal-button-container {
        width: 100%;
        display: flex;
        justify-content: center;
      }
      .modal-button {
        width: 125px;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        background-color: #5a6268;
        font-weight: bold;
      }
      .green {
        background-color: rgb(136, 211, 136);
      }
    `,
  ],
})
export class ModalComponent {
  text = input<string>();
  isLock = input<boolean>(false);
  closeModal = output<boolean>();

  clickOnModalBackdrop() {
    if (this.isLock()) return;
    this.closeModal.emit(false);
  }
}
