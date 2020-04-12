import {Transaction} from './transaction';

export class Order {
    id: string;
    transaction: Transaction[];
    comment: string;
    createdAt: Date;
}
