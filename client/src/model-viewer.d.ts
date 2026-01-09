import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'auto-rotate'?: boolean;
          'camera-controls'?: boolean;
          'shadow-intensity'?: string;
          exposure?: string;
          'shadow-softness'?: string;
          loading?: 'auto' | 'lazy' | 'eager';
          ar?: boolean;
          'ar-modes'?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
