import { BaseClient } from "@lark-base-open/node-sdk";

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];

// 定义返回数据结构的接口
interface FieldItem {
  field_id: string;
  field_name: string;
  is_primary: boolean;
  property: any;
  type: number;
  ui_type: string;
}

interface ResponseData {
  has_more: boolean;
  items: FieldItem[];
  page_token: string;
  total: number;
}

interface ApiResponse {
  code: number;
  data: ResponseData;
  msg: string;
}

async function fetchAllFieldsFromTableA(table_a_id: string): Promise<FieldItem[]> {



  const client = new BaseClient({
      appToken: APP_TOKEN,
      personalBaseToken: PERSONAL_BASE_TOKEN,
  });

  
  let page_token = null;
  let has_more = true;
  let itemList: FieldItem[] = [];

  while (has_more) {
    const resA: ApiResponse = await client.base.appTableField.list({
      params: {
        page_size: 100,
        page_token: page_token // 使用page_token获取下一页数据
      },
      path: {
        table_id: table_a_id,
      },
    });

    //console.log('>>> 获取A表所有字段：', JSON.stringify(resA));

    // 合并当前页的项目到itemList
    itemList = itemList.concat(resA.data.items);
    has_more = resA.data.has_more;
    page_token = resA.data.page_token;
  }

  return itemList;
}

// 导出函数以便在其他文件中使用
export { fetchAllFieldsFromTableA };
