declare const process: {
  env: {
    TARO_APP_API_URL?: string;
  };
};

declare function require(moduleName: string): any;

declare module '*.png' {
  const src: string;
  export default src;
}
