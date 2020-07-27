import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'

@Component({
	selector: 'fcs-sort-icon',
	template: ` <svg-icon *ngIf="icon" [src]="'/assets/' + icon" [svgStyle]="iconStyle"></svg-icon> `,
	styles: [],
})
export class SortIconComponent implements OnChanges {
	@Input() icon: any
	@Input() size: number
	@Input() color: string
	@Input() svgStyle

	iconStyle: any
	// private baseIconColor = '#000000'

	constructor() {
		this.calculateIconStyle()
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.svgStyle && changes.svgStyle.currentValue) {
			this.iconStyle = {
				...this.iconStyle,
				...changes.svgStyle.currentValue,
			}
		} else if (changes.size || changes.color) {
			this.calculateIconStyle()
		}
	}

	calculateIconStyle(): any {
		const style: any = {}
		if (this.color) style.fill = this.color // || this.baseIconColor

		if (this.size) {
			style['width.px'] = this.size
			style['height.px'] = this.size
		}

		this.iconStyle = {
			...style,
			...this.svgStyle,
		}
	}
}
