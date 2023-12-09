import { BaseClient } from "@lark-base-open/node-sdk";
import { fetchAllFieldsFromTableA } from './fetchTableFields';
import { Field, ResponseData, getFieldType } from './fieldType';
import { fetchTableRecord } from './fetchTableRecord';
import { Fields } from './interface';

const APP_TOKEN = process.env["APP_TOKEN"];
const PERSONAL_BASE_TOKEN = process.env["PERSONAL_BASE_TOKEN"];


let TABLE_A_ID = "tblofVnOtmB3bkNz";
let TABLE_B_ID = "tblX4oyTPrF5UwAv"; 

// //表ID
// let TABLEID: Row[] = [{ table_a: "客户姓名", table_b: "real_name" }];

//基准字段
let table_ab: Row[] = [{ table_a: "客户姓名", table_b: "real_name" }];

//同步字段
let table_sync: Row[] = [{ table_a: "手机号码", table_b: "phone" }, { table_a: "wechat", table_b: "wechat" },{ table_a: "抖音", table_b: "抖音" }];


export async function sync(from: string, to: string) {


    let standard_a: string[] = table_ab.map(row => row.table_a);
    let standard_b: string[] = table_ab.map(row => row.table_b);
    let sync_a: string[] = table_sync.map(row => row.table_a);
    let sync_b: string[] = table_sync.map(row => row.table_b);
    let combinedFields_a: string[] = [...standard_a, ...sync_a];
    let combinedFields_b: string[] = [...standard_b, ...sync_b];
    let combined_all = [...table_ab, ...table_sync];
    console.log('>>> A表基准字段：', JSON.stringify(standard_a));
    console.log('>>> A表同步字段：', JSON.stringify(sync_a));


    // new BaseClient，fill appToken & personalBaseToken
    const client = new BaseClient({
        appToken: APP_TOKEN,
        personalBaseToken: PERSONAL_BASE_TOKEN,
    });

    //校验字段类型

        //获取A、B表所有字段
   
        const fields_a = await fetchAllFieldsFromTableA(TABLE_A_ID);
        const fields_b = await fetchAllFieldsFromTableA(TABLE_B_ID);
 
        console.log('已获取到的表A字段列表');
        console.log('已获取到的表B字段列表');
        // console.log('>>> Text fields', JSON.stringify(fields_a));
        // console.log('>>> Text fields', JSON.stringify(fields_b));

        const responseDatafields_a: ResponseData = {
            items: fields_a,
        };

        const responseDatafields_b: ResponseData = {
            items: fields_b,
        };



        function compareFieldTypes(fieldsArray, responseDataFieldsA, responseDataFieldsB, fieldType) {
            for (let i = 0; i < fieldsArray.length; i++) {
                const typeA = getFieldType(fieldsArray[i], responseDataFieldsA);
                const typeB = getFieldType(fieldsArray[i], responseDataFieldsB);

                if (typeA !== typeB) {
                    throw new Error(`字段 '${fieldsArray[i]}' 的类型不相同 (${typeA} vs ${typeB}) 在 ${fieldType} 字段的第 ${i + 1} 项`);
                }
            }
        }

        try {
            compareFieldTypes(standard_a, responseDatafields_a, responseDatafields_b, "基准");
            console.log('所有基准字段类型均相同');

            compareFieldTypes(sync_a, responseDatafields_a, responseDatafields_b, "同步");
            console.log('所有同步字段类型均相同');
        } catch (error) {
            console.error(error.message);
        }


        // // 遍历数组并比较每个基准字段的类型
        // for (let i = 0; i < standard_a.length; i++) {
        //     const type_a = getFieldType(standard_a[i], responseDatafields_a);
        //     const type_b = getFieldType(standard_b[i], responseDatafields_b);

        //     if (type_a != type_b) {
        //         throw new Error(`第 ${i + 1} 个基准字段的类型不相同`);
        //     }
        // }

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
            // console.log('>>> A表检索完成，A表检索数据例子', itemList_a[0]);
            // console.log('>>> B表检索完成，B表检索数据例子', itemList_b[0]);

            console.log('>>> A表检索完成，A表检索数据例子', JSON.stringify(itemList_a.slice(0, 30)));
            console.log('>>> B表检索完成，B表检索数据例子', JSON.stringify(itemList_b.slice(0, 30)));




            const records: Fields[] = itemList_a;
            const table_sync: string[] = standard_a;

            // Filter out records where any of the specified fields in table_sync are empty
            const filteredRecords = records.filter(record =>
                !table_sync.some(field => !record.fields[field])
            );

            //console.log('>>> 数据例子', JSON.stringify(filteredRecords));

            // 将标准字段和同步字段的映射简化为一个对象
            const fieldMapping = table_ab.reduce((map, row) => {
                map[row.table_a] = row.table_b;
                return map;
            }, {});


            let itemList1_1: ItemList = [];
            let itemList2_2: ItemList_b = [];
            let i = true;

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
                      item.record_id = foundItemInLoop.record_id;
                      tempFoundItem = foundItemInLoop;
                      if (i) {
                        console.log("tempFoundItem&item数据对比");
                        console.log(foundItemInLoop);
                        console.log(item);
                        i=false;
                      }
                      
                    }
                }

                if (allFieldsMatch && tempFoundItem) {
                    // 所有字段都找到匹配项的处理逻辑
                    //console.log("所有字段匹配");
                  
                    // 找到匹配项，更新字段
                    Object.keys(fieldMapping).forEach(aField => {
                        const bField = fieldMapping[aField];
                        if (item.fields[aField] !== undefined) {
                            tempFoundItem.fields[bField] = item.fields[aField];
                        }
                    });


                    itemList1_1 = itemList1_1.concat(tempFoundItem);
                    
                } else {
                    // 任何一个字段没有找到匹配项的处理逻辑
                    //console.log("不是所有字段都匹配");

                    let newItemFields = {};
                    combined_all.forEach(pair => {
                        // 使用combined_all中的table_b字段作为新项目字段的键
                        // 使用item.fields中对应的table_a字段作为值
                        newItemFields[pair.table_b] = item.fields[pair.table_a];
                    });

                    let newItem = {
                        fields: newItemFields
                    };

                    itemList2_2.push(newItem);
                }

            }
          
            

            const modifiedItemList1 = itemList1_1.map(({ id, ...rest }) => rest);
            console.log('>>> B表待更新数据例子', [modifiedItemList1[0],modifiedItemList1[1]]);

            await client.base.appTableRecord.batchUpdate({
                path: {
                    table_id: TABLE_B_ID,
                },
                //data: modifiedItemList2,
                data: { records: modifiedItemList1 }
            });

            console.log("同步完B表数据");



            // const modifiedItemList3 = itemList1_1.map(({ id, record_id, ...rest }) => rest);

            await client.base.appTableRecord.batchCreate({
                path: {
                    table_id: TABLE_B_ID,
                },
                data: { records: itemList2_2 }
            });
            console.log("数据增加到B表");


            console.log("成功同步所有数据");

          

        } catch (error) {
            console.error("发生错误:", error);
        }




}
