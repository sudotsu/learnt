export type ItemType = "must" | "nice" | "donot";

export interface Item {
  id: string;
  text: string;
  type: ItemType;
  createdAt: number;
}

export interface Data {
  must: Item[];
  nice: Item[];
  donot: Item[];
}
