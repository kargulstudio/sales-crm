import { create } from "zustand";

export type Toast = {
  id: number;
  message: string;
  undo?: () => void;
};

type ToastState = {
  toasts: Toast[];
  show: (message: string, undo?: () => void) => void;
  dismiss: (id: number) => void;
};

const MAX_TOASTS = 3;
let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, undo) =>
    set((state) => ({
      toasts: [...state.toasts, { id: nextId++, message, undo }].slice(
        -MAX_TOASTS,
      ),
    })),
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export const toast = (message: string, undo?: () => void) =>
  useToastStore.getState().show(message, undo);
