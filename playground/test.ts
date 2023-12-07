import { BaseClient } from "@lark-base-open/node-sdk";

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];
const TABLEID = process.env["TABLE_ID"];

export async function test(from: string, to: string) {
  // new BaseClient，fill appToken & personalBaseToken
  const client = new BaseClient({
    appToken: APP_TOKEN,
    personalBaseToken: PERSONAL_BASE_TOKEN,
  });

  //基准字段
  type Row = {
      table_a: string;
      table_b: string;
  };

  let table_ab: Row[] = [{ table_a: "客户姓名", table_b: "real_name" }];
  let standard_a: string[] = table_ab.map(row => row.table_a);











  

  // let page_token = null;
  // let has_more = true;

  // while (has_more) {
  //   const res = await client.base.appTableRecord.list({
  //     params: {
  //       page_size: 3,
  //       field_names: '["客户姓名","手机号码"]',
  //       page_token: page_token
  //     },
  //     path: {
  //       table_id: "tblofVnOtmB3bkNz",
  //     },
  //   });

  //   console.log('>>> Text fields', JSON.stringify(res));

  //   has_more = res.data.has_more;
  //   page_token = res.data.page_token;

  // }

  console.log("success");
}

console.log("start");



//console.log('>>> Text fields', JSON.stringify(res2));
//console.log(">>> Text fields", JSON.stringify(res.data.items));

// console.log('>>> Text fields', JSON.stringify(res2.data.items));



// Log the results for each name
// console.log(`>>> Text fields for ${customer.fields.客户姓名}`, JSON.stringify(res2.data));

//   await client.base.appTableRecord.update({
//     path: {
//       table_id: "tblX4oyTPrF5UwAv",
//       record_id: res2.data.items[0].record_id,
//     },
//     data: {
//       fields: {
//         姓名_en: 'test1234',
//         phone: customer.fields.手机号码
//       }
//     }
//   });
// }
