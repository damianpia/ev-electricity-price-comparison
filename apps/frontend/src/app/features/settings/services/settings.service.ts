import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalState, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

export interface SettingsMap {
  TESLAMATE_HOME_GEOFENCE_NAME: string;
  MIN_CHARGING_SESSION_KWH: number;
  DEFAULT_FIXED_ENERGY_PRICE: number;
  DEFAULT_TRANSMISSION_FEE: number;
  DEFAULT_PROVIDER_MARGIN: number;
}

export interface TaskStatus {
  active: boolean;
  progress: number;
  total: number;
  message: string;
}

interface SettingsState {
  settings: SettingsMap;
  taskStatus: TaskStatus;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/settings';
  private pollingInterval?: any;

  private readonly state = signalState<SettingsState>({
    settings: {
      TESLAMATE_HOME_GEOFENCE_NAME: 'Home',
      MIN_CHARGING_SESSION_KWH: 5,
      DEFAULT_FIXED_ENERGY_PRICE: 0.5,
      DEFAULT_TRANSMISSION_FEE: 0.43,
      DEFAULT_PROVIDER_MARGIN: 0.05
    },
    taskStatus: {
      active: false,
      progress: 0,
      total: 0,
      message: ''
    },
    isLoading: false,
    error: null,
    isSaving: false
  });

  readonly settings = this.state.settings;
  readonly taskStatus = this.state.taskStatus;
  readonly isLoading = this.state.isLoading;
  readonly error = this.state.error;
  readonly isSaving = this.state.isSaving;

  constructor() {
    this.fetchSettings();
    this.startStatusPolling();
  }

  startStatusPolling() {
    if (this.pollingInterval) return;
    this.pollingInterval = setInterval(() => this.fetchStatus(), 2000);
  }

  async fetchStatus() {
    try {
      const status = await firstValueFrom(this.http.get<TaskStatus>(`${this.apiUrl}/status`));
      patchState(this.state, { taskStatus: status });
      
      // If task was active but now it's not, refresh other data
      if (this.state.taskStatus.active() && !status.active) {
        // We could trigger a global data refresh here
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  }

  async recalculate() {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/recalculate`, {}));
      this.fetchStatus();
      return true;
    } catch (err: any) {
      return false;
    }
  }

  async fetchSettings() {
    patchState(this.state, { isLoading: true, error: null });
    try {
      const settings = await firstValueFrom(this.http.get<Record<string, string>>(this.apiUrl));
      
      patchState(this.state, { 
        settings: {
          TESLAMATE_HOME_GEOFENCE_NAME: settings['TESLAMATE_HOME_GEOFENCE_NAME'] || 'Home',
          MIN_CHARGING_SESSION_KWH: parseFloat(settings['MIN_CHARGING_SESSION_KWH'] || '5'),
          DEFAULT_FIXED_ENERGY_PRICE: parseFloat(settings['DEFAULT_FIXED_ENERGY_PRICE'] || '0.5'),
          DEFAULT_TRANSMISSION_FEE: parseFloat(settings['DEFAULT_TRANSMISSION_FEE'] || '0.43'),
          DEFAULT_PROVIDER_MARGIN: parseFloat(settings['DEFAULT_PROVIDER_MARGIN'] || '0.05')
        },
        isLoading: false 
      });
    } catch (err) {
      patchState(this.state, { error: 'Failed to load settings', isLoading: false });
    }
  }

  async updateSettings(settings: SettingsMap) {
    patchState(this.state, { isSaving: true, error: null });
    try {
      await firstValueFrom(this.http.post(this.apiUrl, settings));
      patchState(this.state, { settings, isSaving: false });
      return true;
    } catch (err: any) {
      const message = err.error?.message || 'Failed to save settings';
      patchState(this.state, { error: Array.isArray(message) ? message.join(', ') : message, isSaving: false });
      return false;
    }
  }
}
