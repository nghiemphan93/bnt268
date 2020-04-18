import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CurrencyVNDPipe} from '../../pipes/currency-vnd.pipe';


@NgModule({
    declarations: [CurrencyVNDPipe],
    imports: [
        CommonModule
    ],
    exports: [
        CurrencyVNDPipe
    ]
})
export class SharedmoduleModule {
}
