import { BaseClient } from "@lark-base-open/node-sdk";

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];
const TABLEID = process.env["TABLE_ID"];

interface RecordFields {
  姓名_en?: string;
  phone?: string;

  // 双向关联: string[];
}

interface Record {
  record_id: string;
  fields: RecordFields;
}

interface RecordArray {
  records: Record[];
}

interface CustomerData {
  fields: {
    客户姓名?: string;
    手机号码?: string;
  };
  id: string;
  record_id: string;
}

export async function sync(from: string, to: string) {
  // new BaseClient，fill appToken & personalBaseToken
  const client = new BaseClient({
    appToken: APP_TOKEN,
    personalBaseToken: PERSONAL_BASE_TOKEN,
  });

  let page_token = null;
  let has_more = true;

  // 初始化一个记录数组
  let records: RecordArray = { records: [] };

  while (has_more) {
    const res = await client.base.appTableRecord.list({
      params: {
        page_size: 100,
        field_names: '["客户姓名","手机号码"]',
        page_token: page_token,
      },
      path: {
        table_id: "tblofVnOtmB3bkNz",
      },
    });

    //console.log('>>> Text fields', JSON.stringify(res));

    const customers: CustomerData[] = res.data.items;

    for (const customer of customers) {
      // console.log(`客户姓名: ${customer.fields.客户姓名}, 手机号码: ${customer.fields.手机号码}`);

      // 如果客户姓名或手机号码为空，则跳过当前迭代
      if (!customer.fields.客户姓名 || !customer.fields.手机号码) {
        console.log(
          `客户姓名: ${customer.fields.客户姓名}, 手机号码: ${customer.fields.手机号码}  其中一个为空，跳过执行`
        );
        continue;
      }
      console.log(
        `客户姓名: ${customer.fields.客户姓名}, 手机号码: ${customer.fields.手机号码}  没有空值，继续执行`
      );

      try {
        const res2 = await client.base.appTableRecord.list({
          params: {
            page_size: 10,
            filter: `CurrentValue.[real_name]="${customer.fields.客户姓名}"`,
            field_names: '["real_name"]',
          },
          path: {
            table_id: "tblX4oyTPrF5UwAv",
          },
        });

        // 随时向记录数组中添加新的记录
        records.records.push({
          record_id: res2.data.items[0].record_id,
          fields: {
            姓名_en: "test1234",
            phone: customer.fields.手机号码,
            // 双向关联: [
            //   "recHTLvO8x",
            //   "recbS8zb3m"
            // ],
          },
        });

        console.log('>>> Text fields', JSON.stringify(records));

        await new Promise((resolve) => setTimeout(resolve, 1));
      } catch (error) {
        if (error.response && error.response.status === 429) {
          // If we hit the rate limit, wait for the time specified in the 'x-ogw-ratelimit-reset' header
          const resetTime = error.response.headers["x-ogw-ratelimit-reset"];
          await new Promise((resolve) => setTimeout(resolve, resetTime * 1000));
        } else {
          // If it's another error, just throw it
          throw error;
        }
      }

      has_more = res.data.has_more;
      page_token = res.data.page_token;
    }

    // batch update records
    await client.base.appTableRecord.batchUpdate({
      path: {
        table_id: "tblX4oyTPrF5UwAv",
      },
      data: records,
    });

    // Reset the records array for the next iteration
    records.records = [];

    console.log("success");
  }

  console.log("start");
}
