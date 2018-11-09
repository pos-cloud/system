import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Room } from './../../models/room';
import { Printer, PrinterPrintIn } from './../../models/printer';
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType, TransactionMovement } from './../../models/transaction-type';

import { RoomService } from './../../services/room.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { PaymentMethodService } from './../../services/payment-method.service';
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';

import { AddTransactionComponent } from './../add-transaction/add-transaction.component';
import { PrintComponent } from './../print/print.component';
import { DeleteTransactionComponent } from './../delete-transaction/delete-transaction.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';
import { ListCompaniesComponent } from 'app/components/list-companies/list-companies.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';
import { CompanyType } from '../../models/company';
import { CashBoxComponent } from '../cash-box/cash-box.component';
import { EmployeeType } from 'app/models/employee-type';
import { EmployeeTypeService } from 'app/services/employee-type.service';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css'],
  providers: [NgbAlertConfig]
})

export class PointOfSaleComponent implements OnInit {

  public rooms: Room[] = new Array();
  public roomSelected: Room;
  public transactions: Transaction[] = new Array();
  public areTransactionsEmpty: boolean = true;
  public transactionTypes: TransactionType[];
  public transactionMovement: TransactionMovement;
  public userType: string;
  public propertyTerm: string;
  public orderTerm: string[] = ['startDate'];
  public posType: string;
  public existsCashBoxOpen: boolean = false;
  public alertMessage: string = '';
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public printers: Printer[];
  @ViewChild('contentPrinters') contentPrinters: ElementRef;

  constructor(
    public _turnService: TurnService,
    public _roomService: RoomService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _paymentMethodService: PaymentMethodService,
    public _printerService: PrinterService,
    public _employeeTypeService: EmployeeTypeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.roomSelected = new Room();
    this.transactionTypes = new Array();
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];

    this.getPrinters();

    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {
      this.getOpenTransactions();
    } else if (this.posType === "mostrador") {
      if (pathLocation[3] === "venta") {
        this.transactionMovement = TransactionMovement.Sale;
      } else if (pathLocation[3] === "compra") {
        this.transactionMovement = TransactionMovement.Purchase;
      } else if (pathLocation[3] === "stock") {
        this.transactionMovement = TransactionMovement.Stock;
      }
      this.getTransactionTypesByMovement();
      this.getOpenTransactionsByMovement(this.transactionMovement);
    } else {
      this._router.navigate(['/']);
    }
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
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getTransactionTypesByMovement(): void {

    this.loading = true;

    this._transactionTypeService.getTransactionTypesByMovement(this.transactionMovement).subscribe(
      result => {
        if (!result.transactionTypes) {
        } else {
          this.transactionTypes = result.transactionTypes;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getRooms(): void {

    this.loading = true;

    this._roomService.getRooms().subscribe(
        result => {
          if (!result.rooms) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.rooms = result.rooms;

            if (this.roomSelected._id === undefined){
              this.roomSelected = this.rooms[0];
            } else {
              for(let room of this.rooms) {
                if (this.roomSelected._id === room._id){
                  this.roomSelected = room;
                }
              }
            }
            this.existsCashBoxOpen = true;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getOpenTransactions(): void {

    this.loading = true;

    this._transactionService.getOpenTransaction(this.posType).subscribe(
      result => {
        if (!result.transactions) {
          this.hideMessage();
          this.transactions = null;
          this.areTransactionsEmpty = true;
        } else {
          this.hideMessage();
          this.transactions = result.transactions;
          this.totalItems = this.transactions.length;
          this.areTransactionsEmpty = false;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getOpenTransactionsByMovement(transactionMovement: TransactionMovement): void {

    this.loading = true;

    this._transactionService.getOpenTransactionsByMovement(transactionMovement, this.posType).subscribe(
      result => {
        if (!result.transactions) {
          this.loading = false;
          this.transactions = null;
          this.areTransactionsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.transactions = result.transactions;
          this.totalItems = this.transactions.length;
          this.areTransactionsEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    let pathLocation: string[] = this._router.url.split('/');
    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {
      this.getOpenTransactions();
    } else if (this.posType === "mostrador") {
      this.getOpenTransactionsByMovement(this.transactionMovement);
    }
  }

  public addSaleOrder(posType: string): void {
    this.getDefectOrder(posType);
  }

  public getDefectOrder(posType: string): void {

    this.loading = true;

    this._transactionTypeService.getDefectOrder().subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.transactionTypes = null;
        } else {
          this._router.navigate(['/pos/' + posType + '/agregar-transaccion/' + result.transactionTypes[0]._id]);
          this.hideMessage();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addTransaction(type: TransactionType): void {

    if (type.transactionMovement !== TransactionMovement.Purchase) {
      if (type.requestArticles) {
        if(type.requestEmployee) {
          this.openModal('select-employee', type, null, null, type.requestEmployee);
        } else {
          this._router.navigate(['/pos/' + this.posType + '/agregar-transaccion/' + type._id]);
        }
      } else {
        this.openModal('company', type);
      }
    } else {
      this.openModal('company', type);
    }
  }

  public openModal(
    op: string,
    typeTransaction?: TransactionType,
    transaction?: Transaction,
    printerSelected?: Printer,
    employeeType?: EmployeeType): void {

    let modalRef;

    switch (op) {
      case 'company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        if (typeTransaction.transactionMovement === TransactionMovement.Purchase) {
          modalRef.componentInstance.type = CompanyType.Provider;
        } else if (typeTransaction.transactionMovement === TransactionMovement.Sale) {
          modalRef.componentInstance.type = CompanyType.Client;
        }
        modalRef.result.then(
          (result) => {
            if (result.company) {
              if (!transaction) {
                transaction = new Transaction();
              }
              transaction.company = result.company;
              this.openModal('transaction', typeTransaction, transaction);
            }
          }, (reason) => {

          }
        );
        break;
      case 'transaction':
        modalRef = this._modalService.open(AddTransactionComponent , { size: 'lg' });
        transaction.type = typeTransaction;
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then(
          (result) => {
            transaction = result.transaction;
            if (transaction) {
              if (transaction.type && transaction.type.requestArticles) {
                this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
              } else if (transaction.type.requestPaymentMethods) {
                this.openModal('movement-of-cash', typeTransaction, transaction);
              } else {
                if (this.posType === "resto" || this.posType === "delivery") {
                  transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                  transaction.VATPeriod = moment().format('YYYYMM');
                }
                transaction.expirationDate = transaction.endDate;
                transaction.state = TransactionState.Closed;
                this.updateTransaction(transaction);
              }
            } else if (result === "change-company") {
              this.openModal('company', typeTransaction, transaction);
            }
          }, (reason) => {

          }
        );
        break;
      case 'movement-of-cash':
        modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result.movementsOfCashes) {
            if (this.posType === "resto" || this.posType === "delivery") {
              transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
              transaction.VATPeriod = moment().format('YYYYMM');
            }
            transaction.expirationDate = transaction.endDate;
            transaction.state = TransactionState.Closed;
            this.updateTransaction(transaction);
            if (transaction.type.printable) {
              if (transaction.type.defectPrinter) {
                this.openModal("print", transaction.type, transaction, transaction.type.defectPrinter);
              } else {
                this.openModal("printers", transaction.type, transaction);
              }
            }
          } else {
            if (this.posType === "delivery") {
              this.getOpenTransactions();
            } else {
              this.getOpenTransactionsByMovement(this.transactionMovement);
            }
          }
        }, (reason) => {
          if (this.posType === "delivery") {
            this.getOpenTransactions();
          } else {
            this.getOpenTransactionsByMovement(this.transactionMovement);
          }
        });
        break;
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transaction = transaction;
        modalRef.componentInstance.company = transaction.company;
        modalRef.componentInstance.printer = printerSelected;
        modalRef.componentInstance.typePrint = 'cobro';
        modalRef.result.then((result) => {
        }, (reason) => {
        });
        break;
      case 'printers':
        if (this.countPrinters() > 1) {
          modalRef = this._modalService.open(this.contentPrinters, { size: 'lg' }).result.then((result) => {
            if (result !== "cancel" && result !== '') {
              this.openModal("print", transaction.type, transaction, result);
            }
          }, (reason) => {

          });
        } else if (this.countPrinters() === 1) {
          this.openModal("print", transaction.type, transaction, this.printers[0]);
        }
        break;
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        break;
      case 'cancel-transaction':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result === "delete_close") {
            this.refresh();
          }
        }, (reason) => {

        });
        break;
      case 'open-turn':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.typeEmployee = employeeType;
        modalRef.componentInstance.op = 'open-turn';
        modalRef.result.then((result) => {
          if (result.turn) {
            this.showMessage("El turno se ha abierto correctamente", 'success', true);
          }
        }, (reason) => {

        });
        break;
      case 'close-turn':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.typeEmployee = employeeType;
        modalRef.componentInstance.op = 'close-turn';
        modalRef.result.then((result) => {
          if (result.turn) {
            this.showMessage("El turno se ha cerrado correctamente", 'success', true);
          }
        }, (reason) => {

        });
        break;
      case 'open-cash-box':
        modalRef = this._modalService.open(CashBoxComponent, { size: 'lg' });
        modalRef.componentInstance.op = "open";
        modalRef.result.then((result) => {
          if (result && result.cashBox) {
            this.showMessage("La caja se ha abierto correctamente", 'success', true);
          } else {
            this.hideMessage();
          }
        }, (reason) => {
          this.hideMessage();
        });
        break;
      case 'cash-box':
        modalRef = this._modalService.open(CashBoxComponent, { size: 'lg' });
        modalRef.componentInstance.op = "close";
        modalRef.result.then((result) => {
          if (result && result.cashBox) {
            this.showMessage("La caja se ha cerrado correctamente", 'success', true);
          } else {
            this.hideMessage();
          }
        }, (reason) => {
          this.hideMessage();
        });
        break;
      case 'select-employee':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.op = 'select-employee';
        modalRef.componentInstance.typeEmployee = employeeType;
        modalRef.result.then((result) => {
          if (result.employee) {
            if(this.posType === "delivery") {
              transaction.state = TransactionState.Sent;
            }

            if(transaction) {
              transaction.employeeOpening = result.employee;
              this.updateTransaction(transaction);
            } else {
              transaction = new Transaction();
              transaction.type = typeTransaction;
              transaction.employeeOpening = result.employee;
              this.getLastTransactionByType(transaction);
            }
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  }

  public getLastTransactionByType(transaction: Transaction): void {

    this.loading = true;

    this._transactionService.getLastTransactionByTypeAndOrigin(transaction.type, 0, transaction.letter).subscribe(
      result => {
        if (!result.transactions) {
          transaction.origin = 0;
          transaction.number = 1;
          this.saveTransaction(transaction);
        } else {
          transaction.origin = result.transactions[0].origin;
          transaction.number = result.transactions[0].number + 1;
          this.saveTransaction(transaction);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveTransaction(transaction: Transaction): void {

    this.loading = true;
    transaction.madein = this.posType;

    this._transactionService.saveTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          transaction = result.transaction;
          if (transaction.type.transactionMovement !== TransactionMovement.Purchase) {
            if (transaction.type.requestArticles) {
              this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
            } else {
              this.openModal('company', transaction.type);
            }
          } else {
            this.openModal('company', transaction.type);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public countPrinters(): number {

    let numberOfPrinters: number = 0;
    let printersAux = new Array();

    if (this.printers && this.printers.length > 0) {
      for (let printer of this.printers) {
        if (printer.printIn === PrinterPrintIn.Counter) {
          printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    this.printers = printersAux;

    return numberOfPrinters;
  }

  public openTransaction(transaction: Transaction): void {

    if (transaction.type && transaction.type.transactionMovement !== TransactionMovement.Purchase) {
      if (transaction.type.requestArticles) {
        this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
      } else {
        this.openModal('transaction', transaction.type, transaction);
      }
    } else {
      this.openModal('transaction', transaction.type, transaction);
    }
  }

  public updateTransaction(transaction: Transaction): void {

    this.loading = true;

    this._transactionService.updateTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.refresh();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public changeStateOfTransaction(transaction: Transaction, state: string): void {

    this.loading = true;

    if (state === "Enviado") {
      if(transaction.type.requestEmployee) {
        this.openModal('select-employee', transaction.type, transaction, null, transaction.type.requestEmployee);
      } else {
        transaction.state = TransactionState.Sent;
      }
    } else if (state === "Entregado") {
      transaction.state = TransactionState.Delivered;
    }

    transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    transaction.VATPeriod = moment().format('YYYYMM');
    transaction.expirationDate = transaction.endDate;

    this.updateTransaction(transaction);
  }

  public getEmployeeType(op: string, employeeType: string, transaction?: Transaction): void {

    this.loading = true;

    let query = 'where="description":"' + employeeType + '"';

    this._employeeTypeService.getEmployeeTypes(query).subscribe(
      result => {
        if (!result.employeeTypes) {
          this.showMessage("No existen empleados de tipo Repartidor", "info", true);
        } else {
          this.hideMessage();
          if(transaction) {
            this.openModal(op, transaction.type, transaction, null, result.employeeTypes[0]);
          } else {
            this.openModal(op, null, null, null, result.employeeTypes[0]);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public changeRoom(room: Room): void {
    this.roomSelected = room;
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
