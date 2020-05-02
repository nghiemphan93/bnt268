import {Product} from './product';

export class Report {
    id: string;

    products: Product[] = [];
    quantities: number[] = [];
    totalPricePerProduct: number[] = [];
    totalPrice = 0;

    giveWeights: number[] = [];
    giveWeightsDates: Date[] = [];
    receiveWeights: number[] = [];
    receiveWeightsDates: Date[] = [];
    receiveBacDatWeights: number[] = [];
    receiveBacDatWeightsDates: Date[] = [];
    receiveBacTonWeights: number[] = [];
    receiveBacTonWeightsDates: Date[] = [];
    totalGiveWeight = 0;
    totalReceiveWeight = 0;
    totalHaoWeight = 0;
    totalReceiveWeightAdjusted = 0;
    totalReceiveBacDatWeight = 0;
    totalReceiveBacTonWeight = 0;
    totalReceiveWeightAdjustedIncludeBacDatVaTon = 0;
    totalWeightDifference = 0;

    createdAt: Date;
}
