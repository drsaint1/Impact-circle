"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "info", duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-success-50",
      borderColor: "border-success-500",
      textColor: "text-success-900",
      iconColor: "text-success-500",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-error-50",
      borderColor: "border-error-500",
      textColor: "text-error-900",
      iconColor: "text-error-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-warning-50",
      borderColor: "border-warning-500",
      textColor: "text-warning-900",
      iconColor: "text-warning-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-primary-50",
      borderColor: "border-primary-500",
      textColor: "text-primary-900",
      iconColor: "text-primary-500",
    },
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div
      className={`${bgColor} ${borderColor} ${textColor} border-l-4 p-4 rounded-lg shadow-lg flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}
      role="alert"
    >
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
