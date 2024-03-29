import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';

@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
	transform(value:any, format:string = 'YYYY-MM-DDTHH:mm:ssZ', formatDefecto?:string):any {
		if (value) {
			if (!formatDefecto) {
				// Cambio de formato de fecha
				formatDefecto = 'YYYY-MM-DDTHH:mm:ssZ';
				// formatDefecto = 'DD/MM/YYYY HH:mm:ss';
			}
			let date = moment(new Date(value)).format(format);
			return date;
		}
	}
}