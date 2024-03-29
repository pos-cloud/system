import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatPipe } from './date-format.pipe';

@Pipe({
    name: 'filter'
})

export class FilterPipe implements PipeTransform {

    result: any;
    strVal: string = '';
    strArg: string = '';
    terms: string[];
    valueAux: any[];
    dateFormat: DateFormatPipe = new DateFormatPipe();

    transform(value: any[], term: string, property?: string, subobject?: string): any {

        if (term === undefined || !(term) || !value) {
            this.result = value;
        } else {

            this.valueAux = value;
            
            this.result = this.valueAux.filter(item => {

                for (let key in item) {
                    if (subobject !== undefined) {
                        if (key === subobject) {  //rechaza buscar por _id, y verifica si cual es la propiedad del objeto

                            this.strVal = '';
                            if (item[key]) {
                                this.strVal += item[key][property];
                            }
                            // this.strArg = ''+this.terms[this.terms.length-1];
                            this.strArg = term;
                            if (!this.strArg.toLowerCase().includes('>') &&
                                !this.strArg.toLowerCase().includes('<') &&
                                !this.strArg.toLowerCase().includes('=')) {
                                if (this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                                    return true;
                                } else {
                                    return false;
                                }
                            } else {
                                if (item[key] && !isNaN(item[key][property])) {
                                    if (this.strArg.toLowerCase().includes('>') && item[key][property] > term.split('>')[1] ||
                                        this.strArg.toLowerCase().includes('>=') && item[key][property] >= term.split('>=')[1]) {
                                        return true;
                                    } else if (this.strArg.toLowerCase().includes('<') && item[key][property] < term.split('<')[1] ||
                                        this.strArg.toLowerCase().includes('<=') && item[key][property] <= term.split('<=')[1]) {
                                        return true;
                                    } else if (!this.strArg.toLowerCase().includes('>') &&
                                        !this.strArg.toLowerCase().includes('<') &&
                                        this.strArg.toLowerCase().includes('=')
                                        && item[key][property] === 0) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                } else {
                                    if (item[key] && this.strArg.toLowerCase().includes('=') && (!item[key][property] || item[key][property] === '')) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    } else if (property !== undefined) {

                        if (key != "_id" && key === property) {  //rechaza buscar por _id, y verifica si cual es la propiedad del objeto
                            
                            // Cambio de formato de fecha
                            // item[key] = this.dateFormat.transform(item[key], 'DD/MM/YYYY HH:mm:ss');
                            
                            this.strArg = term;
                            this.strVal = '' + item[key];
                            if (!this.strArg.toLowerCase().includes('>') &&
                                !this.strArg.toLowerCase().includes('<') &&
                                !this.strArg.toLowerCase().includes('=')) {
                                    if (property.toLowerCase().includes("date".toLowerCase())) {
                                        let dateVal = this.dateFormat.transform(this.strVal, 'YYYY-MM-DD hh:mm:ss');
                                        if (dateVal.toString().includes(this.strArg.toString())) {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    } else {
                                        if (this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                                            return true;
                                        } else {
                                            return false;
                                        }
                                    }
                            } else {
                                if (!isNaN(item[key])) {
                                    if (this.strArg.toLowerCase().includes('>') && item[key] > term.split('>')[1] ||
                                        this.strArg.toLowerCase().includes('>=') && item[key] >= term.split('>=')[1]) {
                                        return true;
                                    } else if (this.strArg.toLowerCase().includes('<') && item[key] < term.split('<')[1] ||
                                        this.strArg.toLowerCase().includes('<=') && item[key] <= term.split('<=')[1]) {
                                        return true;
                                    } else if (!this.strArg.toLowerCase().includes('>') &&
                                        !this.strArg.toLowerCase().includes('<') &&
                                        this.strArg.toLowerCase().includes('=')
                                        && item[key] === 0) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                } else {
                                    if (this.strArg.toLowerCase().includes('=') && (!item[key] || item[key] === '')) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    } else {
                        if (key != "_id") {   //rechaza buscar por _id

                            this.strVal = '' + item[key];
                            this.strArg = term;

                            if (!this.strArg.toLowerCase().includes('>') &&
                                !this.strArg.toLowerCase().includes('<') &&
                                !this.strArg.toLowerCase().includes('=')) {
                                if (this.strVal.toLowerCase().includes(this.strArg.toLowerCase())) {
                                    return true;
                                }
                            } else {
                                if (!isNaN(item[key])) {
                                    if (this.strArg.toLowerCase().includes('>') && item[key] > term.split('>')[1] ||
                                        this.strArg.toLowerCase().includes('>=') && item[key] >= term.split('>=')[1]) {
                                        return true;
                                    } else if (this.strArg.toLowerCase().includes('<') && item[key] < term.split('<')[1] ||
                                        this.strArg.toLowerCase().includes('<=') && item[key] <= term.split('<=')[1]) {
                                        return true;
                                    } else if (!this.strArg.toLowerCase().includes('>') &&
                                        !this.strArg.toLowerCase().includes('<') &&
                                        this.strArg.toLowerCase().includes('=')
                                        && item[key] === 0) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                } else {
                                    if (this.strArg.toLowerCase().includes('=') && (!item[key] || item[key] === '')) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                }
            });
            this.valueAux = this.result;
        }
        return this.result;
    }
}