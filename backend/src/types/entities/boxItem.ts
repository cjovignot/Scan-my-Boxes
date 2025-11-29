export interface ContentItem {
  name: string;
  quantity: number;
  picture?: string;
}

export interface Box {
  _id: string;
  ownerId: string;
  storageId: string;
  number: string;
  content: ContentItem[];
  fragile: boolean;
  destination: string;
  qrcodeURL: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}
