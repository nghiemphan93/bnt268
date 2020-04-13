import {Detail} from './detail';
import {Order} from './order';
import {User} from 'firebase';

export class Transaction {
    id: string;
    kind: string;
    details: Detail[];
    weight: number;
    createAt: Date;

    order: Order;
}
