import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TransactionType, Movements, CurrentAcount, CodeAFIP, RequestArticles, DefectOrders, TransactionMovement, ModififyStock, StockMovement } from './../../models/transaction-type';
import { Room } from './../../models/room';
import { Printer } from './../../models/printer';

import { TransactionTypeService } from './../../services/transaction-type.service';
import { RoomService } from './../../services/room.service';
import { PrinterService } from './../../services/printer.service';

@Component({
  selector: 'app-add-transaction-type',
  templateUrl: './add-transaction-type.component.html',
  styleUrls: ['./add-transaction-type.component.css'],
  providers: [NgbAlertConfig]
})

export class AddTransactionTypeComponent implements OnInit {

  public transactionType: TransactionType;
  public transactionMovements: any[] = [TransactionMovement.Sale, TransactionMovement.Purchase, TransactionMovement.Stock];
  public transactionTypeForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public printers: Printer[];

  public formErrors = {
    'transactionMovement': '',
    'name': '',
    'labelPrint': '',
    'currentAccount': '',
    'modifyStock': '',
    'stockMovement': '',
    'requestArticles': '',
    'defectOrders': '',
    'fixedOrigin': '',
    'fixedLetter': '',
    'electronics': '',
    'codeA': '',
    'codeB': '',
    'codeC': '',
    'printable': '',
    'defectPrinter': '',
  };

  public validationMessages = {
    'transactionMovement': {
      'required': 'Este campo es requerido.',
    },
    'name': {
      'required': 'Este campo es requerido.',
    },
    'labelPrint': {
    },
    'currentAccount': {
      'required': 'Este campo es requerido.',
    },
    'movement': {
    },
    'modifyStock': {
    },
    'stockMovement': {
    },
    'requestArticles': {
      'required': 'Este campo es requerido.',
    },
    'defectOrders': {
    },
    'fixedOrigin': {
    },
    'fixedLetter': {
    },
    'electronics': {
      'required': 'Este campo es requerido.',
    },
    'codeA': {
    },
    'codeB': {
    },
    'codeC': {
    },
    'printable': {
    },
    'defectPrinter': {
    }
  };

  constructor(
    public _transactionTypeService: TransactionTypeService,
    public _roomService: RoomService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService,
  ) { 
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.transactionType = new TransactionType();
    this.getPrinters();
    this.buildForm();
    this.setValueForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
        } else {
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

  public buildForm(): void {

    this.transactionTypeForm = this._fb.group({
      'transactionMovement': [this.transactionType.transactionMovement, [
          Validators.required
        ]
      ],
      'name': [this.transactionType.name, [
          Validators.required
        ]
      ],
      'labelPrint': [this.transactionType.labelPrint, [
        ]
      ],
      'currentAccount': [this.transactionType.currentAccount, [
          Validators.required
        ]
      ], 
      'movement': [this.transactionType.movement, [
        ]
      ],
      'modifyStock': [this.transactionType.modifyStock, [
        ]
      ],
      'stockMovement': [this.transactionType.stockMovement, [
        ]
      ],
      'requestArticles': [this.transactionType.requestArticles, [
          Validators.required
        ]
      ],
      'defectOrders': [this.transactionType.defectOrders, [
        ]
      ],
      'fixedOrigin': [this.transactionType.fixedOrigin, [
        ]
      ], 
      'fixedLetter': [this.transactionType.fixedLetter, [
        ]
      ], 
      'electronics': [this.transactionType.electronics, [
          Validators.required,
        ]
      ],
      'codeA': [this.getCode(this.transactionType,"A"), [
        ]
      ],
      'codeB': [this.getCode(this.transactionType, "B"), [
        ]
      ],
      'codeC': [this.getCode(this.transactionType, "C"), [
        ]
      ],
      'printable': [this.transactionType.printable, [
        ]
      ],
      'defectPrinter': [this.transactionType.defectPrinter, [
        ]
      ]
    });

    this.transactionTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.transactionTypeForm) { return; }
    const form = this.transactionTypeForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public getCode(transactionType: TransactionType, letter: string): number {

    let code: number = 0;
    if (transactionType.codes) {
      let jsonString = JSON.stringify(transactionType.codes);
      let json = JSON.parse(jsonString);
      json.find(function (x) {
        if (x.letter === letter) {
          code = x.code;
        }
      });
    }

    return code;
  }

  public setValueForm(): void {

    if (!this.transactionType.transactionMovement && this.transactionMovements.length > 0) this.transactionType.transactionMovement = TransactionMovement.Sale;
    if (!this.transactionType.transactionMovement) this.transactionType.transactionMovement = null;
    if (!this.transactionType.name) this.transactionType.name = "";
    if (!this.transactionType.labelPrint) this.transactionType.labelPrint = "";
    if (!this.transactionType.currentAccount) this.transactionType.currentAccount = CurrentAcount.No;
    if (!this.transactionType.movement) this.transactionType.movement = Movements.Inflows;
    if (!this.transactionType.modifyStock) this.transactionType.modifyStock = ModififyStock.No;
    if (!this.transactionType.stockMovement) this.transactionType.stockMovement = StockMovement.Outflows;
    if (!this.transactionType.requestArticles) this.transactionType.requestArticles = RequestArticles.No;
    if (!this.transactionType.defectOrders) this.transactionType.defectOrders = DefectOrders.No;
    if (!this.transactionType.fixedOrigin) this.transactionType.fixedOrigin = 0;
    if (!this.transactionType.fixedLetter) this.transactionType.fixedLetter = "";
    if (!this.transactionType.electronics) this.transactionType.electronics = "No";
    if (!this.transactionType.printable) this.transactionType.printable = "No";
    if (!this.transactionType.defectPrinter) this.transactionType.defectPrinter = null;

    this.transactionTypeForm.setValue({
      'transactionMovement': this.transactionType.transactionMovement,
      'name': this.transactionType.name,
      'labelPrint': this.transactionType.labelPrint,
      'currentAccount': this.transactionType.currentAccount,
      'movement': this.transactionType.movement,
      'modifyStock': this.transactionType.modifyStock,
      'stockMovement': this.transactionType.stockMovement,
      'requestArticles': this.transactionType.requestArticles,
      'defectOrders': this.transactionType.defectOrders,
      'fixedOrigin': this.transactionType.fixedOrigin,
      'fixedLetter': this.transactionType.fixedLetter,
      'electronics': this.transactionType.electronics,
      'codeA': this.getCode(this.transactionType, "A"),
      'codeB': this.getCode(this.transactionType, "B"),
      'codeC': this.getCode(this.transactionType, "C"),
      'printable': this.transactionType.printable,
      'defectPrinter': this.transactionType.defectPrinter
    });
  }

  public addTransactionType(): void {
    this.loading = true;
    this.transactionType = this.transactionTypeForm.value;
    this.transactionType.codes = this.getCodes();
    this.saveTransactionType();
  }

  public getCodes(): CodeAFIP[] {

    let codes = new Array();
    let codeA = new CodeAFIP();
    codeA.letter = "A";
    codeA.code = this.transactionTypeForm.value.codeA;
    codes.push(codeA);
    let codeB = new CodeAFIP();
    codeB.letter = "B";
    codeB.code = this.transactionTypeForm.value.codeB;
    codes.push(codeB);
    let codeC = new CodeAFIP();
    codeC.letter = "C";
    codeC.code = this.transactionTypeForm.value.codeC;
    codes.push(codeC);
    
    return codes;
  }

  public saveTransactionType(): void {

    this.loading = true;

    this._transactionTypeService.saveTransactionType(this.transactionType).subscribe(
      result => {
        if (!result.transactionType) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.transactionType = result.transactionType;
          this.showMessage("El tipo de transacción se ha añadido con éxito.", "success", false);
          this.transactionType = new TransactionType();
          this.buildForm();
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