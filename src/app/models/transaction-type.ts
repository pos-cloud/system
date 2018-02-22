export class TransactionType {

	public _id: string;
	public name: string = "";
	public currentAccount: CurrentAcount = CurrentAcount.No;
	public movement: TransactionTypeMovements = TransactionTypeMovements.Inflows;
	public electronics: string;
	public codes: CodeAFIP[];
	public fixedOrigin: number;
	public fixedLetter: string;

	constructor() { }
}

export enum TransactionTypeMovements {
	Inflows = <any> "Entrada",
	Outflows = <any> "Salida"
}

export enum CurrentAcount {
	Yes = <any>"Si",
	No = <any>"No",
	Cobra = <any>"Cobra"
}

export class CodeAFIP {
	letter: string;
	code: number;
}