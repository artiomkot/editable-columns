import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Checkbox } from 'primeng/checkbox';

export interface Column {
  id: string;
  name: string;
  visible: boolean;
  mandatory: boolean;
}

export interface ColumnEditorResult {
  columns: Column[];
}

@Component({
  selector: 'app-column-editor-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, Checkbox],
  templateUrl: './column-editor-dropdown.component.html',
  styleUrl: './column-editor-dropdown.component.scss'
})
export class ColumnEditorDropdownComponent {
  @Input() set columns(value: Column[]) {
    this._originalColumns = structuredClone(value);
    this._columns.set(structuredClone(value));
  }
  
  @Output() apply = new EventEmitter<ColumnEditorResult>();
  @Output() cancel = new EventEmitter<void>();

  private _originalColumns: Column[] = [];
  private _columns = signal<Column[]>([]);
  
  searchQuery = signal('');

  /** Active (visible) columns - mandatory first, then rest */
  activeColumns = computed(() => {
    const cols = this._columns();
    const query = this.searchQuery().toLowerCase().trim();
    
    let active = cols.filter(c => c.visible);
    
    if (query) {
      active = active.filter(c => c.name.toLowerCase().includes(query));
    }
    
    // Sort: mandatory columns first, then non-mandatory
    return active.sort((a, b) => {
      if (a.mandatory && !b.mandatory) return -1;
      if (!a.mandatory && b.mandatory) return 1;
      return 0;
    });
  });

  /** Inactive (hidden) columns */
  inactiveColumns = computed(() => {
    const cols = this._columns();
    const query = this.searchQuery().toLowerCase().trim();
    
    let inactive = cols.filter(c => !c.visible);
    
    if (query) {
      inactive = inactive.filter(c => c.name.toLowerCase().includes(query));
    }
    
    return inactive;
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onColumnToggle(column: Column): void {
    if (column.mandatory) return;
    
    this._columns.update(cols => 
      cols.map(c => c.id === column.id ? { ...c, visible: !c.visible } : c)
    );
  }

  onDrop(event: CdkDragDrop<Column[]>, isActiveList: boolean): void {
    const columns = this._columns();
    
    if (isActiveList) {
      // Get all active non-mandatory columns (these are the draggable ones)
      const activeNonMandatory = columns.filter(c => c.visible && !c.mandatory);
      
      // Only allow reordering within non-mandatory active columns
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(activeNonMandatory, event.previousIndex, event.currentIndex);
        
        // Rebuild the full array: mandatory active, reordered non-mandatory active, inactive
        const mandatoryActive = columns.filter(c => c.visible && c.mandatory);
        const inactive = columns.filter(c => !c.visible);
        
        this._columns.set([...mandatoryActive, ...activeNonMandatory, ...inactive]);
      }
    } else {
      // Inactive list reordering
      const inactive = columns.filter(c => !c.visible);
      
      if (event.previousIndex !== event.currentIndex) {
        moveItemInArray(inactive, event.previousIndex, event.currentIndex);
        
        const active = columns.filter(c => c.visible);
        this._columns.set([...active, ...inactive]);
      }
    }
  }

  onReset(): void {
    this._columns.set(structuredClone(this._originalColumns));
    this.searchQuery.set('');
  }

  onApply(): void {
    this.apply.emit({ columns: this._columns() });
  }

  /** Get draggable active columns (non-mandatory only) */
  get draggableActiveColumns(): Column[] {
    return this.activeColumns().filter(c => !c.mandatory);
  }

  /** Get mandatory active columns */
  get mandatoryActiveColumns(): Column[] {
    return this.activeColumns().filter(c => c.mandatory);
  }

  trackByColumnId(index: number, column: Column): string {
    return column.id;
  }
}
