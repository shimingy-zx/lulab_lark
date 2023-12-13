import { fetchField, fetchTableRecord, batchUpdate, batchCreate } from './lark_client';
import { processData } from './convertDate';


let TABLE_A_ID = "tblofVnOtmB3bkNz";
let TABLE_B_ID = "tblX4oyTPrF5UwAv";

// //表ID
// let TABLEID: Row[] = [{ table_a: "客户姓名", table_b: "real_name" }];

interface Row {
    table_a: string;
    table_b: string;
}

interface Field {
    [key: string]: string | undefined; // Allows for any number of additional string properties
}


interface Record {
    fields: Field;
    id: string;
    record_id: string;
}

//基准字段
let table_ab: Row[] = [{ table_a: "客户姓名", table_b: "real_name" }];

//同步字段
let table_sync: Row[] = [{ table_a: "手机号码", table_b: "phone" }, { table_a: "wechat", table_b: "wechat" }, { table_a: "抖音", table_b: "抖音" }, { table_a: "家长职务", table_b: "职务" }];


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


    //校验字段类型

    //获取A、B表所有字段

    const fields_a = await fetchField(TABLE_A_ID);
    const fields_b = await fetchField(TABLE_B_ID);

    console.log('已获取到的表A字段列表');
    console.log('已获取到的表B字段列表');
    // console.log('>>> Text fields', JSON.stringify(fields_a));
    // console.log('>>> Text fields', JSON.stringify(fields_b));



    // Function to check and remove fields
    // function filterData(records: Record[], criteria: TableAB[]): Record[] {
    //     return records.filter(record => {
    //         // Check for each criteria in table_ab
    //         return criteria.every(({ table_a }) => {
    //             // If the field exists and is not empty, keep the record
    //             return record.fields[table_a] !== undefined && record.fields[table_a] !== '';
    //         });
    //     });
    // }


    // const fields_a = filterData(fields_a1, table_ab);




    // 定义比较函数
    function compareTypes(A_id: any[], B_id: any[], table: Row[]) {
        for (const row of table) {
            const aType = A_id.find(item => item.field_name === row.table_a)?.type;
            const bType = B_id.find(item => item.field_name === row.table_b)?.type;

            if (aType !== bType) {
                throw new Error('Type mismatch');
            }
        }
    }

    // 进行比较
    compareTypes(fields_a, fields_b, table_ab);
    compareTypes(fields_a, fields_b, table_sync);
    console.log('校验完成字段类型数据');





    try {
        // 同时调用 fetchTableRecord 函数以提高效率
        const [itemList_a, itemList_b] = await Promise.all([
            fetchTableRecord(combinedFields_a, TABLE_A_ID),
            fetchTableRecord(combinedFields_b, TABLE_B_ID)
        ]);

        // 使用返回的 itemList 进行后续操作
        console.log('>>> A表检索完成，A表检索数据例子', itemList_a.slice(0, 1));
        console.log('>>> B表检索完成，B表检索数据例子', itemList_b.slice(0, 1));
        // console.log('>>> A表检索完成，A表检索数据例子', JSON.stringify(itemList_a.slice(0, 2)));
        // console.log('>>> B表检索完成，B表检索数据例子', JSON.stringify(itemList_b.slice(0, 2)));

        // 移除itemList_a&fields_b 中 'fields' 的所有 'id' 字段
        const A_List = itemList_a.map(({ id, ...rest }) => rest);
        const B_List = itemList_b.map(({ id, ...rest }) => rest);
      
        console.log('>>> A表ID字段删除完成，数据例子', A_List.slice(0, 1));
        console.log('>>> B表ID字段删除完成，数据例子', B_List.slice(0, 1));


        interface Record {
            fields: { [key: string]: string };
            record_id: string;
        }


        function syncFields(A: Record, combined_all: Row[]): Record {
            let newFields: { [key: string]: string } = {};

            // 遍历A的fields，并使用combined_all中的映射关系来修改键
            for (let key in A.fields) {
                let mapping = combined_all.find(row => row.table_a === key);
                if (mapping) {
                    newFields[mapping.table_b] = A.fields[key];
                } else {
                    newFields[key] = A.fields[key];
                }
            }

            return {
                ...A,
                fields: newFields
            };
        }



        // 第三步：进行数据匹配和处理
        let update_1: any[] = [];
        let update_2: any[] = [];

        A_List.forEach((aItem: any) => {
            const match = B_List.find((bItem: any) =>
                table_ab.every(tab => aItem.fields[tab.table_a] === bItem.fields[tab.table_b])
            );

            if (match) {
                aItem.record_id = match.record_id;
                const replacedA = syncFields(aItem, combined_all);
                update_1.push(replacedA);
            } else {
                const replacedB = syncFields(aItem, combined_all);
                const { record_id, ...recordWithoutId } = replacedB;
                update_2.push(recordWithoutId);
            }
        });
        // AB表数据对比检索完成
        console.log('>>> A表预备数据例子', update_1.slice(0, 2));
        console.log('>>> B表预备数据例子', update_2.slice(0, 2));

        // 第四步：使用 res2.ts 的函数处理数据
        const returnA = processData(update_1, fields_b);
        // console.log(returnA);
        const returnB = processData(update_2, fields_b);


        await batchUpdate(TABLE_B_ID, returnA);
        await batchCreate(TABLE_B_ID, returnB);


        console.log("成功同步所有数据");


    } catch (error) {
        console.error("发生错误:", error);
    }

}
