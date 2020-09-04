# NCT*UwU*
交大選課模擬器 / NCTU course selection simulator.

## Feature
- 基本模擬排課
- 將課表輸出為圖片
- 分享/匯入課表
- 使用 NCTU OAuth 登入

## How to Fork

### TL;DR
建議使用 [standalone](https://github.com/splitline/NCTUwU/tree/standalone) branch 修改。

### 細節
該 branch 中是單機版的選課模擬器，包含了最基礎的功能，理論上通用於各大學校的課程查詢。

你需要做的事：
- 修改 `config.js` 裡的 `TIME_MAPPING`。
- 自己把課程抓下來放在 `course-data/` 裡。
- 修改 `parseTime`。
- 其他看你要改什麼吧！

