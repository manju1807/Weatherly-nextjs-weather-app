interface Window {
  gtag: (
    command: string,
    params: string,
    options?: {
      page_path?: string;
      [key: string]: string | number | boolean | object | undefined;
    },
  ) => void;
  dataLayer: Array<Record<string, unknown>>;
}
