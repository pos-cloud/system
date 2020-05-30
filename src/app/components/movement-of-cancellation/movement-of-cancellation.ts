import * as moment from 'moment';
import 'moment/locale/es';
import { User } from '../user/user';
import { Transaction } from '../transaction/transaction';

export class MovementOfCancellation {

    public _id: string;
    public transactionOrigin: Transaction;
    public transactionDestination: Transaction;
    public balance: number = 0;
    public creationUser: User;
    public creationDate: string = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    public updateUser: User;
    public updateDate: string;
    constructor() { }
}

export let attributes = [
    {
        name: 'transactionOrigin._id',
        visible: false,
        disabled: true,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true
    },
    {
        name: 'transactionOrigin.endDate',
        visible: true,
        disabled: true,
        filter: true,
        datatype: 'string',
        project: `{ "$dateToString": { "date": "$transactionOrigin.endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'left',
        required: true
    },
    {
        name: 'transactionOrigin.type.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionOrigin.origin',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionOrigin.letter',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionOrigin.number',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionOrigin.company.name',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionOrigin.totalPrice',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionDestination.endDate',
        visible: true,
        disabled: true,
        filter: true,
        datatype: 'string',
        project: `{ "$dateToString": { "date": "$transactionDestination.endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
        align: 'left',
        required: true
    },
    {
        name: 'transactionDestination.type.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionDestination.origin',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionDestination.letter',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionDestination.number',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionDestination.company.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionDestination.totalPrice',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'balance',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: null,
        align: 'center',
        required: false,
    },
    {
        name: 'transactionOrigin.type.transactionMovement',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'center',
        required: true,
    },
    {
        name: 'transactionOrigin.operationType',
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
        name: 'transactionDestination.operationType',
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
        name: 'transactionOrigin.creationDate',
        visible: false,
        disabled: false,
        filter: false,
        datatype: 'date',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transactionOrigin.updateDate',
        visible: false,
        disabled: false,
        filter: false,
        datatype: 'date',
        project: null,
        align: 'left',
        required: true,
    },
    {
        name: 'transactionOrigin.endDate2',
        visible: false,
        disabled: false,
        filter: false,
        datatype: 'date',
        project: `"$transactionOrigin.endDate"`,
        align: 'left',
        required: true,
    },
    {
        name: 'transactionOrigin.state',
        visible: false,
        disabled: false,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
    }
];