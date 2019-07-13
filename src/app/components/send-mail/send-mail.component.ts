import { Component, OnInit, Input, EventEmitter, ɵɵresolveBody } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { MailService } from './../../services/send-mail.service';
import { CompanyService } from './../../services/company.service';

@Component({
  selector: 'app-send-mail',
  templateUrl: './send-mail.component.html',
  styleUrls: ['./send-mail.component.css'],
  providers: [NgbAlertConfig]
})
export class SendMailComponent implements OnInit {
  
  public sendmailForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public modelToImport: Array<String>;
  @Input() emails;
  @Input() subject;
  @Input() body;

  public formErrors = {
    'emails': '',
    'subject': '',
    'body': ''
  };

  public validationMessages = {
    'emails': {
      'required':       'Este campo es requerido.'
    },
    'subject': {
      'required':       'Este campo es requerido.'
    },
    'body' : {
      'required':       'Este campo es requerido.'
    }
  };

  
  constructor(

    public _companyService: CompanyService,
    public _serviceMail: MailService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.sendmailForm.setValue({
      'emails': this.emails || '',
      'subject': this.subject || '', 
      'body': this.body || ''
    });
  }

  public buildForm(): void {
    this.sendmailForm = this._fb.group({
      'emails': [this.emails, []],
      'subject': [this.subject,[]],
      'body': [this.body,[]]
    });

    this.sendmailForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    
        if (!this.sendmailForm) { return; }
        const form = this.sendmailForm;
    
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

  public sendEmail (): void {
    
    this.loading = true;
    this.modelToImport = this.sendmailForm.value;
    this._serviceMail.sendEmail(this.modelToImport).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
        } else {
          this.showMessage("El mail se envio correctamente.", 'success', false);
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error, 'danger', false);
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
    this.alertMessage = '';
  }
}
