import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SortableDirective } from './sortable.directive'
import { TablePaginationComponent } from './fcs-table.component'
import { FormsModule } from '@angular/forms'
import { SortIconComponent } from './sort-icon.component'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { AngularSvgIconModule } from 'angular-svg-icon'

@NgModule({
	declarations: [TablePaginationComponent, SortableDirective, SortIconComponent],
	imports: [CommonModule, FormsModule, NgbModule, AngularSvgIconModule],
	exports: [TablePaginationComponent, SortableDirective],
})
export class FcsTableModule {}
