# API 名称

## 概述

和 jellyfin 服务器通信

## 基础信息

-   Base URL: `http://192.168.1.222`
-   认证方式: API Key
-   数据格式: JSON

## 快速开始

1. 获取 API 密钥，userId
   在浏览器控制台得到，apikey,userId
2. 设置请求头

```
    ["X-Emby-Token"]:apikey
```

## 接口文档

### 获取内容

#### 接口说明

-   **方法**: GET
-   **路径**: /item
-   **说明**: 获取内容列表

**请求参数**:

| 参数                   | 类型   | 必须 | 说明                             |
| ---------------------- | ------ | ---- | -------------------------------- |
| startIndex             | number | 是   | 0                                |
| imageTypeLimit         | number | 是   | 1                                |
| mediaTypes             | string | 是   | Video                            |
| includeItemTypes       | string | 是   | Movie                            |
| recursive              | string | 是   | true                             |
| sortBy                 | string | 是   | DateCreated                      |
| sortOrder              | string | 是   | Descending                       |
| limit                  | number | 是   | 限制数量,默认 200                |
| enableUserData         | string | 是   | true                             |
| enableImages           | string | 是   | false                            |
| enableTotalRecordCount | string | 是   | false                            |
| userId                 | string | 是   | 8169d59d9fb049cba8cdd9c201362997 |

**响应**:

```json
items : [
	{
		Name: "SSIS-604 超鲜明4K器材拍摄！三上悠亚的丰满美体和压倒性的美颜 肉感美颜性交",
		ServerId: "a241bcb287484223ae8fa48476ceba32",
		Id: "5f29d6a74fb7bac4e0594726ba319cde",
		Container: "mkv",
		PremiereDate: "2023-03-14T00:00:00.0000000Z",
		CriticRating: 40,
		OfficialRating: "NC-17",
		ChannelId: null,
		CommunityRating: 4,
		RunTimeTicks: 87335910000,
		ProductionYear: 2023,
		IsFolder: false,
		Type: "Movie",
		UserData: {
			PlaybackPositionTicks: 0,
			PlayCount: 0,
			IsFavorite: false,
			Played: false,
			Key: "5f29d6a7-4fb7-bac4-e059-4726ba319cde",
			ItemId: "00000000000000000000000000000000",
		},
		VideoType: "VideoFile",
		ImageBlurHashes: {},
		LocationType: "FileSystem",
		MediaType: "Video",
	},
    ...
];
```

## 错误代码

## 常见问题
