import { VariantType } from "./variant-type";
import { Article } from "./article";
import { VariantValue } from "./variant-value";

export class Variant {

	public _id: string;
	public type: VariantType;
	public value: VariantValue;
	public articleParent: Article;
	public articleChild: Article;

	constructor() { }
}