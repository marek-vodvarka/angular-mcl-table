export enum SortDirection {
	none = '',
	asc = 'asc',
	desc = 'desc',
}
export enum MouseHover {
	in,
	out,
}
export enum ColumnAlignment {
	left,
	center,
	right,
}

export interface SortEvent {
	propName: string
	direction: SortDirection
}

export interface TableHeader {
	name: string
	propName: string
	sortDisabled: boolean
	class: any
	style: any
	alignment: ColumnAlignment | undefined
}

export interface TableModel {
	data: Array<any>
	header: Array<TableHeader>
}
