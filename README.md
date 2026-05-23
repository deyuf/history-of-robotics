# History of Robot · 机器人编年史

按八个时代追踪机器人三千年的演化——从希腊神话与江户端茶人偶，到 Unimate、ASIMO、Atlas，再到 Figure、Optimus、宇树与通用具身智能。每个事件都附原始来源；姊妹页《人形机器人特刊》（`humanoid.html`）按 53 年的人形史细化展开。

**默认语言为英文**；右上角 `EN ▾` 切换中文，`DAY` 切换暗色，`ARCHIVE ⌘K` 打开命令面板搜索任意事件、机型或人物。

## 技术栈

- 纯静态单页站点 · 无构建步骤
- `index.html` + `humanoid.html` + `styles.css` + `app.js` + `data/timeline.json` + `data/humanoid.json`
- 字体：Bricolage Grotesque（品牌大字）· Fraunces + Noto Serif SC（编辑衬线）· Inter（无衬线）· JetBrains Mono（数据/代码）
- 图表：纯 inline SVG，无外部库
- 现代浏览器特性：
  - View Transitions API（同文档与跨文档动画）
  - `<dialog>` 命令面板（⌘K / Ctrl+K / `/`）
  - CSS `animation-timeline: scroll() / view()` 滚动驱动动画
  - `text-wrap: balance` / `pretty` 排版优化
  - `@property` 类型化自定义属性
  - Speculation Rules API 预渲染姊妹页
  - `color-mix()` / `oklch()` 宽色域
  - Container Queries
- 国际化：`localStorage` 持久化语言（默认英文）与主题
- 视觉风格致敬 [historyofmarket.com](https://historyofmarket.com)：居中报头、§ 罗马数字章节、双横线分隔、mono 小字标签

## 本地开发

任何静态服务器均可：

```bash
python3 -m http.server 8080
# 或
npx serve .
```

打开 `http://localhost:8080/`。

## 部署

### GitHub Pages

`.github/workflows/pages.yml` 已配置好。推送后：

1. GitHub 仓库 → **Settings → Pages → Source: GitHub Actions**
2. workflow 把仓库根目录原样上传（`.nojekyll` 禁用 Jekyll）
3. 访问 `https://<用户名>.github.io/history-of-robot/`

### Cloudflare Pages

两种方式任选其一：

**A. Dashboard 直连（零配置）。** Cloudflare → Workers & Pages → Create application → Pages → Connect to Git。Build command 留空，Output directory `/`。完成。

**B. 通过 GitHub Actions。** `.github/workflows/cloudflare.yml` 使用 `cloudflare/wrangler-action`。在仓库 secrets 中加：

- `CLOUDFLARE_API_TOKEN`——权限 `Pages: Edit`
- `CLOUDFLARE_ACCOUNT_ID`——账户 ID

然后在 Cloudflare 创建名为 `history-of-robot` 的 Pages 项目（或修改 workflow 中的名称）。每次推送到 `main` 都会自动部署。

`_headers` 已配置缓存与安全头。

## 增补事件

编辑 `data/timeline.json` 或 `data/humanoid.json`。每条事件结构：

```jsonc
{
  "year": "1996",
  "title": "中文标题",
  "titleEn": "English title",
  "desc": "一句中文描述。",
  "descEn": "One-sentence English description.",
  "image": {                              // 可选
    "file": "Filename_on_Wikimedia_Commons.jpg",
    "credit": "作者 / 机构 / 许可",
    "alt": "alt 文本"
  },
  "sources": [
    { "label": "来源名称", "url": "https://..." }
  ]
}
```

图片使用 Wikimedia 稳定的 `Special:FilePath` 重定向，只需文件名即可。

## SEO

- `sitemap.xml`：主页 + 姊妹页 + hreflang 多语言变体
- 每页含 JSON-LD（`Article` 与 `WebSite`）结构化数据
- `<link rel="alternate" hreflang>` 标注 zh / en / x-default
- `og:image` 指向 `og.svg`（黑底报头预览图）
- `robots.txt` 引用 sitemap
- Speculation Rules 预渲染姊妹页

## 编纂原则

1. **优先原始来源**——公司官网、专利、同行评议论文、博物馆藏品
2. **二级来源限于编辑流程明确的媒体**——IEEE Spectrum、Nature、Science、MIT Technology Review、Reuters、Bloomberg、NYT
3. **图片均为公有领域或 CC 授权**，图说附作者
4. **预测/商业承诺明确标注**（"展望" / "outlook"）

## 许可

- 内容：**CC BY 4.0**——欢迎引用、翻译、二次创作，请保留来源
- 代码：MIT
- 图片：以图说为准，权利归原作者

## 贡献

欢迎 Pull Request：新增事件、修正日期、翻译、补充图片。任何事实主张请附来源。
