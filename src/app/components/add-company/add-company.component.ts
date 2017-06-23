import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType } from './../../models/company';

import { CompanyService } from './../../services/company.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCompanyComponent  implements OnInit {

  public company: Company;
  public types: CompanyType[] = [CompanyType.Client, CompanyType.Provider];
  public companyForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': 1,
    'name': '',
    'fantasyName': '',
    'type': '',
    'CUIT': '',
    'address': '',
    'city': '',
    'phones': '',
    'emails': ''

  };

  public validationMessages = {
    'code': {
      'required':       'Este campo es requerido.'
    },
    'name': {
      'required':       'Este campo es requerido.'
    },
    'fantasyName': {
    },
    'type': {
      'required':       'Este campo es requerido.'
    },
    'CUIT': {
      'required':       'Este campo es requerido.'
    },
    'address': {
    },
    'city': {
    },
    'phones': {
    },
    'emails': {
    }
  };

  constructor(
    public _companyService: CompanyService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.company = new Company ();
    this.getLastCompany();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.companyForm = this._fb.group({
      'code': [this.company.code, [
          Validators.required
        ]
      ],
      'name': [this.company.name, [
          Validators.required
        ]
      ],
      'fantasyName': [this.company.fantasyName, [
        ]
      ],
      'type': [this.company.type, [
          Validators.required
        ]
      ],
      'CUIT': [this.company.CUIT, [
          Validators.required
        ]
      ],
      'address': [this.company.address, [
        ]
      ],
      'city': [this.company.city, [
        ]
      ],
      'phones': [this.company.phones, [
        ]
      ],
      'emails': [this.company.emails, [
        ]
      ]
    });

    this.companyForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.companyForm) { return; }
    const form = this.companyForm;

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

  public getLastCompany(): void {  

    this._companyService.getLastCompany().subscribe(
        result => {
          let code = 1;
          if(result.companies){
            if(result.companies[0] !== undefined) {
              code = result.companies[0].code + 1;
            }
          }
          
          this.companyForm.setValue({
            'code': code,
            'name': '',
            'fantasyName': '',
            'type': CompanyType.Client,
            'CUIT': '',
            'address': '',
            'city': '',
            'phones': '',
            'emails': ''
          });
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  public addCompany(): void {
    
    this.loading = true;
    this.company = this.companyForm.value;
    this.saveCompany();
  }

  public saveCompany(): void {
    
    this._companyService.saveCompany(this.company).subscribe(
    result => {
        if (!result.company) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.company = result.company;
          this.alertConfig.type = 'success';
          this.alertMessage = "La empresa se ha añadido con éxito.";      
          this.company = new Company ();
          this.getLastCompany();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}