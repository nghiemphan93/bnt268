import {Detail} from './detail';

export class Transaction {
    id: string;
    kind: string;
    details: Detail[];
    weight: number;
    createAt: Date;
}
