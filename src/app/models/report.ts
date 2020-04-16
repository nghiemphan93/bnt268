import {Product} from './product';

export class Report {
    id: string;

    products: Product[] = [];
    quantities: number[] = [];
    totalPricePerProduct: number[] = [];
    totalPrice = 0;

    giveWeights: number[] = [];
    receiveWeights: number[] = [];
    totalGiveWeight = 0;
    totalReceiveWeight = 0;
    totalReceiveWeightAdjusted = 0;
    weightDifference = 0;

    createdAt: Date;
}
