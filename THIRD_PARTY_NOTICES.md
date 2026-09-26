# 来源与第三方许可

本版本将 HyperFrames 制作技能、作者的制作流程补充和公开配置适配整理为可安装的技能集合。它不是 HyperFrames、Fish Audio、OpenAI、Google 或字节跳动的官方产品。

## HyperFrames

主制作、合成、动画、创意、媒体、注册表及相关工作流以 [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) 的技能结构为基础，并作了制作与审阅流程修改。上游使用 Apache License 2.0；本包保留该许可证于 `LICENSE`。本地定制包括语音与字幕流水线、导演与复查约定、空间镜头规划、版本化审阅页面，以及公开版的环境配置和自检脚本。不能将本包改动描述成上游已接受的功能。

HyperFrames CLI 是使用时由 npm 安装的独立依赖。当前项目模板固定 `hyperframes@0.7.17`；安装器 Skills CLI 的版本与渲染器版本是两回事。升级渲染器后需要重新检查项目的合成协议与渲染结果。

## GSAP

`skills/music-to-video/references/motion-primitives/assets/gsap.min.js` 是 GSAP 3.15.0，保留原文件的版权与许可证头。GSAP 使用自己的 [Standard License](https://gsap.com/standard-license/)，不因放在本包中改授 Apache-2.0。

HyperFrames 项目模板通过 npm 安装 GSAP 3.14.2；`setup-runtime.cjs` 把用户安装的运行时复制到项目 `vendor/`，并保留 npm 包内的许可证。这里两个版本分别对应已有示例和已验证的项目模板，不要求把所有示例盲目升级到同一版本。

## 字体、图片、声音与生成服务

本包没有打包作者的声音身份、登录 Cookie、私有素材库、商业配乐、项目成片或第三方人物／品牌位图。示例中的素材要求和文件名不代表随附了对应资产或使用授权。使用者自行选择有权使用的字体、声音、图片、音乐和视频，并在项目中保留来源、许可、生成参数与选择记录。

文档引用的构图、剪辑和叙事参考资料用于说明制作方法。原书、网页、商标和服务名称的权利仍属于各自权利人。外部 API、模型、插件和命令行工具遵循各自的条款与计费规则；安装技能不会附带这些账户、订阅或额度。
