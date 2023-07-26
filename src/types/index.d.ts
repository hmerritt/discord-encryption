type BdApiPartial = {
  ContextMenu: any;
  DOM: any;
  Data: {
    delete: (pluginName: string, key: string) => void;
    load: (pluginName: string, key: string) => any;
    save: (pluginName: string, key: string, data: any) => void;
  };
  Patcher: any;
  Plugins: any;
  React: any;
  ReactDOM: any;
  ReactUtils: any;
  Themes: any;
  UI: any;
  Utils: any;
  Webpack: any;
  [x: string]: any;
};

declare global {
  var BdApi: BdApiPartial;
  var ZeresPluginLibrary: any;

  interface Window {
    BdApi: BdApiPartial;
    ZeresPluginLibrary: any;
  }
}

export {};
