import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsService, SettingsMap } from './services/settings.service';
import { RecalculateConfirmDialogComponent } from './components/recalculate-confirm-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly settings = this.settingsService.settings;
  readonly isLoading = this.settingsService.isLoading;
  readonly isSaving = this.settingsService.isSaving;
  readonly error = this.settingsService.error;
  readonly taskStatus = this.settingsService.taskStatus;

  readonly settingsForm: FormGroup = this.fb.group({
    TESLAMATE_HOME_GEOFENCE_NAME: ['', [Validators.required]],
    MIN_CHARGING_SESSION_KWH: [0, [Validators.required, Validators.min(0)]],
    DEFAULT_FIXED_ENERGY_PRICE: [0, [Validators.required, Validators.min(0)]],
    DEFAULT_TRANSMISSION_FEE: [0, [Validators.required, Validators.min(0)]],
    DEFAULT_PROVIDER_MARGIN: [0, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    effect(() => {
      const s = this.settings();
      this.settingsForm.patchValue(s, { emitEvent: false });
    });
  }

  async onSave() {
    if (this.settingsForm.valid) {
      const current = this.settings();
      const next = this.settingsForm.value;

      const recalculationFields: (keyof SettingsMap)[] = [
        'DEFAULT_FIXED_ENERGY_PRICE',
        'DEFAULT_TRANSMISSION_FEE',
        'DEFAULT_PROVIDER_MARGIN',
        'MIN_CHARGING_SESSION_KWH'
      ];

      const needsRecalculation = recalculationFields.some(field => Number(current[field]) !== Number(next[field]));

      const success = await this.settingsService.updateSettings(next);
      if (success) {
        this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
        
        if (needsRecalculation) {
          this.promptRecalculate();
        }
      } else {
        this.snackBar.open('Failed to save settings: ' + this.error(), 'Close', { duration: 5000 });
      }
    }
  }

  private promptRecalculate() {
    const dialogRef = this.dialog.open(RecalculateConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.onRecalculate();
      }
    });
  }

  async onRecalculate() {
    const success = await this.settingsService.recalculate();
    if (success) {
      this.snackBar.open('Recalculation started in background', 'Close', { duration: 3000 });
    } else {
      this.snackBar.open('Failed to start recalculation', 'Close', { duration: 5000 });
    }
  }
}
