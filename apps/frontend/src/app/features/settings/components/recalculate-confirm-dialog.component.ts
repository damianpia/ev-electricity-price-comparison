import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recalculate-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Recalculate historical data?</h2>
    <mat-dialog-content>
      You have changed pricing settings. Would you like to recalculate costs for all historical charging sessions using these new values?
      This process will run in the background.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">No, keep existing data</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>Yes, Recalculate All</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 300px;
      margin-bottom: 20px;
    }
  `]
})
export class RecalculateConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RecalculateConfirmDialogComponent>);

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
