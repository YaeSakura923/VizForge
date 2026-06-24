/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// VTK.js macro types
declare module 'vtk.js/Sources/*' {
  const content: any;
  export default content;
}

// Web worker module type
declare module '*?worker' {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

// WASM module type
declare module '*.wasm' {
  const content: string;
  export default content;
}
