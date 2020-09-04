import { Model } from '../model/model.model';
import { Application } from '../application/application.model';

export class ShipmentMethod extends Model {

  public name: string;
  public zones: [{
    name: string,
    type: ZoneType,
    points: {
      lat: number,
      lng: number
    }[],
    area: number
  }];
  public applications: Application[];

  constructor() { super(); }

  static getAttributes(): {
    name: string,
    visible: boolean,
    disabled: boolean,
    filter: boolean,
    defaultFilter: string,
    datatype: string,
    project: any,
    align: string,
    required: boolean
  }[] {
    return Model.getAttributes([
      {
        name: 'name',
        visible: true,
        disabled: false,
        filter: true,
        defaultFilter: null,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      }
    ])
  }
}

export enum ZoneType {
  IN = <any>"in",
  OUT = <any>"out"
}
