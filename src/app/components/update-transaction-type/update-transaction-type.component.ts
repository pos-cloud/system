import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TransactionType, Movements, CurrentAcount, CodeAFIP, RequestArticles, DefectOrders } from './../../models/transaction-type';
import { Room } from './../../models/room';
import { Printer } from './../../models/printer';

import { TransactionTypeService } from './../../services/transaction-type.service';
import { RoomService } from './../../services/room.service';
import { PrinterService } from './../../services/printer.service';

@Component({
  selector: 'app-update-transaction-type',
  templateUrl: './update-transaction-type.component.html',
  styleUrls: ['./update-transaction-type.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateTransactionTypeComponent implements OnInit {

  @Input() transactionType: TransactionType;
  @Input() readonly: boolean;
  public transactionTypeForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public printers: Printer[];

  public formErrors = {
    'name': '',
    'currentAccount': '',
    'movement': '',
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
    'name': {
      'required': 'Este campo es requerido.',
    },
    'currentAccount': {
      'required': 'Este campo es requerido.',
    },
    'movement': {
      'required': 'Este campo es requerido.',
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
  ) { }

  ngOnInit(): void {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getPrinters();
    this.buildForm();
    this.setValueForm();
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
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

  public buildForm(): void {

    this.transactionTypeForm = this._fb.group({
      '_id': [this.transactionType._id, [
          Validators.required
        ]
      ],
      'name': [this.transactionType.name, [
          Validators.required
        ]
      ],
      'currentAccount': [this.transactionType.currentAccount, [
          Validators.required
        ]
      ], 
      'movement': [this.transactionType.movement, [
          Validators.required
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

  public setValueForm(): void {

    if (!this.transactionType._id) this.transactionType._id = "";
    if (!this.transactionType.name) this.transactionType.name = "";
    if (!this.transactionType.currentAccount) this.transactionType.currentAccount = CurrentAcount.No;
    if (!this.transactionType.movement) this.transactionType.movement = Movements.Inflows;
    if (!this.transactionType.requestArticles) this.transactionType.requestArticles = RequestArticles.No;
    if (!this.transactionType.defectOrders) this.transactionType.defectOrders = DefectOrders.No;
    if (!this.transactionType.fixedOrigin) this.transactionType.fixedOrigin = 0;
    if (!this.transactionType.fixedLetter) this.transactionType.fixedLetter = "";
    if (!this.transactionType.electronics) this.transactionType.electronics = "No";
    if (!this.transactionType.printable) this.transactionType.printable = "No";
    if (!this.transactionType.defectPrinter) this.transactionType.defectPrinter = null;

    this.transactionTypeForm.setValue({
      '_id': this.transactionType._id,
      'name': this.transactionType.name,
      'currentAccount': this.transactionType.currentAccount,
      'movement': this.transactionType.movement,
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

  public updateTransactionType(): void {
    if (!this.readonly) {
      this.loading = true;
      this.transactionType = this.transactionTypeForm.value;
      this.transactionType.codes = this.getCodes();
      this.saveChanges();
    }
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

  public saveChanges(): void {

    this._transactionTypeService.updateTransactionType(this.transactionType).subscribe(
      result => {
        if (!result.transactionType) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.transactionType = result.transactionType;
          this.showMessage("El tipo de transacción se ha actualizado con éxito.", "success", false);
          this.activeModal.close('save_close');
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