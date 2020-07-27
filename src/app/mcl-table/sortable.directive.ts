import { Directive, Input, Output, EventEmitter, Renderer, ElementRef, HostListener, OnInit, OnChanges } from '@angular/core'
import * as _clone from 'lodash.clonedeep'
import { SortDirection, SortEvent, MouseHover, TableHeader } from './table.models'

@Directive({
	// selector: 'th[sortable]',
	selector: '[fcsSortable]',
	host: {
		'[class.asc]': '!sortData?.item?.sortDisabled && direction === "asc"',
		'[class.desc]': '!sortData?.item?.sortDisabled && direction === "desc"',
		'(click)': 'sortColumn()',
		'[class.clickable]': '!sortData?.item?.sortDisabled',
		'(mouseenter)': 'toggleSortIcon(mouseHoverEnum.in)',
		'(mouseleave)': 'toggleSortIcon(mouseHoverEnum.out)',
	},
})
export class SortableDirective {
	@Input('fcsSortable') sortData: { item: TableHeader; propName: string }
	@Input() direction: SortDirection = SortDirection.none
	@Output() sort = new EventEmitter()
	@Output() mouseHover = new EventEmitter()

	public mouseHoverEnum = MouseHover

	// ngOnInit(): void {
	// 	console.log(`sortable  dir   ###   sortData: ${this.sortData}`)
	// 	console.log(`sortable  dir   ###   direction: ${this.direction}`)
	// }

	private rotate = (direction: SortDirection): SortDirection => {
		switch (direction) {
			case SortDirection.asc:
				return SortDirection.desc
			case SortDirection.desc:
				return SortDirection.none
			case SortDirection.none:
				return SortDirection.asc
		}
	}

	sortColumn() {
		if (this.sortData && this.sortData.item && this.sortData.item.sortDisabled == true) return

		this.direction = this.rotate(this.direction)
		this.sort.emit({ propName: this.sortData.propName, direction: this.direction } as SortEvent)
	}

	toggleSortIcon(direction: MouseHover) {
		if (this.sortData && this.sortData.item && this.sortData.item.sortDisabled) return

		this.mouseHover.emit(direction)
	}
}
