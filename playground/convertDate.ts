interface Field {
    [key: string]: any;
}

interface Record {
    fields: Field;
}

interface FieldDefinition {
    field_name: string;
    type: number;
}

export function transformData(data: Record[], fieldDefinitions: FieldDefinition[]): Record[] {
    const fieldTypes = new Map<string, number>();
    fieldDefinitions.forEach(def => fieldTypes.set(def.field_name, def.type));

    return data.map(record => {
        const fields = record.fields;

        for (const fieldName in fields) {
            const fieldType = fieldTypes.get(fieldName);

            if (fieldType === 2) {
                fields[fieldName] = Number(fields[fieldName]);
            } else if (fieldType === 11) {
                delete fields['en_name'];
                delete fields['email'];
                delete fields['name'];
            }
        }

        return record;
    });
}
