import { Injectable } from '@nestjs/common';

export interface TaskStatus {
  active: boolean;
  progress: number;
  total: number;
  message: string;
}

@Injectable()
export class TaskStatusService {
  private status: TaskStatus = {
    active: false,
    progress: 0,
    total: 0,
    message: '',
  };

  getStatus(): TaskStatus {
    return this.status;
  }

  startTask(total: number, message: string) {
    this.status = {
      active: true,
      progress: 0,
      total,
      message,
    };
  }

  updateProgress(progress: number) {
    this.status.progress = progress;
  }

  completeTask() {
    this.status.active = false;
    this.status.progress = this.status.total;
  }

  failTask(message: string) {
    this.status.active = false;
    this.status.message = `Error: ${message}`;
  }
}
