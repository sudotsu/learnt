export type ItemType = "must" | "nice" | "donot";

export interface Item {
  id: string;
  text: string;
  type: ItemType;
  group: string;
  subgroup?: string;
  createdAt: number;
}

export interface GroupDef {
  name: string;
  subgroups: string[];
}

export interface Data {
  must: Item[];
  nice: Item[];
  donot: Item[];
  groups: GroupDef[];
  lastDeleted?: Item | null;
}
