import {Transaction} from './transaction';

export class Order {
    id: string;
    orderName: string;
    transaction: Transaction[];
    comment: string;
    createdAt: Date;
}
