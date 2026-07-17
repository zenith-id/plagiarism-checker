declare module "scribe.js-ocr" {
  interface ScribeResult {
    text: string;
    confidence: number;
  }
  export default class ScribeOCR {
    load(): Promise<void>;
    recognize(buffer: Buffer): Promise<ScribeResult>;
  }
}

declare module "xml2js" {
  export function parseStringPromise(xml: string): Promise<any>;
}
