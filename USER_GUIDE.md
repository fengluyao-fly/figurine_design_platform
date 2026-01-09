# FigurineForge 用户指南

## 平台概述

FigurineForge 是一个AI驱动的手办定制设计平台，专为需要小批量生产（1,000-20,000件）的海外客户设计。平台提供从概念到3D模型的完整设计流程，并连接专业工厂进行生产。

## 核心功能

### 1. 项目创建
- 输入详细的手办描述（至少20个字符）
- 可选上传手绘草图（支持JPG、PNG，最大10MB）
- 系统自动保存匿名会话，无需注册

### 2. AI图像生成
- 系统自动生成3组不同的三视图设计
- 每组包含3张图片（正面、侧面、背面）
- 可以继续生成新的三视图直到满意
- 所有图片自动保存到云存储

### 3. 3D模型生成
- 选择满意的三视图后，系统自动调用Tripo AI生成3D模型
- 生成时间约2-5分钟
- 页面自动刷新显示进度
- 完成后可下载GLB格式的3D模型文件

### 4. 订单提交
- 填写联系信息（邮箱必填，电话可选）
- 描述对3D模型的修改意见
- 支付$20美元定金（通过Stripe安全支付）
- 支付成功后24小时内设计师联系

### 5. 历史记录
- 查看所有创建的项目
- 下载生成的图片和3D模型
- 追踪项目状态（草稿/生成中/已完成/已订购）

## 使用流程

### 步骤1：创建项目
1. 访问首页，点击"Start Creating"
2. 输入手办描述，例如：
   ```
   A cute anime-style figurine with blue hair, wearing a magical 
   girl outfit with star patterns. She holds a glowing staff and 
   has a cheerful expression.
   ```
3. （可选）上传手绘草图作为参考
4. 点击"Generate Designs"

### 步骤2：选择三视图
1. 等待AI生成3组三视图（约30-60秒）
2. 浏览每组设计的正面、侧面、背面视图
3. 如果不满意，点击"Generate More"继续生成
4. 选择最满意的一组，点击"Select This Design"

### 步骤3：查看3D模型
1. 系统自动生成3D模型（2-5分钟）
2. 页面显示生成进度，完成后自动刷新
3. 查看3D模型预览
4. 点击"Download 3D Model"下载GLB文件

### 步骤4：提交订单
1. 填写联系邮箱（用于接收更新）
2. 填写电话号码（可选，方便视频沟通）
3. 详细描述对3D模型的修改意见，例如：
   ```
   Please adjust the hair length to be slightly longer, 
   and make the staff more detailed with glowing effects.
   ```
4. 点击"Pay Deposit & Submit Order"
5. 在Stripe支付页面完成$20美元支付

### 步骤5：后续流程
1. **邮件确认**：立即收到订单确认邮件
2. **设计师审核**：24小时内设计师根据您的反馈修改模型
3. **视频会议**：安排实时视频通话查看修改后的模型
4. **工厂生产**：确认后连接工厂开始生产

## 支付说明

### 测试模式
当前平台处于测试模式，您可以使用以下测试卡号：
- 卡号：`4242 4242 4242 4242`
- 到期日期：任意未来日期
- CVC：任意3位数字
- 邮编：任意5位数字

### 正式支付
正式环境下：
- 支付金额：$20美元（设计定金）
- 支付方式：Stripe（支持信用卡/借记卡）
- 最低订单：$0.50美元（Stripe限制）
- 测试优惠码：99%折扣（仅限测试环境）

## API配置说明

### 必需的API密钥

#### 1. Tripo AI API Key
- **用途**：3D模型生成
- **获取方式**：
  1. 访问 https://platform.tripo3d.ai/
  2. 注册并登录账户
  3. 点击"API Keys"
  4. 生成新的API密钥（以`tsk_`开头）
- **配置位置**：Settings → Secrets → TRIPO_API_KEY
- **注意事项**：
  - 需要充值或有可用的免费额度
  - 每次生成3D模型消耗约0.1-0.2美元

#### 2. Stripe API Keys
- **用途**：支付处理
- **获取方式**：
  1. 访问 https://dashboard.stripe.com/
  2. 注册并完成KYC验证
  3. 进入"Developers" → "API keys"
  4. 复制Publishable key和Secret key
- **配置位置**：Settings → Payment
- **测试模式**：
  - 当前使用Stripe测试沙箱
  - 需要在2026-03-10前claim测试账户

#### 3. Manus Image Generation
- **用途**：AI图像生成（三视图）
- **配置**：已预配置，无需额外设置
- **限制**：每次生成9张图片（3组 x 3视图）

### 环境变量清单

系统已自动注入以下环境变量：
```
# 数据库
DATABASE_URL=<自动配置>

# 认证
JWT_SECRET=<自动配置>
OAUTH_SERVER_URL=<自动配置>

# Stripe支付
STRIPE_SECRET_KEY=<需要配置>
STRIPE_WEBHOOK_SECRET=<自动配置>
VITE_STRIPE_PUBLISHABLE_KEY=<需要配置>

# Tripo AI
TRIPO_API_KEY=<需要配置>

# S3存储
# 已自动配置，无需手动设置

# Manus内置服务
BUILT_IN_FORGE_API_KEY=<自动配置>
BUILT_IN_FORGE_API_URL=<自动配置>
```

## 技术架构

### 前端
- **框架**：React 19 + TypeScript
- **样式**：TailwindCSS 4（自定义主题）
- **路由**：Wouter
- **状态管理**：tRPC + React Query
- **UI组件**：shadcn/ui

### 后端
- **服务器**：Express 4
- **API**：tRPC 11（类型安全）
- **数据库**：MySQL/TiDB + Drizzle ORM
- **认证**：Manus OAuth（匿名会话）
- **文件存储**：S3

### 第三方服务
- **图像生成**：Manus Image Generation API
- **3D模型**：Tripo AI
- **支付**：Stripe
- **存储**：S3

## 数据库结构

### projects 表
- 存储用户创建的项目
- 包含描述、草图URL、状态等信息
- 通过sessionId追踪匿名用户

### generations 表
- 存储AI生成的图片和3D模型
- 区分类型：three_view（三视图）/ model_3d（3D模型）
- 记录是否被用户选中

### orders 表
- 存储订单信息
- 包含联系方式、修改反馈、支付状态
- 关联到对应的project

## 常见问题

### Q: 为什么我的3D模型生成失败？
A: 可能原因：
1. Tripo API密钥无效或余额不足
2. 选择的三视图质量不佳
3. 网络连接问题
解决方案：检查API密钥配置，确保账户有足够余额

### Q: 支付后多久能收到设计师联系？
A: 通常在24小时内。如果超过48小时未收到联系，请发送邮件到 support@figurineforge.com

### Q: 可以修改已提交的订单吗？
A: 在设计师开始工作前可以修改。请通过订单确认邮件中的联系方式沟通。

### Q: 生成的3D模型可以商用吗？
A: 可以。您拥有生成模型的完整使用权，包括商业用途。

### Q: 最小生产数量是多少？
A: 平台专注于1,000-20,000件的小批量生产。低于1,000件建议使用3D打印。

## 部署说明

### 发布网站
1. 确保所有API密钥已正确配置
2. 在Management UI中点击"Publish"按钮
3. 选择自定义域名或使用默认的 .manus.space 域名
4. 等待部署完成（约1-2分钟）

### 域名配置
- **默认域名**：xxx.manus.space
- **自定义域名**：在Settings → Domains中配置
- **SSL证书**：自动配置

### 监控和分析
- **访问统计**：Dashboard面板查看UV/PV
- **订单管理**：Database面板查看orders表
- **错误日志**：服务器日志自动记录

## 技术支持

### 联系方式
- **邮箱**：support@figurineforge.com
- **文档**：https://help.manus.im
- **问题反馈**：https://help.manus.im

### 开发者资源
- **代码仓库**：可通过Management UI下载
- **API文档**：
  - Tripo AI: https://platform.tripo3d.ai/docs
  - Stripe: https://stripe.com/docs
- **测试**：运行 `pnpm test` 执行单元测试

## 更新日志

### v1.0.0 (2026-01-09)
- ✅ 初始版本发布
- ✅ 完整的项目创建流程
- ✅ AI三视图生成（3组 x 3视图）
- ✅ Tripo AI 3D模型生成
- ✅ Stripe支付集成
- ✅ 订单管理系统
- ✅ 历史记录和文件下载
- ✅ Elegant科技艺术风格UI
- ✅ 响应式设计
- ✅ 匿名用户支持

## 许可证

MIT License - 您可以自由使用、修改和分发本项目。
