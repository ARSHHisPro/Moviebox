import { Toast } from '../types';

type ToastListener = (toasts: Toast[]) => void;

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<ToastListener> = new Set();

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l([...this.toasts]));
  }

  public show(message: string, type: Toast['type'] = 'info', title?: string, duration = 4000): string {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, message, duration };
    this.toasts.push(newToast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    return id;
  }

  public success(message: string, title?: string, duration = 4000) {
    return this.show(message, 'success', title, duration);
  }

  public error(message: string, title?: string, duration = 5000) {
    return this.show(message, 'error', title, duration);
  }

  public warning(message: string, title?: string, duration = 4000) {
    return this.show(message, 'warning', title, duration);
  }

  public info(message: string, title?: string, duration = 4000) {
    return this.show(message, 'info', title, duration);
  }

  public dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }
}

export const toast = new ToastManager();
