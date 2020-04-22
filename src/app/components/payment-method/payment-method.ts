import { User } from '../user/user';

import * as moment from 'moment';


export class PaymentMethod {

	public _id: string;
	public code: number = 1;
	public name: string = '';
	public discount: number = 0.00;
	public surcharge: number = 0.00;
	public isCurrentAccount: boolean;
	public acceptReturned: boolean;
	public inputAndOuput: boolean;
	public checkDetail: boolean;
	public cardDetail: boolean;
	public allowToFinance: boolean;
	public cashBoxImpact: boolean;
	public bankReconciliation: boolean;
	public company : CompanyType;
    public allowCurrencyValue : boolean;
    public allowBank : boolean;
	public observation : string;
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
  	public updateDate: string;

	constructor () {}
}

export enum CompanyType {
  None = <any> null,
  Client = <any> "Cliente",
  Provider = <any> "Proveedor",
}
