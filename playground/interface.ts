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

export interface Item_add {
    fields: Fields;
}

export type ItemList = Item[];

export type ItemList_b = Item_add[];


export type Row = {
    table_a: string;
    table_b: string;
};
