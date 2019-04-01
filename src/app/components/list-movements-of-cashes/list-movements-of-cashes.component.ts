import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { MovementOfCash } from './../../models/movement-of-cash';
import { MovementOfCashService } from './../../services/movement-of-cash.service';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';

@Component({
  selector: 'app-list-movement-of-cash',
  templateUrl: './list-movements-of-cashes.component.html',
  styleUrls: ['./list-movements-of-cashes.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListMovementOfCashesComponent implements OnInit {

  public movementsOfCashes: MovementOfCash[] = new Array();
  public areMovementOfCashesEmpty = true;
  public alertMessage = '';
  public userType: string;
  public orderTerm: string[] = ['-expirationDate'];
  public propertyTerm: string;
  public areFiltersVisible = false;
  public loading = false;
  @Output() eventAddItem: EventEmitter<MovementOfCash> = new EventEmitter<MovementOfCash>();
  public itemsPerPage = 10;
  public totalItems = 0;
  public transactionMovement: string;

  constructor(
    public _movementOfCashService: MovementOfCashService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.getMovementOfCashes();
  }

  public getMovementOfCashes(): void {

    this.loading = true;

    this._movementOfCashService.getMovementsOfCashesByMovement(this.transactionMovement).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          if (result.message && result.message !== '') {
            this.showMessage(result.message, 'info', true);
          }
          this.loading = false;
          this.movementsOfCashes = null;
          this.areMovementOfCashesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.movementsOfCashes = result.movementsOfCashes;
          this.totalItems = this.movementsOfCashes.length;
          this.areMovementOfCashesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getMovementOfCashes();
  }

  public openModal(op: string, movementOfCash: MovementOfCash): void {

    let modalRef;
    switch (op) {
      case 'view' :
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transactionId = movementOfCash.transaction._id;
        modalRef.componentInstance.readonly = true;
        break;
      default : ;
    }
  };

  public addItem(movementOfCashSelected) {
    this.eventAddItem.emit(movementOfCashSelected);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
