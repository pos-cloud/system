//Paquetes Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { CurrentAcount, Movements } from './../../models/transaction-type';
import { Company } from './../../models/company';
import { MovementOfCash } from './../../models/movement-of-cash';

//Services
import { CompanyService } from './../../services/company.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { MovementOfCashService } from './../../services/movement-of-cash.service';

//Componentes
import { AddTransactionComponent } from './../add-transaction/add-transaction.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { ListCompaniesComponent } from 'app/components/list-companies/list-companies.component';
import { PrintComponent } from 'app/components/print/print.component';
import { PrinterService } from '../../services/printer.service';
import { Printer, PrinterPrintIn } from '../../models/printer';

@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.css'],
  providers: [NgbAlertConfig]
})

export class CurrentAccountComponent implements OnInit {

  public transactions: Transaction[];
  public companySelected: Company;
  public movementsOfCashes: MovementOfCash[];
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public orderTerm: string[] = ['-endDate'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public balance: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;
  public printers: Printer[];

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfCashService: MovementOfCashService,
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
  ) {
    this.movementsOfCashes = new Array();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.printers = new Array();
    this.openModal('company');
    this.getPrinters();
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
        } else {
          this.hideMessage();
          this.printers = result.printers;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransactionsByCompany(): void {

    this.loading = true;

    if (this.companySelected) {
      this._transactionService.getTransactionsByCompany(this.companySelected._id).subscribe(
        result => {
          if (!result.transactions) {
            this.transactions = new Array();
            this.areTransactionsEmpty = true;
            this.balance = 0;
          } else {
            this.getMovementOfCurrentAccountByCompany(result.transactions);
            this.areTransactionsEmpty = false;
          }
          this.hideMessage();
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
          this.transactions = new Array();
          this.balance = 0;
        }
      );
    } else {
      this.showMessage("Debe seleccionar una empresa.", "info", true);
      this.loading = false;
    }
  }

  public getMovementOfCurrentAccountByCompany(transactions: Transaction[]): void {

    this.loading = true;

    if (this.companySelected) {

      this._movementOfCashService.getMovementOfCurrentAccountByCompany(this.companySelected._id).subscribe(
        result => {
          if (!result.movementsOfCashes) {
            this.hideMessage();
          } else {
            this.hideMessage();
            this.movementsOfCashes = result.movementsOfCashes;
            this.filterTransactions(transactions);
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
    } else {
      this.showMessage("Debe seleccionar una empresa.", "info", true);
      this.loading = false;
    }
  }

  public filterTransactions(transactions: Transaction[]): void {

    this.transactions = new Array();
    this.balance = 0;

    if (transactions.length > 0) {
      for (let transaction of transactions) {
        if (transaction.state === TransactionState.Closed &&
          transaction.company._id === this.companySelected._id &&
          transaction.type.currentAccount !== CurrentAcount.No) {
          if (transaction.type.currentAccount === CurrentAcount.Yes &&
            this.getPaymentMethodName(transaction) === "Cuenta Corriente") {
            this.transactions.push(transaction);
            if (transaction.type.movement === Movements.Outflows) {
              this.balance += transaction.totalPrice;
            } else {
              this.balance -= transaction.totalPrice;
            }
          } else if (transaction.type.currentAccount === CurrentAcount.Charge) {
            this.transactions.push(transaction);
            if (transaction.type.movement === Movements.Outflows) {
              this.balance -= transaction.totalPrice;
            } else {
              this.balance += transaction.totalPrice;
            }
          } else {
            //No se toma en cuenta el documento
          }
        } else {
          //No se toma en cuenta el documento
        }
      }
    }
    this.totalItems = this.transactions.length;

    if (this.totalItems <= 0) {
      this.areTransactionsEmpty = true;
    }
  }

  public getPaymentMethodName(transaction): string {

    let name: string = "";

    for (let movementOfCash of this.movementsOfCashes) {
      if (movementOfCash.transaction) {
        if (movementOfCash.transaction._id === transaction._id) {
          name = movementOfCash.type.name;
        }
      }
    }

    return name;
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

    if (this.companySelected) {
      this.getTransactionsByCompany();
    } else {
      this.showMessage("Debe seleccionar una empresa", "info", true);
    }
  }

  public openModal(op: string, transaction?: Transaction): void {

    let modalRef;
    switch (op) {
      case 'transaction':
        modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then(
          (result) => {
            if (typeof (result) === "object") {
              this.openModal('movement-of-cash', result);
            }
          }, (reason) => {

          }
        );
        break;
      case 'movement-of-cash':
        modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (typeof result == 'object') {
            if (result.amountPaid > transaction.totalPrice && result.type.name === "Tarjeta de Crédito") {
              transaction.totalPrice = result.amountPaid;
            }
            transaction.state = TransactionState.Closed;
            this.updateTransaction(transaction);
          }
        }, (reason) => {

        });
        break;
      case 'company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        let pathLocation: string[] = this._router.url.split('/');
        let companyType = pathLocation[3].charAt(0).toUpperCase() + pathLocation[3].slice(1);
        modalRef.componentInstance.type = companyType;
        modalRef.componentInstance.userType = 'pos';
        modalRef.result.then(
          (result) => {
            if (typeof (result) === "object") {
              this.companySelected = result;
              this.getTransactionsByCompany();
            }
          }, (reason) => {
          }
        );
        break;
      case 'print':
        if(this.companySelected) {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.transactions = this.transactions;
          modalRef.componentInstance.company = this.companySelected;
          modalRef.componentInstance.typePrint = 'current-account';
          modalRef.componentInstance.balance = this.balance;
          if(this.printers.length > 0) {
            for(let printer of this.printers) {
              if(printer.printIn === PrinterPrintIn.Counter) {
                modalRef.componentInstance.printer = printer;
              }
            }
          }
        } else {
          this.showMessage("Debe seleccionar una empresa","info", true);
        }
        break;
      default: ;
    }
  }

  public addTransaction(type: string): void {
    if (this.companySelected) {
      this.getTransactionTypeByName(type);
    } else {
      this.showMessage("Debe seleccionar una empresa", "info", true);
    }
  }

  public getTransactionTypeByName(name: string): void {

    this._transactionTypeService.getTransactionTypeByName(name).subscribe(
      result => {
        if (!result.transactionTypes) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          let transaction = new Transaction();
          transaction.company = this.companySelected;
          transaction.type = result.transactionTypes[0];
          this.openModal('transaction', transaction);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateTransaction(transaction: Transaction): void {

    this.loading = true;

    this._transactionService.updateTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.refresh();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}