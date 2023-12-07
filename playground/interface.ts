export interface Fields {
  fields: { [key: string]: string | undefined };
  id: string;
  record_id: string;
}



export interface Item {
    fields: Fields;
    id: string;
    record_id: string;
}

export type ItemList = Item[];
