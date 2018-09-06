import { Component, OnInit } from '@angular/core';

import { Config } from './app.config';

import { ConfigService } from './services/config.service';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public config: Config;
  public alertMessage = '';
  public isAPIConected: boolean;
  public loading = true;
  public modules;

  constructor(
    public _configService: ConfigService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
    this.isAPIConected = true;
  }

  ngOnInit(): void {
    this.setApiConfigurationSettings();
    this.getConfigApi();
  }

  public getConfigApi() {

    this.loading = true;

    this._configService.getConfigApi().subscribe(
      result => {
        if (!result.configs) {
          this.isAPIConected = false;
        } else {
          this.isAPIConected = true;
          const config = result.configs[0];
          this.setConfigurationSettings(config);
        }
        this.loading = false;
      },
      error => {
        this.isAPIConected = false;
      }
    );
  }

  public setConfigurationSettings(config) {
    if (config.pathBackup) { Config.setConfigToBackup(config.pathBackup, config.pathMongo, config.backupTime); }
    if (config.emailAccount) { Config.setConfigEmail(config.emailAccount, config.emailPassword) }
    if (config.companyName) { Config.setConfigCompany(config.companyName, config.companyCUIT, config.companyAddress, config.companyPhone,
                                                    config.companyVatCondition, config.companyStartOfActivity, config.companyGrossIncome, config.footerInvoice);
    }
    if (config.modules) {
      Config.setModules(config.modules);
      this.modules = config.modules;
    }
  }

  public setApiConfigurationSettings() {
    Config.setApiHost(window.location.hostname);
    Config.setApiPort(3000);
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
