import { Employee } from './employee';

export class User {

	public _id: string;
	public name: string;
	public password: string;
	public state: UserState;
	public token: string;
  public tokenExpiration: number = 9999;
	public employee: Employee = null;

	constructor () {}
}

export enum UserState {
	Enabled = <any> "Habilitado",
	Disabled = <any> "No Habilitado",
}
