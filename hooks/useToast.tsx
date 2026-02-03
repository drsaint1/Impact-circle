"use client";

import { useState, useCallback } from "react";
import { ToastType } from "@/components/Toast";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message: string, duration?: number) => addToast(message, "success", duration),
    error: (message: string, duration?: number) => addToast(message, "error", duration),
    warning: (message: string, duration?: number) => addToast(message, "warning", duration),
    info: (message: string, duration?: number) => addToast(message, "info", duration),
  };

  return { toasts, toast, removeToast };
}