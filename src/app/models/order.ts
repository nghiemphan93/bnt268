import {User} from 'firebase';

export class Order {
    id: string;
    orderName: string;
    orderComment: string;
    createdAt: Date;

    user: User | any;
}
