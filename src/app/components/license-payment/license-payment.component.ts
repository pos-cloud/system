import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// SERVICES
import { ConfigService } from './../../services/config.service';

import { Config } from 'app/app.config';
import { RoundNumberPipe } from '../../pipes/round-number.pipe';

@Component({
  selector: 'app-license-payment',
  templateUrl: './license-payment.component.html',
  styleUrls: ['./license-payment.component.css'],
  providers: [NgbAlertConfig]
})
export class LicensePaymentComponent implements OnInit {

  @Input() readonly: boolean;

  public loading: boolean = false;
  public toggleButton: boolean = false;
  public alertMessage: string = '';
  public loadingLicense: boolean = false;
  public wireTransfer: boolean = false;
  public payment;
  public paymentTotal;

  constructor(
    public _configService: ConfigService,
    public activeModal: NgbActiveModal,
    public _router: Router,
    public alertConfig: NgbAlertConfig,
    public roundNumber: RoundNumberPipe,
  ) { }

  ngOnInit() {

    this.payment = Config.licenseCost;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }

  ngAfterViewInit() {
  }

  public changePrice(month) {
    
    this.toggleButton = true;
    
    if( Config.licenseCost ) {

      switch (month) {
        case '1':
           this.paymentTotal = Config.licenseCost;
           this.toggleButton = true;
          break;
        case '6':
          this.paymentTotal = this.roundNumber.transform((Config.licenseCost*month) - ((10*(Config.licenseCost*month))/100));
          this.toggleButton = true;
          break;
        case '12':
          this.paymentTotal = this.roundNumber.transform((Config.licenseCost*month) - ((25*(Config.licenseCost*month))/100));   
          break;
      }
    }
  }

  public paymentSelect(method :string ) : void {

    switch (method) {
      case 'mp':
          this._configService.generateLicensePayment(this.paymentTotal).subscribe(
            result => {
              if (!result.paymentLink) {
                if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
              } else {
                window.open(result.paymentLink, '_blank')
              }
              this.loadingLicense = false;
            },
            error => {
              this.showMessage(error._body, "danger", false);
              this.loadingLicense = false;
            }
          )
        break;
      case 'tf':
            this.wireTransfer = true;
        break;
    }
  }
}
