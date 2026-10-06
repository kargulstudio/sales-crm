interface ImportMeta {
  readonly env: { readonly DEV: boolean; readonly PROD: boolean };
}
/// <reference types="@cloudflare/workers-types" />
declare module "*.svg?react" {
  import type { FunctionComponent, SVGProps } from "react";
  const content: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default content;
}
