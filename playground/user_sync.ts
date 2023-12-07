import { BaseClient } from "@lark-base-open/node-sdk";

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];
const TABLEID = process.env["TABLE_ID"];


let table_a_id = "tblofVnOtmB3bkNz";
let table_b_id= "tblX4oyTPrF5UwAv";

//基准字段
type Row = {
  table_a: string;
  table_b: string;
};

let table_ab: Row[] = [{ table_a: "客户姓名", table_b: "real_name" }];


//同步字段
type Sync = {
  table_a: string;
  table_b: string;
};

let table_snyc: Sync[] = [{ table_a: "手机号码", table_b: "phone" },{ table_a: "wechat", table_b: "wechat" }];



interface Fields {
    "客户姓名"?: string;
    "手机号码"?: string;
    "wechat"?: string;
}

interface Item {
    fields: Fields;
    id: string;
    record_id: string;
}

type ItemList = Item[];


let page_token = null;
let has_more = true;
let itemList: ItemList = [];



interface Fields2 {
    "real_name"?: string;
    "phone"?: string;
    "wechat"?: string;
}

interface Item2 {
    fields: Fields2;
    id: string;
    record_id: string;
}

type ItemList2 = Item2[];



let page_token2 = null;
let has_more2 = true;
let itemList2: ItemList2 = [];

export async function sync(from: string, to: string) {
    // new BaseClient，fill appToken & personalBaseToken
    const client = new BaseClient({
        appToken: APP_TOKEN,
        personalBaseToken: PERSONAL_BASE_TOKEN,
    });


    let standard: string[] = table_ab.map(row => row.table_a);
    let sync: string[] = table_snyc.map(row => row.table_a);
    let combined: string[] = [...standard, ...sync];

    console.log('A表检索字段'${combined});

    while (has_more) {
        const res = await client.base.appTableRecord.list({
            params: {
                page_size: 400,
                field_names: combined,
                page_token: page_token,
            },
            path: {
                table_id: table_a_id,
            },
        });

        const customers: Item[] = res.data.items;

        // itemList = itemList.concat(res.data.items);

        for (const customer of customers) {
            if (!customer.fields.客户姓名 || !customer.fields.手机号码) {
                console.log(
                    `客户姓名: ${customer.fields.客户姓名}, 手机号码: ${customer.fields.手机号码}  其中一个为空，跳过执行`
                );
                continue;

            }
          itemList = itemList.concat(customer);

        }

        has_more = res.data.has_more;
        page_token = res.data.page_token;

    }
    console.log('>>> A表检索shi', JSON.stringify(itemList[0]));
    console.log('检索完A表');
  


    while (has_more2) {
        const res2 = await client.base.appTableRecord.list({
            params: {
                page_size: 400,
                field_names: '["real_name","phone"]',
                page_token: page_token2,
            },
            path: {
                table_id: table_b_id,
            },
        });


        //console.log('>>> Text fields', JSON.stringify(res2));
        itemList2 = itemList2.concat(res2.data.items);
        has_more2 = res2.data.has_more;
        page_token2 = res2.data.page_token;
        //console.log('>>> Text fields', JSON.stringify(itemList2));

    }
    console.log('检索完B表');



    let itemList1_1: ItemList2 = [];
    let itemList2_2: ItemList2 = [];

    for (const item of itemList) {
        const customerName = item.fields["客户姓名"];
        const foundItem = itemList2.find(i => customerName && customerName.includes(i.fields.real_name));


        if (foundItem) {
            //console.log("有");
            foundItem.fields.phone = item.fields["手机号码"];
            foundItem.fields.wechat = item.fields["wechat"];
            itemList2_2 = itemList2_2.concat(foundItem);

        } else {
            //console.log("无");
            let newItem: Item2 = {
                fields: {
                    real_name: customerName,
                    phone: item.fields["手机号码"],
                    wechat: item.fields["wechat"]
                },
                id: "",
                record_id: ""
            };
            // foundItem.fields.phone = item.fields["手机号码"];
            itemList1_1.push(newItem);

        }
    }

    const modifiedItemList2 = itemList2_2.map(({ id, ...rest }) => rest);
    //console.log('>>> Text fields', JSON.stringify(modifiedItemList2));

    await client.base.appTableRecord.batchUpdate({
        path: {
            table_id: table_b_id,
        },
        //data: modifiedItemList2,
        data: { records: modifiedItemList2 }
    });

    console.log("同步完B表数据");



    const modifiedItemList3 = itemList1_1.map(({ id, record_id, ...rest }) => rest);

    await client.base.appTableRecord.batchCreate({
        path: {
            table_id: table_b_id,
        },
        data: { records: modifiedItemList3 }
    });
    console.log("数据增加到B表");


    console.log("成功同步所有数据");
}
