import { Component } from '@angular/core';
import { ColumnEditorDropdownComponent, Column, ColumnEditorResult } from './components/column-editor-dropdown/column-editor-dropdown.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ColumnEditorDropdownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  columns: Column[] = [
    { id: '1', name: 'Location', visible: true, mandatory: true },
    { id: '2', name: 'Competition', visible: true, mandatory: true },
    { id: '3', name: 'Fixture', visible: true, mandatory: true },
    { id: '4', name: 'Start Date', visible: true, mandatory: false },
    { id: '5', name: 'Settings Level', visible: true, mandatory: false },
    { id: '6', name: 'Template', visible: true, mandatory: false },
    { id: '7', name: 'Scout', visible: true, mandatory: false },
    { id: '8', name: 'Order status', visible: true, mandatory: false },
    { id: '9', name: 'Uncovered Markets', visible: false, mandatory: false },
    { id: '10', name: 'Fixture Status', visible: false, mandatory: false },
  ];

  onApply(result: ColumnEditorResult): void {
    console.log('Applied columns:', result.columns);
    this.columns = result.columns;
  }

  onCancel(): void {
    console.log('Cancelled');
  }
}
