import { Component, Input, EventEmitter } from '@angular/core';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Transaction } from '../transaction';
import { TransactionService } from '../transaction.service';
import { MovementOfArticleService } from '../../movement-of-article/movement-of-article.service';

@Component({
  selector: "app-delete-transaction",
  templateUrl: "./delete-transaction.component.html",
  styleUrls: ["./delete-transaction.component.css"],
  providers: [NgbAlertConfig]
})
export class DeleteTransactionComponent {

  public transaction: Transaction;
  @Input() transactionId: string;
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _transactionService: TransactionService,
    public _movementOfArticle: MovementOfArticleService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    alertConfig.type = "danger";
    alertConfig.dismissible = true;
    this.transaction = new Transaction();
  }

  public ngOnInit(): void {
    if(this.transactionId) {
      this.getTransaction();
    }
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public getTransaction(): void {

    this.loading = true;

    this._transactionService.getTransaction(this.transactionId).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, 'danger', false);
        } else {
          this.hideMessage();
          this.transaction = result.transaction;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteTransaction(): void {

    this.loading = true;

    if (!this.transaction.CAE &&
      !this.transaction.SATStamp &&
      !this.transaction.stringSAT &&
      !this.transaction.CFDStamp) {
      this._transactionService.deleteTransaction(this.transaction._id).subscribe(
        result => {
          this.activeModal.close("delete_close");
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
    } else {
      this.showMessage('No se puede eliminar una transacción electrónica ya validada.', 'info', true);
    }
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
