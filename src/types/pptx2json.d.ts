declare module "pptx2json" {
  interface Slide {
    title?: string;
    texts?: string[];
    notes?: string[];
    images?: string[];
  }

  export default class PPTX2Json {
    constructor(filePath: string);
    toJson(): Promise<Slide[]>;
  }
}
