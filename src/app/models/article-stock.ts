import { Article } from './article';
import { Deposit } from './deposit';
import { Branch } from './branch';

export class ArticleStock {

	public _id: string;
	public article: Article;
	public branch: Branch;
	public deposit: Deposit;
	public realStock: number = 0.00;
	public minStock: number = 0.00;
	public maxStock: number = 0.00;

	constructor() { }
}

export let attributes = [
	{
		name: 'branch.name',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'deposit.name',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.make.description',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.category.description',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.code',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.barcode',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.description',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.unitOfMeasurement.abbreviation',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'article.posDescription',
		visible: false,
		disabled: false,
		filter: true,
		datatype: 'string',
		align: 'left',
		required : false,
	},
	{
		name: 'realStock',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'number',
		align: 'right',
		required : true,
	},
	{
		name: 'article.costPrice',
		visible: true,
		disabled: false,
		filter: true,
		datatype: 'currency',
		align: 'right',
		required : true,
	},
	{
		name: 'total',
		visible: true,
		disabled: true,
		filter: true,
		project : `{ "$multiply": [ "$article.costPrice", "$realStock" ] }`,
		datatype: 'currency',
		align: 'right',
		required : true,
	},
	{
		name: 'article.operationType',
		visible: false,
		disabled: true,
		filter: true,
		defaultFilter: `{ "$ne": "D" }`,
		datatype: 'string',
		align: 'left',
		required : true,
	},
	{
		name: 'operationType',
		visible: false,
		disabled: true,
		filter: true,
		defaultFilter: `{ "$ne": "D" }`,
		datatype: 'string',
		align: 'left',
		required : true,
	}
]