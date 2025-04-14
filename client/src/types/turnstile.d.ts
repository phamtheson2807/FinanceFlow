interface Turnstile {
    render: (element: HTMLElement | null, options: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback'?: (errorCode: string) => void;
    }) => void;
    reset: () => void;
  }
  
  declare global {
    interface Window {
      turnstile: Turnstile;
    }
  }
  
  export { };
