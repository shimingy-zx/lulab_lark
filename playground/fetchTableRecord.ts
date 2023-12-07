import { BaseClient } from "@lark-base-open/node-sdk";

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];

// 定义 Item 和 ItemList 类型，根据您的实际数据结构调整这些类型
interface Fields {
    "客户姓名"?: string;
    "手机号码"?: string;
    "wechat"?: string;
    "real_name"?: string;
    "phone"?: string;
    "wechat"?: string;
}

interface Item {
    fields: Fields;
    id: string;
    record_id: string;
}

type ItemList = Item[];

/**
 * 从指定的表中检索数据
 * @param client - BaseClient 实例
 * @param combinedFields - 需要检索的字段列表
 * @param table_a_id - 要检索的表的 ID
 * @returns 返回检索到的数据列表
 */
export async function fetchTableRecord(combinedFields: string[], table_a_id: string): Promise<ItemList> {

    const client = new BaseClient({
        appToken: APP_TOKEN,
        personalBaseToken: PERSONAL_BASE_TOKEN,
    });

  
    let page_token = null;
    let has_more = true;
    let itemList: ItemList = [];

    while (has_more) {
        const res = await client.base.appTableRecord.list({
            params: {
                page_size: 400,
                field_names: JSON.stringify(combinedFields),
                page_token: page_token,
            },
            path: {
                table_id: table_a_id,
            },
        });

        itemList = itemList.concat(res.data.items);

        // 更新循环条件
        has_more = res.data.has_more;
        page_token = res.data.page_token;
    }

    return itemList;
}
