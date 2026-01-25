"use client";

// src/components/Toast.jsx
// Toast = 화면에 잠깐 나타났다 사라지는 알림 메시지
// alert() 대신 사용하는 더 예쁘고 사용자 친화적인 방법

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-react';

// Toast 타입: success(성공), error(에러), info(정보), warning(경고)
const ToastContext = createContext(null);

// Toast Provider - 앱 전체에서 Toast를 사용할 수 있게 해주는 컴포넌트
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Toast 메시지 추가 함수
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    // duration 시간 후 자동으로 사라지게
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  // 편의 함수들 - 사용하기 쉽게
  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    info: (message) => addToast(message, 'info'),
    warning: (message) => addToast(message, 'warning'),
  };

  // Toast 제거 함수
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast 메시지들을 화면에 표시하는 영역 */}
      <div className="fixed top-20 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// 개별 Toast 아이템 컴포넌트
const ToastItem = ({ toast, onRemove }) => {
  const { message, type } = toast;

  // 타입별 스타일 설정
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle2 size={20} className="text-green-600" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle size={20} className="text-red-600" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info size={20} className="text-blue-600" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertCircle size={20} className="text-yellow-600" />,
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.text}
        border rounded-xl shadow-lg p-4 min-w-[300px] max-w-[400px]
        flex items-start gap-3 animate-in slide-in-from-right fade-in
        pointer-events-auto
      `}
    >
      <div className="shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 hover:bg-black/5 rounded transition"
      >
        <X size={16} className={style.text} />
      </button>
    </div>
  );
};

// Hook - 다른 컴포넌트에서 쉽게 사용하기 위한 함수
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context.toast;
};
