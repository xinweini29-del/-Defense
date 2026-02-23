# 新惟 (Xinwei Defense)

一个经典的塔防游戏，保卫城市免受坠落火箭的袭击。

## 部署到 Vercel

1. **上传到 GitHub**:
   - 在 GitHub 上创建一个新的仓库。
   - 将此代码推送到该仓库。

2. **在 Vercel 中导入**:
   - 登录 [Vercel](https://vercel.com)。
   - 点击 "Add New" -> "Project"。
   - 选择你的 GitHub 仓库。

3. **配置环境变量**:
   - 在 Vercel 的项目设置中，添加以下环境变量：
     - `GEMINI_API_KEY`: 你的 Google Gemini API 密钥（如果游戏逻辑中使用了 AI 功能）。

4. **部署**:
   - 点击 "Deploy"。Vercel 会自动识别 Vite 配置并进行构建。

## 本地开发

```bash
npm install
npm run dev
```

## 技术栈

- React 19
- Vite
- Tailwind CSS 4
- Motion (Framer Motion)
- Lucide React
