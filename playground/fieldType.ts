
// 定义字段接口
export interface Field {
    field_id: string;
    field_name: string;
    is_primary: boolean;
    property: any;
    type: number;
    ui_type: string;
}

// 定义响应数据接口
export interface ResponseData {
    items: Field[];
}

// 查询特定字段类型的函数
export function getFieldType(fieldName: string, data: ResponseData): number | null {
    const field = data.items.find(item => item.field_name === fieldName);
    return field ? field.type : null;
}
