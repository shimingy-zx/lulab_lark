// TypeScript 数据类型定义文件
//https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-structure


// 1: 多行文本、条码
type MultilineText = string; // 多行文本
type Barcode = string; // 条码

// 2: 数字（默认值）、进度、货币、评分
type Numeric = number | string; // 数字
type Progress = number | string; // 进度
type Currency = number | string; // 货币
type Rating = number | string; // 评分

// 3: 单选
type SingleChoice = string;

// 4: 多选
type MultipleChoice = string[];

// 5: 日期
type Date = number;

// 7: 复选框
type Checkbox = boolean;

// 11: 人员
interface Person {
  name: string;
  id: string;
  en_name: string;
  email: string;
}

// 13: 电话号码
type PhoneNumber = string;

// 15: 超链接
interface Hyperlink {
  text: string;
  link: string;
}

// 17: 附件
interface Attachment {
  file_token: string;
  name: string;
  type: string;
  size: number;
  url: string;
  tmp_url: string;
}

// 18: 单向关联
type SingleDirectionAssociation = string[];

// 19: 查找引用
// 未提供具体结构，可根据实际需求定义
type LookupReference = any;

// 20: 公式
// 未提供具体结构，可根据实际需求定义
type Formula = any;

// 21: 双向关联
type DoubleDirectionAssociation = any;

// 22: 地理位置
interface GeographicLocation {
  location: string;
  pname: string;
  cityname: string;
  adname: string;
  address: string;
  name: string;
  full_address: string;
}

// 23: 群组
interface Group {
  name: string;
  avatar_url: string;
  id: string;
}

// 1001: 创建时间
type CreationTime = number;

// 1002: 最后更新时间
type LastUpdateTime = number;

// 1003: 创建人
type Creator = Person;

// 1004: 修改人
type Modifier = Person;

// 1005: 自动编号
type AutoNumber = string;

// 导出所有类型
export {
  MultilineText,
  Barcode,
  Numeric,
  Progress,
  Currency,
  Rating,
  SingleChoice,
  MultipleChoice,
  Date,
  Checkbox,
  Person,
  PhoneNumber,
  Hyperlink,
  Attachment,
  SingleDirectionAssociation,
  LookupReference,
  Formula,
  DoubleDirectionAssociation,
  GeographicLocation,
  Group,
  CreationTime,
  LastUpdateTime,
  Creator,
  Modifier,
  AutoNumber
};
