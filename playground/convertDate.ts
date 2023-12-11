export function processData(data: any[], fieldTypeMap: Map<string, number>): any[] {
    return data.map(item => {
        const fields = item.fields;
        Object.keys(fields).forEach(fieldName => {
            const fieldType = fieldTypeMap.get(fieldName);
            switch (fieldType) {
                case 2:
                    fields[fieldName] = Number(fields[fieldName]);
                    break;
                case 11:
                case 1003:
                  case 1004:
                    delete field.en_name;
                    delete field.email;
                    delete field.name;
                    break;

                default:
                    delete item.fields;
                    break;
            }
        });
        return item;
    });
}

