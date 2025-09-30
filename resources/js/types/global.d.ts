/// <reference types="vite/client" />
/// <reference types="@inertiajs/react" />

declare module '@inertiajs/react' {
  export * from '@inertiajs/react';
}

declare module '@inertiajs/core' {
  export * from '@inertiajs/core';
}

// Ensure Inertia types are available globally
declare global {
  interface Window {
    route: (name: string, params?: object) => string;
    Ziggy: {
      routes: Record<string, any>;
      defaults: Record<string, any>;
    };
  }
}

export {};