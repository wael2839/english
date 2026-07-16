'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-incorrect/30 bg-incorrect-bg p-6 text-center">
          <h2 className="mb-2 text-lg font-bold text-incorrect">
            {this.props.fallbackTitle ?? 'حدث خطأ غير متوقع'}
          </h2>
          <p className="mb-4 text-sm text-incorrect/80">حاول تحديث الصفحة أو العودة لاحقًا.</p>
          <Button type="button" onClick={() => this.setState({ hasError: false })}>
            إعادة المحاولة
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
