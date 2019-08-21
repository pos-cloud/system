import { User } from './user';

import * as moment from 'moment';
import 'moment/locale/es';

export class Make {
	
	public _id: string;
	public description: string = '';
	public visibleSale: boolean = false;
	public ecommerceEnabled: boolean = false;
	public picture: string;
	public creationUser: User;
	public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	public updateUser: User;
	public updateDate: string;

	constructor () {}
}