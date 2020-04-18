import {Pipe, PipeTransform} from '@angular/core';
import {formatCurrency, getCurrencySymbol} from '@angular/common';

@Pipe({
    name: 'currencyVND'
})
export class CurrencyVNDPipe implements PipeTransform {

    transform(
        value: number,
        currencyCode: string = 'VND',
        display:
            | 'code'
            | 'symbol'
            | 'symbol-narrow'
            | string
            | boolean = 'symbol',
        digitsInfo: string = '4.0',
        locale: string = 'vi_VN',
    ): string | null {
        return formatCurrency(
            value,
            locale,
            getCurrencySymbol(currencyCode, 'wide'),
            currencyCode,
            digitsInfo,
        );
    }
}
