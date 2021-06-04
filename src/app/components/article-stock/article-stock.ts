import { Article } from '../article/article';
import { Deposit } from '../deposit/deposit';
import { Branch } from '../branch/branch';

export class ArticleStock {

    public _id: string;
    public article: Article;
    public branch: Branch;
    public deposit: Deposit;
    public realStock: number = 0.00;
    public minStock: number = 0.00;
    public maxStock: number = 0.00;
    public updateDate: string;

    constructor() { }
}

export let attributes = [
    {
        name: '_id',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'branch.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'deposit.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.make.description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.category.description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.code',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.barcode',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.description',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.unitOfMeasurement.abbreviation',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.posDescription',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.picture',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
    },
    {
        name: 'article.ecommerceEnabled',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'boolean',
        project: `{"$toString":"$article.ecommerceEnabled"}`,
        align: 'left',
        required: false,
    },
    {
        name: 'applicationsName',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: `{"$reduce":{"input":"$article.applications.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
        align: 'left',
        required: false,
    },
    {
        name: 'article.otherFieldsValues',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: `{"$reduce":{"input":"$article.otherFields.value","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
        align: 'left',
        required: false,
    },
    {
        name: 'realStock',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'article.minStock',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'article.maxStock',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'article.pointOfOrder',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'article.basePrice',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'article.currency.name',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'article.currency.quotation',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'providersName',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: `{"$reduce":{"input":"$article.providers.name","initialValue":"","in":{"$concat":["$$value",{"$cond":{"if":{"$eq":["$$value",""]},"then":"","else":"; "}},{"$concat":[{"$toString":"$$this"},""]}]}}}`,
        align: 'left',
        required: false,
    },
    {
        name: 'article.costPrice',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'right',
        required: true,
    },
    {
        name: 'total',
        visible: true,
        disabled: true,
        filter: true,
        datatype: 'currency',
        project: `{ "$multiply": [ "$article.costPrice", "$realStock" ] }`,
        align: 'right',
        required: true,
    },
    {
        name: 'article.operationType',
        visible: false,
        disabled: true,
        filter: true,
        defaultFilter: `{ "$ne": "D" }`,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'operationType',
        visible: false,
        disabled: true,
        filter: true,
        defaultFilter: `{ "$ne": "D" }`,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'article.allowStock',
        visible: false,
        disabled: true,
        filter: true,
        defaultFilter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'article._id',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'branch._id',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'updateDate',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project:  `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'left',
        required: true,
    },
    {
        name: 'deposit._id',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    },
]