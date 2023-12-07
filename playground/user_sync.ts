import { BaseClient } from "@lark-base-open/node-sdk";
import { fetchAllFieldsFromTableA } from './fetchTableFields';
import { Field, ResponseData, getFieldType } from './fieldType';
import { fetchTableRecord } from './fetchTableRecord';
import { Fields } from './interface';

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];
const TABLEID = process.env["TABLE_ID"];


let TABLE_A_ID = "tblofVnOtmB3bkNz";
let TABLE_B_ID = "tblX4oyTPrF5UwAv";

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

let table_snyc: Sync[] = [{ table_a: "手机号码", table_b: "phone" }, { table_a: "wechat", table_b: "wechat" }];




export async function sync(from: string, to: string) {



    let standard_a: string[] = table_ab.map(row => row.table_a);
    let standard_b: string[] = table_ab.map(row => row.table_b);
    let sync_a: string[] = table_snyc.map(row => row.table_a);
    let sync_b: string[] = table_snyc.map(row => row.table_b);
    let combinedFields_a: string[] = [...standard_a, ...sync_a];
    let combinedFields_b: string[] = [...standard_b, ...sync_b];
    console.log('>>> A表基准字段：', JSON.stringify(standard_a));
    console.log('>>> A表同步字段：', JSON.stringify(sync_a));


    // new BaseClient，fill appToken & personalBaseToken
    const client = new BaseClient({
        appToken: APP_TOKEN,
        personalBaseToken: PERSONAL_BASE_TOKEN,
    });

    //校验字段类型
    try {
        //获取A、B表所有字段
        const [fields_a, fields_b] = await Promise.all([
            fetchAllFieldsFromTableA(TABLE_A_ID),
            fetchAllFieldsFromTableA(TABLE_B_ID)
        ]);
        // console.log('获取到的字段列表:', fields);
        // console.log('获取到的字段列表2:', fields2);

        const responseDatafields_a: ResponseData = {
            items: fields_a,
        };

        const responseDatafields_b: ResponseData = {
            items: fields_b,
        };

        // 遍历数组并比较每个基准字段的类型
        for (let i = 0; i < standard_a.length; i++) {
            const type_a = getFieldType(standard_a[i], responseDatafields_a);
            const type_b = getFieldType(standard_b[i], responseDatafields_b);

            if (type_a != type_b) {
                throw new Error(`第 ${i + 1} 个基准字段的类型不相同`);
            }
        }

        console.log('所有基准字段类型均相同');

        // 遍历数组并比较每个同步字段的类型
        for (let i = 0; i < sync_a.length; i++) {
            const type_a = getFieldType(sync_a[i], responseDatafields_a);
            const type_b = getFieldType(sync_b[i], responseDatafields_b);

            if (type_a != type_b) {
                console.log(type_a, type_b);
                throw new Error(`第 ${i + 1} 个同步字段的类型不相同`);
            }
        }

        console.log('所有同步字段类型均相同');


        try {
            // 同时调用 fetchTableRecord 函数以提高效率
            const [itemList_a, itemList_b] = await Promise.all([
                fetchTableRecord(combinedFields_a, TABLE_A_ID),
                fetchTableRecord(combinedFields_b, TABLE_B_ID)
            ]);

            // 使用返回的 itemList 进行后续操作
            console.log('>>> A表检索数据例子', itemList_a[0]);
            console.log('A表检索完成');
            console.log('>>> B表检索数据例子', itemList_b[0]);
            console.log('B表检索完成');
            // console.log("检索到的数据 A 表:", itemList_a);
            // console.log("检索到的数据 B 表:", itemList_b);


            const records: Fields[] = itemList_a;
            const table_sync: string[] = standard_a;

            // Filter out records where any of the specified fields in table_sync are empty
            const filteredRecords = records.filter(record =>
                !table_sync.some(field => !record.fields[field])
            );

            //。console.log('>>> 数据例子', JSON.stringify(filteredRecords));


            // 这里可以添加更多处理 itemList 和 itemList2 的逻辑
            // ...


            let itemList1_1: ItemList = [];
            // let itemList2_2: ItemList2 = [];


            for (const item of filteredRecords) {
                let allFieldsMatch = true;
                let tempFoundItem = null;

                for (const field of standard_a) {
                    const fieldValue = item.fields[field];
                    const correspondingField = table_ab.find(pair => pair.table_a === field).table_b;
                    const foundItemInLoop = itemList_b.find(i => fieldValue && fieldValue.includes(i.fields[correspondingField]));

                    // 如果任何一个字段没有找到匹配项，则将 allFieldsMatch 设置为 false 并跳出循环
                    if (!foundItemInLoop) {
                        allFieldsMatch = false;
                        break;
                    }else {
                      tempFoundItem = foundItemInLoop;
                    }
                }

                if (allFieldsMatch && tempFoundItem) {
                    // 所有字段都找到匹配项的处理逻辑
                    console.log("所有字段匹配");
                  
                    table_snyc.forEach(syncField => {
                        const itemFieldValue = item.fields[syncField.table_a];
                        if (itemFieldValue !== undefined) {
                              tempFoundItem.fields[syncField.table_b] = itemFieldValue;
                        }
                    });

                    itemList1_1 = itemList1_1.concat(tempFoundItem);
                    
                } else {
                    // 任何一个字段没有找到匹配项的处理逻辑
                    console.log("不是所有字段都匹配");
                }
            }
          
            console.log(itemList1_1[0]);
            

            // for (const item of filteredRecords) {
            //     const customerName = item.fields[standard_a[0]];
            //     //const customerName = item.fields[JSON.stringify(standard_a[0])];
  
            //     const foundItem = itemList_b.find(i => customerName && customerName.includes(i.fields[standard_b[0]]));


            //     if (foundItem) {
            //         console.log("有");
            //         // foundItem.fields.phone = item.fields["手机号码"];
            //         // foundItem.fields.wechat = item.fields["wechat"];
            //         // itemList2_2 = itemList2_2.concat(foundItem);

            //     } else {
            //         console.log("无");
            //         // let newItem: Item2 = {
            //         //     fields: {
            //         //         real_name: customerName,
            //         //         phone: item.fields["手机号码"],
            //         //         wechat: item.fields["wechat"]
            //         //     },
            //         //     id: "",
            //         //     record_id: ""
            //         // };
            //         // // foundItem.fields.phone = item.fields["手机号码"];
            //         // itemList1_1.push(newItem);

            //     }
            // }

            const modifiedItemList2 = itemList2_2.map(({ id, ...rest }) => rest);
            //console.log('>>> Text fields', JSON.stringify(modifiedItemList2));

            await client.base.appTableRecord.batchUpdate({
                path: {
                    table_id: TABLE_B_ID,
                },
                //data: modifiedItemList2,
                data: { records: modifiedItemList2 }
            });

            console.log("同步完B表数据");



            // const modifiedItemList3 = itemList1_1.map(({ id, record_id, ...rest }) => rest);

            // await client.base.appTableRecord.batchCreate({
            //     path: {
            //         table_id: TABLE_B_ID,
            //     },
            //     data: { records: modifiedItemList3 }
            // });
            // console.log("数据增加到B表");


            // console.log("成功同步所有数据");

          

        } catch (error) {
            console.error("发生错误:", error);
        }










    } catch (error) {
        console.error('发生错误:', error);
    }

}
