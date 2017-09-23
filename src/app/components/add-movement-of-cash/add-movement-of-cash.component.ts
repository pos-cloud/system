//Paquetes Angular
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { PaymentMethod } from './../../models/payment-method';
import { MovementOfCash, MovementOfCashState } from './../../models/movement-of-cash';
import { Transaction } from './../../models/transaction';

//Servicios
import { PaymentMethodService } from './../../services/payment-method.service';
import { MovementOfCashService } from './../../services/movement-of-cash.services';

@Component({
  selector: 'app-add-movement-of-cash',
  templateUrl: './add-movement-of-cash.component.html',
  styleUrls: ['./add-movement-of-cash.component.css']
})

export class AddMovementOfCashComponent implements OnInit {

  @Input() transaction: Transaction;
  public movementOfCash: MovementOfCash;
  public paymentMethods: PaymentMethod[];
  public movementOfCashForm: FormGroup;
  public alertMessage: string = "";
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'paymentMethod': '',
    'totalPrice': '',
  };

  public validationMessages = {
    'paymentMethod': {
      'required': 'Este campo es requerido.'
    },
    'totalPrice': {
      'required': 'Este campo es requerido.'
    },
  };

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _movementOfCashService: MovementOfCashService,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.movementOfCash = new MovementOfCash();
    this.movementOfCash.type = new PaymentMethod();
    this.paymentMethods = new Array();
    if(!this.transaction) {
      this.transaction = new Transaction();
    }
  }

  ngOnInit() {
    this.getPaymentMethods();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getPaymentMethods(): void {

    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods){
          this.showMessage(result.message, "info", true);
        } else {  
          this.movementOfCash.type = result.paymentMethods[0];
          this.paymentMethods = result.paymentMethods;
          this.movementOfCashForm.setValue({
            'paymentMethod': this.movementOfCash.type,
            'totalPrice': this.movementOfCash.totalPrice
          });
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

    this.movementOfCashForm = this._fb.group({
      'paymentMethod': [this.movementOfCash.type, [
          Validators.required
        ]
      ],
      'totalPrice': [this.movementOfCash.totalPrice, [
          Validators.required
        ]
      ],
    });

    this.movementOfCashForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.movementOfCashForm) { return; }
    const form = this.movementOfCashForm;

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

  public addMovementOfCash(): void {
    this.movementOfCash.state = MovementOfCashState.Closed;
    this.movementOfCash.totalPrice = this.movementOfCashForm.value.totalPrice;
    this.movementOfCash.transaction = this.transaction;
    this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
    
    this.saveMovementOfCash();
  }

  public cancel(): void {
    console.log("cancel");
    this.activeModal.close('cancel');
  }

  public getMovementOfCashesByTransaction(): void {

    this.loading = true;
    
    this._movementOfCashService.getMovementOfCashesByTransaction(this.movementOfCash.transaction._id).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          this.saveMovementOfCash();
        } else {
          this.movementOfCash = result.movementsOfCashes[0];
          this.updateMovementOfCash();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public saveMovementOfCash(): void {

    this.loading = true;
    console.log(this.movementOfCash);
    this._movementOfCashService.saveMovementOfCash(this.movementOfCash).subscribe(
      result => {
        if (!result.movementOfCash) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.movementOfCash = result.movementOfCash;
          this.activeModal.close("add-movement-of-cash");
        }
        this.loading = false;
      },
      error => {
        console.log(error);
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateMovementOfCash(): void {

    this.loading = true;

    this._movementOfCashService.updateMovementOfCash(this.movementOfCash).subscribe(
      result => {
        if (!result.movementOfCash) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.movementOfCash = result.movementOfCash;
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
