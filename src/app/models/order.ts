import {User} from 'firebase';
import {Status} from './status.enum';

export class Order {
    id: string;
    orderName: string;
    orderComment: string;
    orderStatus: Status;
    createdAt: Date;

    user: User | any;
}
