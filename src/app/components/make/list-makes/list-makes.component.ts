import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Make } from '../make';
import { MakeService } from '../make.service';

import { MakeComponent } from '../make/make.component';
import { ImportComponent } from '../../import/import.component';

@Component({
  selector: 'app-list-makes',
  templateUrl: './list-makes.component.html',
  styleUrls: ['./list-makes.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListMakesComponent implements OnInit {

  public makes: Make[] = new Array();
  public areMakesEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Make> = new EventEmitter<Make>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _makeService: MakeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getMakes();
  }

  public getMakes(): void {

    this.loading = true;

    this._makeService.getMakes().subscribe(
      result => {
        if (!result.makes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.makes = new Array();
          this.areMakesEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.makes = result.makes;
          this.totalItems = this.makes.length;
          this.areMakesEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getMakes();
  }

  public openModal(op: string, make: Make): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(MakeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.makeId = make._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "view";
        break;
      case 'add':
        modalRef = this._modalService.open(MakeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = "add";
        modalRef.result.then((result) => {
          this.getMakes();
        }, (reason) => {
          this.getMakes();
        });
        break;
      case 'update':
        modalRef = this._modalService.open(MakeComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.makeId = make._id;
        modalRef.componentInstance.readonly = false;
        modalRef.componentInstance.operation = "update"
        modalRef.result.then((result) => {
          this.getMakes();
        }, (reason) => {
          this.getMakes();
        });
        break;
      case 'delete':
        modalRef = this._modalService.open(MakeComponent, { size: 'lg', backdrop: 'static' })
        modalRef.componentInstance.makeId = make._id;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = "delete"
        modalRef.result.then((result) => {
          this.getMakes();
        }, (reason) => {
          this.getMakes();
        });
        break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
        let model: any = new Make();
        model.model = "make";
        model.primaryKey = "description";
        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          if (result === 'import_close') {
            this.getMakes();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public addItem(makeSelected) {
    this.eventAddItem.emit(makeSelected);
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
