import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionMovement, Movements } from '../../models/transaction-type'
import { Transaction, TransactionState } from '../../models/transaction'

//service
import { CancellationTypeService } from "../../services/cancellation-type.service"
import { TransactionService } from "../../services/transaction.service";
import { MovementOfArticleService } from "../../services/movement-of-article.service"

import { CancellationType } from 'app/models/cancellation-type';
import { CompanyService } from 'app/services/company.service';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { MovementOfCashService } from 'app/services/movement-of-cash.service';
import { MovementOfCancellationService } from 'app/services/movement-of-cancellation.service';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';
import { ArticleFields } from 'app/models/article-fields';
import { ArticleFieldType } from 'app/models/article-field';
import { Taxes } from 'app/models/taxes';
import { Config } from 'app/app.config';
import { MovementOfCancellation } from 'app/models/movement-of-cancellation';
import { Router } from '@angular/router';
import { TaxBase } from 'app/models/tax';

@Component({
  selector: 'app-movement-of-cancellation',
  templateUrl: './movement-of-cancellation.component.html',
  styleUrls: ['./movement-of-cancellation.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MovementOfCancellationComponent implements OnInit {

  @Input() transactionDestinationId: string;
  @Input() transactionDestinationViewId: string;
  @Input() transactionOriginViewId : string;
  @Input() totalPrice: number = 0;
  @Input() selectionView: boolean = false;
  public transactionDestination: Transaction;
  public transactionMovement: TransactionMovement;
  public movementsOfCancellations: MovementOfCancellation[];
  public transactions: Transaction[];
  public cancellationTypes : CancellationType[];
  public alertMessage: string = '';
  public loading: boolean = false;
  public totalItems: number = -1;
  public orderTerm: string[] = ['endDate'];
  public existingCanceled = [];
  public displayedColumns = [
    '_id',
    'endDate',
    'number',
    'letter',
    'state',
    'totalPrice',
    'balance',
    'operationType',
    'type.name',
    'type._id',
    'type.requestArticles',
    'company._id'
  ];
  public filters: any[];
  public filterValue: string;
  public roundNumber = new RoundNumberPipe();
  public userCountry: string;
  public balanceSelected: number = 0;
  public userType: string;

  constructor(
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _cancellationTypeService : CancellationTypeService,
    public _movementOfCancellation : MovementOfCancellationService,
    public _transactionService : TransactionService,
    public _companyService: CompanyService,
    public _modalService: NgbModal,
    public _movementOfCashService : MovementOfCashService,
    public _movementOfArticleService : MovementOfArticleService,
    public _movementOfCancellationService: MovementOfCancellationService,
    public _router: Router,
  ) {
    this.userCountry = Config.country;
    const pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
    this.existingCanceled = new Array();
    this.transactions = new Array();
    this.movementsOfCancellations = new Array();
  }

  async ngOnInit() {
    if(this.transactionDestinationViewId || this.transactionOriginViewId) {
      this.getCancellationsOfMovements();
    } else {
      this.transactionDestination = await this.getTransaction(this.transactionDestinationId);
      if(this.transactionDestination) {
        this.getCancellationTypes();
      }
    }
  }

  public getCancellationsOfMovements() {

    this.loading = true;

    let match;
    // FILTRAMOS LA CONSULTA
    if(this.transactionOriginViewId) {
      match = { "transactionOrigin": { $oid: this.transactionOriginViewId} , "operationType": { "$ne": "D" }, "balance": { $gt: 0 } };
    } else {
      match = { "transactionDestination": { $oid: this.transactionDestinationViewId} , "operationType": { "$ne": "D" }, "balance": { $gt: 0 }  };
    }

    // CAMPOS A TRAER
    let project = {
      "balance": 1,
      "transactionOrigin": 1,
      "transactionDestination": 1,
      "operationType" : 1
    };

    this._movementOfCancellation.getMovementsOfCancellations(
      project, // PROJECT
      match, // MATCH
      { order: 1 }, // SORT
      {}, // GROUP
      0, // LIMIT
      0 // SKIP
    ).subscribe(async result => {
      if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
        for (let index = 0; index < result.movementsOfCancellations.length; index++) {
          let transaction = new Transaction;
          if(this.transactionOriginViewId) {
            transaction = await this.getTransaction(result.movementsOfCancellations[index].transactionDestination)
          } else {
            transaction = await this.getTransaction(result.movementsOfCancellations[index].transactionOrigin)
          }
          if(transaction) {
            this.transactions.push(transaction);
          } else {
            this.showMessage("No se encontraron transactiones relacionadas", 'danger', false);
            this.totalItems = 0;
            this.loading = false;
          }
        }
      } else {
        this.showMessage("No se encontraron transactiones relacionadas", 'danger', false);
        this.totalItems = 0;
        this.loading = false;
      }
      this.loading = false;
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.totalItems = 0;
      this.loading = false;
    });
  }

  public getTransaction(transactionId: string): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this.loading = true;

      this._transactionService.getTransaction(transactionId).subscribe(
        result => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            this.totalItems = 0;
            this.loading = false;
            resolve(null);
          } else {
            this.hideMessage();
            this.loading = false;
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.totalItems = 0;
          this.loading = false;
          resolve(null);
        }
      );
    });
  }

  public getCancellationTypes() : void {

    this.loading = true;

    // CAMPOS A TRAER
    let project = {
      "origin._id": 1,
      "destination._id": 1,
      "operationType" : 1,
      "modifyBalance" : 1
    };

    this._cancellationTypeService.getCancellationTypes(
      project, // PROJECT
      { "destination._id": { $oid: this.transactionDestination.type._id} , "operationType": { "$ne": "D" } }, // MATCH
      {}, // SORT
      {}, // GROUP
      0, // LIMIT
      0 // SKIP
    ).subscribe(result => {
      if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
        this.cancellationTypes = result.cancellationTypes;
        this.getTransactions();
      } else {
        this.totalItems = 0;
      }
      this.loading = false;
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.totalItems = 0;
      this.loading = false;
    });
  }

  async getTransactions() {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA
    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        match += ',';
      }
    }

    if(this.cancellationTypes && this.cancellationTypes.length != 0) {

      match += `"$or": [`
      for (let index = 0; index < this.cancellationTypes.length; index++) {
        match +=  `{ "type._id"  : "${this.cancellationTypes[index].origin._id}"}`;
        if(index < this.cancellationTypes.length) {
          match += ','
        }
      }

      match = match.slice(0, -1);

      match += `],`
    } else {
      match +=  `{ "type._id"  : "${this.cancellationTypes[0].origin._id}"}`
    }

    match += `"operationType": { "$ne": "D" } , "state" : "Cerrado" , "company._id":  "${this.transactionDestination.company._id}", "balance": { "$gt": 0 } }`;

    match = JSON.parse(match);

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      _id: 1,
      endDate: { $dateToString: { date: '$endDate', format: '%d/%m/%Y', timezone: timezone }},
      number: { $toString : '$number' },
      letter: 1,
      state: 1,
      totalPrice: { $toString : '$totalPrice' },
      balance: 1,
      balanceSelected: '$balance',
      operationType: 1,
      'company._id': { $toString : '$company._id' },
      'type._id': { $toString : '$type._id' },
      'type.name': 1,
      'type.requestArticles': 1,
      'type.movement': 1,
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        transactions: { $push: "$$ROOT" }
    };

    this._transactionService.getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      async result => {
        this.loading = false;
        if (result && result.length > 0 && result[0].transactions) {
            this.transactions = result[0].transactions;
            this.totalItems = result[0].count;
            if(this.transactions.length > 0) {
              if(this.totalPrice > 0 && this.balanceSelected === 0) {
                await this.getMovementsOfCancellations().then(
                  movementsOfCancellations => {
                    if(movementsOfCancellations && movementsOfCancellations.length > 0) {
                      this.movementsOfCancellations = movementsOfCancellations;
                      for(let transaction of this.transactions) {
                        for(let mov of this.movementsOfCancellations) {
                          if(mov.transactionOrigin._id === transaction._id) {
                            transaction['balanceSelected'] = mov.balance;
                          }
                        }
                      }
                      for(let movementOfCancellation of this.movementsOfCancellations) {
                        if(this.transactionDestination.state !== TransactionState.Closed) {
                          if((movementOfCancellation.transactionOrigin.type.transactionMovement === TransactionMovement.Sale && 
                            movementOfCancellation.transactionOrigin.type.movement === Movements.Outflows) || 
                            (movementOfCancellation.transactionOrigin.type.transactionMovement === TransactionMovement.Purchase && 
                              movementOfCancellation.transactionOrigin.type.movement === Movements.Inflows)) {
                            this.balanceSelected -= movementOfCancellation.balance;
                          } else {
                            this.balanceSelected += movementOfCancellation.balance;
                          }
                        }
                        for(let transaction of this.transactions) {
                          if(movementOfCancellation.transactionOrigin._id.toString() === transaction._id.toString()) {
                            transaction.balance = movementOfCancellation.balance;
                          }
                        }
                      }
                    }
                  }
                );

                if(this.balanceSelected === 0) {
                  this.selectAutomatically();
                }
              }
            }
        } else {
            this.transactions = new Array();
            this.totalItems = 0;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public getMovementsOfCancellations(): Promise<MovementOfCancellation[]> {

    return new Promise<MovementOfCancellation[]>((resolve, reject) => {

      // CAMPOS A TRAER
      let project = {
        "_id": 0,
        "transactionOrigin._id": 1,
        "transactionDestination._id": 1,
        "balance" : 1,
        "operationType": 1,
        'transactionOrigin.type.name': 1,
        'transactionOrigin.number': 1,
        'transactionOrigin.operationType': 1,
        'transactionOrigin.balance': 1
      };

      this._movementOfCancellationService.getMovementsOfCancellations(
        project, // PROJECT
        { "transactionDestination._id": { $oid: this.transactionDestination._id}, "operationType": { "$ne": "D" }, "transactionOrigin.operationType": { "$ne": "D" } }, // MATCH
        { }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(result => {
        if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
          resolve(result.movementsOfCancellations);
        } else {
          resolve(null);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        resolve(null);
      });
    });
  }

  async selectAutomatically() {

    let amountSelected: number = 0;

    if(this.totalPrice > 0) {
      for(let transaction of this.transactions) {
        if(this.totalPrice > (transaction.balance + amountSelected)) {
          await this.selectTransaction(transaction, true);
          amountSelected += transaction.balance;
        } else {
          if(this.totalPrice > this.balanceSelected) {
            let movementOfCancellation = new MovementOfCancellation();
            movementOfCancellation.transactionOrigin = transaction;
            movementOfCancellation.transactionDestination = this.transactionDestination;
            if((this.totalPrice - this.balanceSelected) > transaction.balance) {
              movementOfCancellation.balance = transaction.balance;
            } else {
              movementOfCancellation.balance = this.roundNumber.transform(this.totalPrice - this.balanceSelected);
            }
            if((transaction.type.transactionMovement === TransactionMovement.Sale && 
              transaction.type.movement === Movements.Outflows) || 
              (transaction.type.transactionMovement === TransactionMovement.Purchase && 
                transaction.type.movement === Movements.Inflows)) {
              this.balanceSelected -= movementOfCancellation.balance;
            } else {
              this.balanceSelected += movementOfCancellation.balance;
            }
            amountSelected += movementOfCancellation.balance;
            transaction.balance = movementOfCancellation.balance;
            transaction['balanceSelected'] = movementOfCancellation.balance;
            this.movementsOfCancellations.push(movementOfCancellation);
          }
        }
      }
    }
  }

  public orderBy(term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }

    this.getTransactions();
  }

  public openModal(op: string, transaction: Transaction): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = transaction._id;
        break;
    }
  }

  async selectTransaction(transactionSelected: Transaction, automatic: boolean = false) {

    transactionSelected = await this.getTransaction(transactionSelected._id);

    if(this.isTransactionSelected(transactionSelected)) {
      if(!automatic) this.deleteTransactionSelected(transactionSelected);
    } else {
      let movementOfCancellation = new MovementOfCancellation();
      movementOfCancellation.transactionOrigin = transactionSelected;
      movementOfCancellation.transactionDestination = this.transactionDestination;
      if(this.modifyBalance(transactionSelected)) {
        movementOfCancellation.balance = transactionSelected.balance;
      } else {
        movementOfCancellation.balance = 0;
      }
      if((movementOfCancellation.transactionOrigin.type.transactionMovement === TransactionMovement.Sale && 
        movementOfCancellation.transactionOrigin.type.movement === Movements.Outflows) || 
        (movementOfCancellation.transactionOrigin.type.transactionMovement === TransactionMovement.Purchase && 
          movementOfCancellation.transactionOrigin.type.movement === Movements.Inflows)) {
        this.balanceSelected -= transactionSelected.balance;
      } else {
        this.balanceSelected += transactionSelected.balance;
      }
      this.movementsOfCancellations.push(movementOfCancellation);
    }
  }

  public modifyBalance(transaction: Transaction) {
  
    let modify: boolean = false;

    for(let canc of this.cancellationTypes) {
      if(canc.origin._id.toString() === transaction.type._id) {
        modify = canc.modifyBalance;    
      }
    }

    return modify;
  }

  public deleteTransactionSelected(transaction: Transaction): void {

    let movementToDelete: number;

    for(let i=0; i < this.movementsOfCancellations.length; i++) {
      if(this.movementsOfCancellations[i].transactionOrigin._id.toString() === transaction._id.toString()) {
        movementToDelete = i;
      }
    }
    if(movementToDelete !== undefined) {
      this.balanceSelected -= this.movementsOfCancellations[movementToDelete].balance;
      this.movementsOfCancellations.splice(movementToDelete, 1);
    }

    if(this.balanceSelected < 0) {
      this.balanceSelected = 0;
    }
  }

  public isTransactionSelected(transaction: Transaction) {

    let isSelected: boolean = false;

    if(this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
      for(let mov of this.movementsOfCancellations) {
        if(mov.transactionOrigin._id.toString() === transaction._id.toString()) {
          isSelected = true;
        }
      }
    }

    return isSelected;
  }

  async finish() {

    let endedProcess = true;

    if(this.balanceSelected >= 0) {
      if(this.movementsOfCancellations.length > 0) {
        for(let mov of this.movementsOfCancellations) {
          if(mov.balance > 0 || !this.modifyBalance(mov.transactionOrigin)) {
            if((mov.balance <= mov.transactionOrigin.balance) || !this.modifyBalance(mov.transactionOrigin)) {
                if(mov.transactionDestination.type && mov.transactionDestination.type.requestArticles) {
                  await this.getMovementOfArticles(mov.transactionOrigin).then(
                    async movementsOfArticles => {
                      if(movementsOfArticles && movementsOfArticles.length > 0) {
                        await this.saveMovementsOfArticles(movementsOfArticles).then(
                          movementsOfArticlesSaved => {
                            if(movementsOfArticlesSaved && movementsOfArticlesSaved.length > 0) {
                            } else {
                              endedProcess = false;
                            }
                          }
                        );
                      }
                    }
                  );
                }
            } else {
              endedProcess = false;
              this.showMessage("El saldo ingresado en la transacción " + mov.transactionOrigin.type.name + " " + mov.transactionOrigin.number + " no puede ser mayor que el saldo restante de la misma.", "info", true);
            }
          } else {
            endedProcess = false;
            this.showMessage("El saldo ingresado en la transacción " + mov.transactionOrigin.type.name + " " + mov.transactionOrigin.number + " debe ser mayor a 0.", "info", true);
          }
        }
        if(endedProcess) {
          this.closeModal();
        }
      } else {
        this.closeModal();
      }
    } else {
      endedProcess = false;
      this.showMessage("El saldo seleccionado debe ser mayor o igual a 0.", "info", true);
    }
  }

  public getMovementOfArticles(transaction : Transaction): Promise<MovementOfArticle[]> {

    return new Promise((resolve, reject) => {

      let query = 'where="transaction":"'+transaction._id+'"';

      this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
        result => {
          if (!result.movementsOfArticles) {
            resolve(null);
          } else {
            let movements: MovementOfArticle[] = new Array();
            for (let mov of result.movementsOfArticles) {
              let movementOfArticle = new MovementOfArticle();

              movementOfArticle.code = mov.code;
              movementOfArticle.codeSAT = mov.codeSAT;
              movementOfArticle.description = mov.description;
              movementOfArticle.observation = mov.observation;
              movementOfArticle.otherFields = mov.otherFields;
              if(mov.make && mov.make._id && mov.make._id !== "") {
                movementOfArticle.make = mov.make._id;
              } else {
                movementOfArticle.make = mov.make;
              }
              if(mov.category && mov.category._id && mov.category._id !== "") {
                movementOfArticle.category = mov.category._id;
              } else {
                movementOfArticle.category = mov.category;
              }
              movementOfArticle.amount = mov.amount;
              movementOfArticle.quantityForStock = mov.quantityForStock;
              movementOfArticle.barcode = mov.barcode;
              movementOfArticle.notes = mov.notes;
              movementOfArticle.printed = mov.printed;
              movementOfArticle.printIn = mov.printIn;
              movementOfArticle.article = mov.article;
              movementOfArticle.transaction = new Transaction();
              movementOfArticle.transaction._id = this.transactionDestination._id;
              movementOfArticle.modifyStock = this.transactionDestination.type.modifyStock;
              if(this.transactionDestination.type.stockMovement) {
                movementOfArticle.stockMovement = this.transactionDestination.type.stockMovement.toString();
              }

              movementOfArticle.measure = mov.measure;
              movementOfArticle.quantityMeasure = mov.quantityMeasure;

              movementOfArticle.basePrice = mov.basePrice;

              if (this.transactionDestination.type.requestTaxes && !transaction.type.requestTaxes) {
        
                movementOfArticle.costPrice = mov.costPrice;
                movementOfArticle.salePrice = mov.salePrice;
                let taxes: Taxes[] = new Array();
                if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
                  for (let taxAux of movementOfArticle.article.taxes) {
                    let tax: Taxes = new Taxes();
                    tax.percentage = this.roundNumber.transform(taxAux.percentage);
                    tax.tax = taxAux.tax;
                    if(tax.tax.taxBase == TaxBase.Neto) {
                      tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice);
                    }
                    if(tax.percentage === 0) {
                      tax.taxAmount = this.roundNumber.transform(tax.taxAmount * movementOfArticle.amount);
                    } else {
                      tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
                    }
                    movementOfArticle.salePrice += tax.taxAmount;
                    taxes.push(tax);
                  }
                }
                movementOfArticle.taxes = taxes;

                movementOfArticle.unitPrice = movementOfArticle.salePrice / movementOfArticle.amount;
                movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
                movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);
                movementOfArticle.roundingAmount = mov.roundingAmount;
              } else {
                if(this.transactionDestination.type.requestTaxes && transaction.type.requestTaxes) {
                  movementOfArticle.taxes = mov.taxes;
                }
                movementOfArticle.costPrice = mov.costPrice;
                movementOfArticle.unitPrice = mov.unitPrice;
                movementOfArticle.markupPercentage = mov.markupPercentage;
                movementOfArticle.markupPrice = mov.markupPrice;
                movementOfArticle.salePrice = mov.salePrice;
                movementOfArticle.roundingAmount = mov.roundingAmount;
              }
              if (this.transactionDestination.type.transactionMovement === TransactionMovement.Sale) {
                movementOfArticle = this.recalculateSalePrice(movementOfArticle);
              } else {
                movementOfArticle = this.recalculateCostPrice(movementOfArticle);
              }
              movements.push(movementOfArticle);
            }
            resolve(movements);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;

    if(this.transactionDestination.quotation) {
      quotation = movementOfArticle.transaction.quotation;
    }

    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.00;
    movementOfArticle.markupPercentage = 0.00;

    let taxedAmount = movementOfArticle.basePrice;
    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();
    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) { 
          if (field.articleField.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
          } else if (field.articleField.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
          if (field.articleField.modifyVAT) {
            taxedAmount += field.amount;
          } else {
            movementOfArticle.costPrice += field.amount;
          }
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;
    if (this.transactionDestination.type.requestTaxes) {
      if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
        let taxes: Taxes[] = new Array();
        for (let articleTax of movementOfArticle.taxes) {
          if(articleTax.tax.taxBase === TaxBase.Neto) {
            articleTax.taxBase = taxedAmount;
          } else {
            articleTax.taxBase = 0;
          }
          if(articleTax.percentage === 0) {
            for (let artTax of movementOfArticle.article.taxes) {
              if(artTax.tax._id === articleTax.tax._id) {
                articleTax.taxAmount = this.roundNumber.transform(artTax.taxAmount * movementOfArticle.amount);
              }
            }
          } else {
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
          }
          taxes.push(articleTax);
          movementOfArticle.costPrice += articleTax.taxAmount;
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice = movementOfArticle.costPrice + movementOfArticle.roundingAmount;

    return movementOfArticle;
  }

  // EL IMPUESTO VA SOBRE EL ARTICULO Y NO SOBRE EL MOVIMIENTO
  public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;
    if(this.transactionDestination.quotation) {
      quotation = this.transactionDestination.quotation;
    }

    if (movementOfArticle.article) {

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);

      if( movementOfArticle.article.currency &&
        Config.currency &&
        Config.currency._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
      }
    }

    let fields: ArticleFields[] = new Array();
    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) { 
          if (field.articleField.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
          } else if (field.articleField.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;

    if (movementOfArticle.article) {
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);

      if( movementOfArticle.article.currency &&
        Config.currency &&
        Config.currency._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
      }
    }

    // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
    movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
    movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);

    if (this.transactionDestination.type.requestTaxes) {
      let taxes: Taxes[] = new Array();
      if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
        let impInt: number = 0;
        for (let taxAux of movementOfArticle.article.taxes) {
          if(taxAux.percentage === 0) {
            impInt = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount);
          }
        }
        for (let taxAux of movementOfArticle.article.taxes) {
          let tax: Taxes = new Taxes();
          tax.percentage = this.roundNumber.transform(taxAux.percentage);
          tax.tax = taxAux.tax;
          if(tax.percentage === 0) {
            tax.taxAmount = impInt;
            tax.taxBase = 0;
          } else {
            tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice - impInt) / ((tax.percentage / 100) + 1));
            tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
          }
          taxes.push(tax);
        }
      }
      movementOfArticle.taxes = taxes;
    }

    return movementOfArticle;
  }

  public refresh(): void {
    this.getCancellationTypes();
  }

  public closeModal(): void {
    this.activeModal.close(
      {
        movementsOfCancellations: this.movementsOfCancellations
      }
    );
  }

  public updateBalanceOrigin(transaction: Transaction): void {

    if(transaction['balanceSelected'] <= transaction.balance) {
      this.balanceSelected = 0;
      for(let mov of this.movementsOfCancellations) {
        if(mov.transactionOrigin._id.toString() === transaction._id.toString()) {
          mov.balance = transaction['balanceSelected'];
        }
        if(mov.transactionOrigin.balance > 0) {
          if((mov.transactionOrigin.type.transactionMovement === TransactionMovement.Sale && 
            mov.transactionOrigin.type.movement === Movements.Outflows) || 
            (mov.transactionOrigin.type.transactionMovement === TransactionMovement.Purchase && 
              mov.transactionOrigin.type.movement === Movements.Inflows)) {
            this.balanceSelected -= mov.balance;
          } else {
            this.balanceSelected += mov.balance;
          }
        }
      }
    } else {
      this.showMessage(`El saldo ingresado no puede ser mayor al saldo de la transacción (${transaction.balance}).`, 'info', true);
      transaction['balanceSelected'] = transaction.balance;
    }
  }

  public saveMovementsOfArticles(movemenstOfarticles: MovementOfArticle[]): Promise<MovementOfArticle[]> {

    return new Promise((resolve, reject) => {

      this._movementOfArticleService.saveMovementsOfArticles(movemenstOfarticles).subscribe(
        result => {
          if (!result.movementsOfArticles) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfArticles);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
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
