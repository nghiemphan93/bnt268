import {Order} from './order';
import {Kind} from './kind.enum';
import {Product} from './product';

export class OrderItem {
    id: string;
    orderItemName: string;
    orderItemComment: string;
    orderItemKind: Kind;
    orderItemProducts: Product[] = [];
    orderItemQuantities: number[] = [];
    orderItemWeight: number;
    createdAt: Date;

    order: Order;
}
