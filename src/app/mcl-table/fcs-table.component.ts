import {
	Component,
	Input,
	Output,
	EventEmitter,
	QueryList,
	ViewChildren,
	OnChanges,
	TemplateRef,
	SimpleChanges,
	OnInit,
} from '@angular/core'
import * as _clone from 'lodash.clonedeep'
import { SortEvent, SortDirection, TableHeader, MouseHover, ColumnAlignment } from './table.models'
import { SortableDirective } from './sortable.directive'
import { Utils } from '@app/shared/services/utils.service'
import { isString, isObject, isArray, isNumber } from 'util'

@Component({
	selector: 'fcs-table',
	templateUrl: './fcs-table.component.html',
	styleUrls: ['./fcs-table.component.scss'],
})
export class TablePaginationComponent implements OnChanges, OnInit {
	@Input() data: any[]
	@Input() showHeader = true
	@Input() headerList: Array<string>
	@Input() headerData: Array<TableHeader>
	@Input() colsTemplate: TemplateRef<any>
	@Input() footerTemplate: TemplateRef<any>
	@Input() model: any
	@Input() withScrollbar = false
	@Input() allowPagination = true
	@Input() allowPageSize = true
	@Input() pageSize: number = 10
	@Input() searchPropName: string
	@Input() heading: string
	@Input() headingHelpText: string //todo delete
	@Input() cbxCustomClass
	searchTerm: string

	public get searchAllowed(): boolean {
		return !!this.searchPropName
	}
	public allChecked: boolean = false

	get showPagination(): boolean {
		return this.data && this.data.length > this.pageSize && this.allowPagination
	}
	get showPageRow(): boolean {
		return this.showPagination || (this.allowPageSize && this.allowPagination)
	}

	@ViewChildren(SortableDirective) headersDirectiveViewChildren: QueryList<SortableDirective>
	@Output() rowClick = new EventEmitter()
	@Output() checkboxChange = new EventEmitter()
	public showCheckboxColumn = false
	public columnAlignments = ColumnAlignment
	public processedData = []
	public processedContext = {
		rows: this.processedData,
		click: (data) => this.rowClickFce(data),
		model: {
			checkboxChange: (item, val) => this.checkboxToggle(item, val),
			...this.model,
		},
	}
	// private headerNames: any

	public currentPage = 1
	public dataSize = 0

	readonly pageSizes = [5, 10, 15, 20, 30, 50, 75, 100]
	private sortData = {} as SortEvent

	get pageStart(): number {
		if (!this.data) return 0

		return this.pageSize * (this.currentPage - 1) + 1
	}
	get pageEnd(): number {
		if (!this.data) return 0

		const end = this.pageSize * this.currentPage
		return this.data.length > end ? end : this.data.length
	}

	sortIcons: any[] = []
	private icons: any = {
		down: 'assets/arrow-up.svg',
		up: 'assets/arrow-down.svg',
		hover: 'assets/caret-up.svg',
	}
	constructor() {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.data) this.processData(null, null)
		if (changes.model)
			this.processedContext.model = {
				checkboxChange: (item, val) => this.checkboxToggle(item, val),
				...this.model,
			}

		if (changes.rowClick) this.processedContext.click = changes.rowClick.currentValue
		if (changes.headerData) {
			// this.headerNames = Object.getOwnPropertyNames(this.headerData)
			this.processHeaderData()
		}
	}
	ngOnInit(): void {
		this.showCheckboxColumn = this.checkboxChange && !!this.checkboxChange.observers.length
	}

	processData(sortData: SortEvent, page: number, searchTerm?: string) {
		if (sortData) this.updateSortData(sortData)
		if (page) this.currentPage = page
		if (searchTerm) {
			this.currentPage = 1
		}
		this.searchTerm = searchTerm

		let data = _clone(this.data)
		if (!data) {
			this.dataSize = 0
			this.updateData([])
			return
		}
		this.sort(data)
		data = this.search(data)
		this.dataSize = data.length
		this.paginate(data)
	}

	searchInput(text) {
		this.processData(null, null, text)
	}

	updateSortData(sortData: SortEvent) {
		this.sortData = sortData
		this.sortIcons[sortData.propName] = {}

		for (let siName in this.sortIcons) {
			const m = this.sortIcons[siName]
			if (m) m.showIcon = false
		}

		const icon = this.sortIcons[sortData.propName]
		if (sortData.direction === SortDirection.none) {
			icon.sortIcon = this.icons.hover
			icon.showIcon = false
		} else if (sortData.direction === SortDirection.asc) {
			icon.sortIcon = this.icons.down
			icon.showIcon = true
		} else if (sortData.direction === SortDirection.desc) {
			icon.sortIcon = this.icons.up
			icon.showIcon = true
		}
	}

	toggleSortIcon(toggle: MouseHover, propName: string) {
		if (!this.sortIcons[propName]) {
			this.sortIcons[propName] = { sortIcon: this.icons.hover }
		}

		if (!this.sortIcons[propName].sortIcon != this.icons.hover && this.sortIcons[propName].showIcon == false) {
			this.sortIcons[propName].sortIcon = this.icons.hover
		}

		if (this.sortIcons[propName].sortIcon === this.icons.hover) {
			if (toggle === MouseHover.in) this.sortIcons[propName].showIcon = true
			else if (toggle === MouseHover.out) this.sortIcons[propName].showIcon = false
		}
	}

	getItemPropertiesArray(object) {
		const array = []
		if (isString(object)) return [object]
		for (let item in object) {
			array.push(object[item])
		}
		return array
	}

	rowClickFce(data) {
		this.rowClick.emit(data)
	}

	checkboxToggle = (itemIndex: 'all' | number, val: boolean) => {
		if (isString(itemIndex)) this.checkboxToggleAll(val)
		else {
			const realIndex = itemIndex + (this.currentPage - 1) * this.pageSize
			const item = this.data[realIndex]
			item.fcs_table_selected = val
			this.checkboxChange.emit(item)
		}
		this.processData(null, null)
	}
	private checkboxToggleAll(val: boolean) {
		this.allChecked = !this.allChecked
		this.data.forEach((item) => (item.fcs_table_selected = this.allChecked))
		this.checkboxChange.emit(this.allChecked ? 'all' : 'none')
	}

	getPropName = (item: TableHeader, index) => {
		if (item && item.propName) return item.propName
		// else if (this.headerData && this.headerData.length) return this.headerNames[index]
		else {
			return index
		}
	}

	private sort(data) {
		if (!Utils.notNull(this.sortData.propName) || this.sortData.direction === '') {
			//paginate is called as next, it updates the data
			return
		}

		if (!data || !data.length) return

		// resetting other headers
		this.headersDirectiveViewChildren.forEach((header) => {
			if (header.sortData.propName !== this.sortData.propName) {
				header.direction = SortDirection.none
			}
		})

		const properties = Object.getOwnPropertyNames(data[0])

		const compareInner = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
		const compare = (a, b, col) => compareInner(a[col], b[col])
		const compareDirection = (
			a,
			b,
			col = isNaN(this.sortData.propName as any) ? this.sortData.propName : properties[this.sortData.propName]
		) => (this.sortData.direction === 'asc' ? compare(a, b, col) : compare(b, a, col))
		data = data.sort(compareDirection)
	}

	private search(data: any) {
		if (!this.searchTerm || !this.searchPropName) return data

		return data.filter(
			(m) => m[this.searchPropName] && m[this.searchPropName].toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1
		)
	}

	private paginate(data) {
		//here set processedData as it is last step
		if (this.showPagination) this.updateData(data.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize))
		else this.updateData(data)
	}

	private updateData(data: any[]) {
		this.processedData = data
		this.processedContext.rows = data
	}

	private processHeaderData() {
		if (!this.headerData || !this.headerData.length) return

		const addClass = (item: TableHeader, klass: string) => {
			if (!item.class) item.class = { [klass]: true }
			else if (isString(item.class)) item.class += ` ${klass}`
			else if (isObject(item.class)) item.class[klass] = true
			else if (isArray(item.class)) item.class.push(klass)
		}

		this.headerData
			.filter((m) => !!m.alignment)
			.forEach((item) => {
				switch (item.alignment) {
					case ColumnAlignment.left:
						addClass(item, 'text-left')
						break
					case ColumnAlignment.center:
						addClass(item, 'text-center')
						break
					case ColumnAlignment.right:
						addClass(item, 'text-right')
				}
			})
	}
}
