/** Assets binaires bundlés par Metro (require → numéro de ressource RN). */
declare module '*.png' {
  const asset: number;
  export default asset;
}
