/**
 * 示范工程 3：可交互物理机械沙盒 - 教学剧本与认知炼金数据仓库
 * 纯原生 JS 数据模块，无外部依赖
 */
(function (root) {
  "use strict";

  // ==================== 模式 A：LLM 概率弹珠高尔顿板剧本（4 组 × 3 轮接龙） ====================
  const MODE_A_SCENARIOS = [
    {
      id: "poem",
      title: "古诗意境补全",
      badge: "文学语感 / 创意发散",
      sub: "床前明月光，疑是地上___",
      rounds: [
        {
          promptPrefix: "床前明月光，疑是地上",
          hint: "第 1 轮：强记忆语料下，‘霜’具有压倒性的高 Logit；调高温度会唤醒长尾词汇。",
          candidates: [
            { word: "霜", logit: 5.2, risk: 0, note: "高频唐诗原典记忆，概率极度集中" },
            { word: "雪", logit: 3.7, risk: 0, note: "意象高度相近，低温下偶尔出现" },
            { word: "水", logit: 2.3, risk: 1, note: "语义略平淡，破坏诗意凝练度" },
            { word: "银", logit: 1.4, risk: 0, note: "比喻月色如银，有一定文学创意" },
            { word: "盐", logit: 0.3, risk: 1, note: "视觉相似但味觉出戏" },
            { word: "猫", logit: -0.7, risk: 2, note: "典型高温漂移：语境开始脱离古诗" },
            { word: "WiFi", logit: -1.8, risk: 2, note: "时空穿越幻觉：现代词闯入盛唐" },
            { word: "外星人", logit: -2.9, risk: 2, note: "严重长尾幻觉：注意力完全失控" }
          ]
        },
        {
          promptPrefix: "；举头望",
          hint: "第 2 轮：上下文已拼接上一轮结果！如果上轮选中了荒诞词，模型会顺着错误继续合理化。",
          candidates: [
            { word: "明月", logit: 5.3, risk: 0, note: "经典对仗结构，自回归惯性极强" },
            { word: "星空", logit: 3.6, risk: 0, note: "合理现代意象替换" },
            { word: "孤云", logit: 2.5, risk: 0, note: "保留古诗格调的优雅次选" },
            { word: "天花板", logit: 1.1, risk: 1, note: "室内物理合理，但画风突变为现代" },
            { word: "山丘", logit: 0.2, risk: 1, note: "语义通顺但偏离原诗空间感" },
            { word: "路由器", logit: -0.8, risk: 2, note: "幻觉滚雪球：开始编造现代设备" },
            { word: "无人机", logit: -1.9, risk: 2, note: "高频噪音扰动导致跨时代拼接" },
            { word: "黑洞", logit: -3.0, risk: 2, note: "强行科幻化，完全破坏原始文本任务" }
          ]
        },
        {
          promptPrefix: "，低头思",
          hint: "第 3 轮：收尾句！观察 3 轮累计之后，原本庄重的诗句是否滑向离谱故事。",
          candidates: [
            { word: "故乡", logit: 5.4, risk: 0, note: "精准闭环原诗情感" },
            { word: "亲人", logit: 3.8, risk: 0, note: "同义替换，语义完整" },
            { word: "旧梦", logit: 2.4, risk: 0, note: "文学性改写，创意尚可" },
            { word: "晚饭", logit: 0.9, risk: 1, note: "生活气息过重，诗意崩塌" },
            { word: "房贷", logit: -0.3, risk: 2, note: "当代焦虑硬接古诗，荒诞搞笑" },
            { word: "显卡", logit: -1.4, risk: 2, note: "语境污染后的无厘头输出" },
            { word: "外星坐标", logit: -2.4, risk: 2, note: "多轮自回归幻觉连锁反应" },
            { word: "代码Bug", logit: -3.3, risk: 2, note: "彻底幻觉：角色设定崩坏" }
          ]
        }
      ]
    },
    {
      id: "science",
      title: "科学常识推理",
      badge: "严谨事实 / 低温度刚需",
      sub: "水在标准大气压下的沸点是___",
      rounds: [
        {
          promptPrefix: "水在标准大气压下的沸点是 ",
          hint: "第 1 轮：科学事实类问答需要极低 Temperature (≤0.3) 与窄 Top-K，杜绝胡说。",
          candidates: [
            { word: "100℃", logit: 5.5, risk: 0, note: "标准物理精确答案" },
            { word: "一百度", logit: 4.1, risk: 0, note: "口语化等价表达" },
            { word: "373.15K", logit: 2.6, risk: 0, note: "热力学温标等价，更学术" },
            { word: "99.97℃", logit: 1.3, risk: 0, note: "1990国际温标定义细节，极为严谨" },
            { word: "80℃", logit: -0.2, risk: 2, note: "典型数字幻觉：与高海拔或酒精混淆" },
            { word: "零下五度", logit: -1.4, risk: 2, note: "物理常识完全错误" },
            { word: "液态氮", logit: -2.3, risk: 2, note: "概念错乱：把温度答成物质" },
            { word: "量子态", logit: -3.2, risk: 2, note: "伪科学黑话幻觉" }
          ]
        },
        {
          promptPrefix: "；如果登上青藏高原，沸点会 ",
          hint: "第 2 轮：因果推理衔接。注意高温如何让模型丢掉‘气压降低’这一前置条件。",
          candidates: [
            { word: "降低", logit: 5.2, risk: 0, note: "准确因果推理：气压低→沸点降" },
            { word: "下降至约85℃", logit: 3.9, risk: 0, note: "带有经验估算的高价值答案" },
            { word: "变低", logit: 2.7, risk: 0, note: "口语化但科学正确" },
            { word: "保持不变", logit: 0.4, risk: 2, note: "忽视海拔变量导致事实错误" },
            { word: "升高", logit: -0.6, risk: 2, note: "因果方向完全说反（常见AI幻觉）" },
            { word: "直接结冰", logit: -1.6, risk: 2, note: "混淆沸点与凝固点" },
            { word: "变成黄金", logit: -2.6, risk: 2, note: "炼金术级别荒诞幻觉" },
            { word: "瞬移消失", logit: -3.4, risk: 2, note: "高温下语义彻底发散" }
          ]
        },
        {
          promptPrefix: "，因为高原上的空气 ",
          hint: "第 3 轮：检验归因链条是否与前两轮自洽。",
          candidates: [
            { word: "稀薄且气压低", logit: 5.3, risk: 0, note: "完整闭合热力学解释" },
            { word: "压强更小", logit: 3.8, risk: 0, note: "核心物理量表述准确" },
            { word: "氧气和密度更低", logit: 2.2, risk: 1, note: "提到稀薄但重点略偏至氧气" },
            { word: "温度很冷", logit: 0.3, risk: 1, note: "混淆环境气温与沸点决定因素" },
            { word: "重力翻倍", logit: -1.0, risk: 2, note: "强行捏造不存在的物理机制" },
            { word: "会唱歌", logit: -2.0, risk: 2, note: "拟人化幻觉污染科学文本" },
            { word: "含糖量过高", logit: -3.0, risk: 2, note: "毫无关联的荒诞归因" },
            { word: "被WiFi屏蔽", logit: -3.9, risk: 2, note: "彻底胡诌" }
          ]
        }
      ]
    },
    {
      id: "code",
      title: "代码自动补全",
      badge: "工程语法 / 精准与安全",
      sub: "async function fetchUser(id) { const res = await ___",
      rounds: [
        {
          promptPrefix: "async function fetchUser(id) { const res = await ",
          hint: "第 1 轮：代码生成最怕‘造不存在的函数名’(API 幻觉)，必须压低温度。",
          candidates: [
            { word: "fetch(`/api/users/${id}`)", logit: 5.3, risk: 0, note: "浏览器标准 Fetch API，零幻觉" },
            { word: "apiClient.getUser(id)", logit: 3.8, risk: 0, note: "常见工程封装调用" },
            { word: "axios.get(`/users/${id}`)", logit: 2.6, risk: 0, note: "常见第三方库风格（需已安装）" },
            { word: "db.users.findById(id)", logit: 1.3, risk: 1, note: "前后端混用风险：像服务端ORM" },
            { word: "Promise.resolve(null)", logit: 0.2, risk: 1, note: "逻辑空转，属于无效占位" },
            { word: "sleep(9999)", logit: -1.0, risk: 2, note: "毫无意义的阻塞调用" },
            { word: "eval(id)", logit: -2.1, risk: 2, note: "高危安全漏洞幻觉" },
            { word: "coffee.brew(id)", logit: -3.1, risk: 2, note: "幻觉造库：虚构不存在的模块" }
          ]
        },
        {
          promptPrefix: "; return res.",
          hint: "第 2 轮：属性访问补全。高温时模型最容易编造根本不存在的方法名！",
          candidates: [
            { word: "json()", logit: 5.2, risk: 0, note: "匹配标准 fetch Response 对象" },
            { word: "data", logit: 3.9, risk: 0, note: "常见封装响应属性" },
            { word: "ok ? res.json() : null", logit: 2.4, risk: 0, note: "更健壮的防御性写法" },
            { word: "text()", logit: 1.0, risk: 1, note: "返回纯文本，调用方可能解析失败" },
            { word: "status", logit: -0.2, risk: 1, note: "只返回状态码，丢失用户数据" },
            { word: "undefined", logit: -1.1, risk: 2, note: "语法报错级补全" },
            { word: "dropAllTables()", logit: -2.2, risk: 2, note: "危险幻觉方法" },
            { word: "summonDragon()", logit: -3.2, risk: 2, note: "纯属虚构的魔幻方法名" }
          ]
        },
        {
          promptPrefix: "; } // 错误处理建议：",
          hint: "第 3 轮：工程注释建议生成，观察模型是否会顺着坏代码给出离谱建议。",
          candidates: [
            { word: "外层包裹 try-catch 并校验 res.ok", logit: 5.1, risk: 0, note: "生产级最佳实践" },
            { word: "配置 AbortController 超时取消", logit: 3.7, risk: 0, note: "高质量资深工程师建议" },
            { word: "返回兜底默认空对象", logit: 2.3, risk: 0, note: "合理的降级策略" },
            { word: "忽略报错继续运行", logit: 0.1, risk: 1, note: "反模式建议，埋下隐蔽 Bug" },
            { word: "console.log('祈祷别挂')", logit: -1.1, risk: 2, note: "段子化输出，不能入库" },
            { word: "直接重启用户电脑", logit: -2.2, risk: 2, note: "荒谬工程方案" },
            { word: "把密码打印到控制台", logit: -3.1, risk: 2, note: "严重安全合规事故建议" },
            { word: "改行去卖烤冷面", logit: -3.9, risk: 2, note: "彻底脱轨" }
          ]
        }
      ]
    },
    {
      id: "history",
      title: "历史事实问答",
      badge: "幻觉高发区 / 张冠李戴",
      sub: "秦始皇统一六国后，派大将蒙恬北击___",
      rounds: [
        {
          promptPrefix: "秦始皇统一六国后，派大将蒙恬北击 ",
          hint: "第 1 轮：历史问答最常出现‘时代穿越’(如把唐代的突厥安在秦朝头上的平滑幻觉)。",
          candidates: [
            { word: "匈奴", logit: 5.4, risk: 0, note: "史实准确（《史记·蒙恬列传》）" },
            { word: "胡人", logit: 3.6, risk: 0, note: "泛称，符合秦汉史籍习惯" },
            { word: "东胡部落", logit: 1.9, risk: 1, note: "偏指东北方向，略微失准" },
            { word: "突厥", logit: 0.8, risk: 2, note: "经典时代穿越幻觉！突厥兴起于南北朝" },
            { word: "罗马军团", logit: -0.6, risk: 2, note: "东西方时空错位" },
            { word: "拿破仑", logit: -1.7, risk: 2, note: "跨越两千年的荒诞混搭" },
            { word: "克苏鲁", logit: -2.6, risk: 2, note: "科幻小说概念入侵正史" },
            { word: "赛博坦星人", logit: -3.5, risk: 2, note: "极端胡诌" }
          ]
        },
        {
          promptPrefix: "，并主持修筑了著名的 ",
          hint: "第 2 轮：注意中段词‘灵渠’‘阿房宫’看似很历史，实则属于经典‘张冠李戴型幻觉’！",
          candidates: [
            { word: "万里长城", logit: 5.4, risk: 0, note: "史实准确：连接战国秦赵燕长城" },
            { word: "秦直道", logit: 3.7, risk: 0, note: "硬核史实：咸阳至九原军事高速路" },
            { word: "灵渠", logit: 1.7, risk: 2, note: "张冠李戴幻觉！灵渠在广西，乃史禄所修" },
            { word: "阿房宫", logit: 0.6, risk: 2, note: "事实错误：非蒙恬北疆工程" },
            { word: "埃菲尔铁塔", logit: -1.1, risk: 2, note: "跨国跨时代幻觉" },
            { word: "死星轨道站", logit: -2.2, risk: 2, note: "星战梗乱入" },
            { word: "海底隧道", logit: -3.0, risk: 2, note: "地理与工程双重虚构" },
            { word: "量子对撞机", logit: -3.7, risk: 2, note: "荒诞穿越" }
          ]
        },
        {
          promptPrefix: "，这一工程主要用于 ",
          hint: "第 3 轮：检验整句历史叙述最终落在严谨史观还是荒诞小说里。",
          candidates: [
            { word: "防御北方游牧民族南下", logit: 5.3, risk: 0, note: "核心历史功能完全准确" },
            { word: "快速调兵与巩固边疆", logit: 3.8, risk: 0, note: "军事后勤视角，准确严谨" },
            { word: "发展西北边境旅游", logit: 0.4, risk: 2, note: "现代视角强行植入古代动机" },
            { word: "拦截陨石撞击", logit: -1.1, risk: 2, note: "科幻化解释" },
            { word: "接收外星电报", logit: -2.2, risk: 2, note: "阴谋论风格幻觉" },
            { word: "给兵马俑充电", logit: -3.1, risk: 2, note: "彻底段子化" },
            { word: "举办冬奥会", logit: -3.8, risk: 2, note: "时代错乱" },
            { word: "阻挡哥斯拉", logit: -4.2, risk: 2, note: "魔幻收尾" }
          ]
        }
      ]
    }
  ];

  // ==================== 模式 B：认知炼金炉（4 陌生硬核领域 × 4 个人视角） ====================
  const MODE_B_PERSPECTIVES = [
    {
      id: "designer",
      name: "视觉设计师",
      tag: "审美转译 · 信息降噪",
      desc: "擅长把冰冷复杂的科技黑箱变成让人一眼看懂、甚至产生情感共鸣的视觉产品。"
    },
    {
      id: "teacher",
      name: "高中老师",
      tag: "知识降维 · 教学结构",
      desc: "最懂普通人卡在哪个概念断层，擅长设计‘15分钟看懂’的互动教具与训练营。"
    },
    {
      id: "finance",
      name: "金融审计师",
      tag: "账本合规 · 风险定价",
      desc: "能一眼看穿新技术的成本结构、保险缺口、欺诈漏洞与谁愿意真金白银买单。"
    },
    {
      id: "gamer",
      name: "资深游戏策划",
      tag: "心流机制 · 反馈激励",
      desc: "擅长用任务系统、即时反馈和积分排行榜改造枯燥痛苦的真实行业流程。"
    }
  ];

  const MODE_B_DOMAINS = [
    {
      id: "synthetic_bio",
      name: "合成生物学",
      short: "基因回路 / 无细胞工厂",
      jargons: [
        { term: "CRISPR 基因回路", plain: "把细胞变成能跑 if-else 逻辑的微型生物计算机" },
        { term: "无细胞表达体系", plain: "把细胞核里的流水线拆出来放进试管，免去养活细菌的麻烦" },
        { term: "代谢通量优化", plain: "给细胞里的化工厂拓宽堵车的公路，多产目标分子" }
      ],
      essences: [
        { title: "物理本质 01｜DNA 就是可编程的代码", body: "ATGC 碱基序列本质上是四进制存储介质，合成生物学就是用标准零件拼出能自我复制的微型化工厂。" },
        { title: "物理本质 02｜最大的卡点不是‘改基因’，是‘试错太慢’", body: "湿实验培养一次菌落要好几天，谁能把仿真、实验排期和失败归因缩短一半，谁就卡住咽喉。" },
        { title: "物理本质 03｜离开实验室走进消费端，靠的是安全叙事", body: "大众听见‘基因改造’就害怕，但听见‘零动物伤害胶原蛋白’或‘精准益生菌’就会主动买单。" }
      ],
      socraticSteps: [
        { q: "第1问 · 撕掉黑话外衣", a: "如果把基因编辑菌株看成‘用糖水做原料的微型酿酒作坊’，它真正在卖什么？不是技术名词，而是比化工合成更便宜、更环保的特定分子（香料/护肤肽/医药中间体）。" },
        { q: "第2问 · 锁定反常识瓶颈", a: "科学家并不缺发表论文的新菌株，真正痛苦的是：设计好序列后，90%的时间花在手工填表、清洗报错数据、向投资人解释这个分子到底值多少钱。" },
        { q: "第3问 · 72小时跨界切口", a: "你完全不需要买一台价值百万的基因合成仪！你可以用开源生物数据库 + AI 解析，专门服务中小实验室或美妆品牌的新原料故事与验证看板。" }
      ],
      pains: [
        { forId: "designer", title: "科研工具极其丑陋反人类，美妆/食品甲方看不懂分子价值", body: "科学家用上世纪90年代的灰色软件画质粒图，投资人和品牌方看了直接昏昏欲睡，严重耽误融资与商业转化。" },
        { forId: "teacher", title: "跨学科人才断层：学软件的不懂细胞，学生物的不会写代码", body: "高校课本滞后5年，高中生与转行者被一堆拉丁文和缩写吓退，极缺可视化、可拖拽的入门实验沙盒。" },
        { forId: "finance", title: "研发管线烧钱黑箱，投资人和保险公司无法评估量产良率风险", body: "一个菌株从摇瓶放大到10吨发酵罐常出现‘放大死’，金融端缺乏按里程碑核验研发真实性的审计工具。" },
        { forId: "gamer", title: "科研试错周期长、失败率极高，研究员每天面对枯燥移液", body: "做100次菌落筛选99次失败，团队极度缺乏多轮迭代的成就感与众包探索‘蛋白质折叠/序列组合’的机制。" }
      ]
    },
    {
      id: "bci",
      name: "脑机接口",
      short: "柔性电极 / 意念解码",
      jargons: [
        { term: "局部场电位 (LFP)", plain: "大脑神经元群聊时发出的低频合唱电波" },
        { term: "柔性聚酰亚胺电极", plain: "像保鲜膜一样软的微米级探针，插进脑组织不划伤细胞" },
        { term: "运动意图解码器", plain: "把脑电波翻译成鼠标坐标或机械臂指令的 AI 翻译官" }
      ],
      essences: [
        { title: "物理本质 01｜本质是极其微弱信号的降噪与翻译", body: "脑电信号只有微伏级（百万分之一伏），眨一下眼、咬一下牙都是巨大噪声，核心矛盾是信噪比。" },
        { title: "物理本质 02｜硬件趋同，真正差异在于‘个性化校准体验’", body: "每个人的大脑沟回和电波指纹都不一样，戴上设备前20分钟枯燥的校准决定用户会不会把它扔进抽屉。" },
        { title: "物理本质 03｜医疗之外，非侵入式注意力/睡眠闭环才是大市场", body: "开颅手术只服务极少数重症患者，而千万级亚健康人群正需要轻量头环配合呼吸与声音实时调节脑疲劳。" }
      ],
      socraticSteps: [
        { q: "第1问 · 撕掉黑话外衣", a: "别被科幻电影吓住，民用脑机接口本质上就是‘戴在头上的心率手表’，只不过它读的不是心跳，而是你的专注力、焦虑度和困倦信号。" },
        { q: "第2问 · 锁定反常识瓶颈", a: "现在便宜的消费级脑电头环只要几百块且开源 SDK 齐全，为什么没人天天戴？因为 App 里只有一根干巴巴晃动的折线，普通人根本不知道看它干嘛！" },
        { q: "第3问 · 72小时跨界切口", a: "不用研发芯片！直接采购现成百元级单通道 EEG 头环或借用其公开数据流，72小时内只做一个解决特定人群闭环体验的上层应用层。" }
      ],
      pains: [
        { forId: "designer", title: "脑电可视化全是医院心电图风格，戴出门像刚做完手术", body: "现有的脑机 App 界面充满冰冷的波形图和临床参数，普通消费者看了既焦虑又毫无审美愉悦感。" },
        { forId: "teacher", title: "青少年专注力训练缺乏客观反馈，家长和学生天天互相内耗", body: "老师和家长嘴上喊‘专心点’，但孩子根本感知不到自己何时进入心流、何时大脑过载。" },
        { forId: "finance", title: "高危工种（如长途司机、交易员）疲劳驾驶与情绪失控缺乏量化风控", body: "单靠摄像头识别闭眼太晚了，在操作失误前10分钟预警神经疲劳能直接帮保险公司和车队省下巨额赔付。" },
        { forId: "gamer", title: "康复训练和脑电校准枯燥到让患者/用户三天就放弃", body: "让中风患者盯着屏幕想象‘右手握拳’重复500次是折磨，急需用游戏化多巴胺机制包装大脑训练。" }
      ]
    },
    {
      id: "space_debris",
      name: "太空碎片抓捕",
      short: "近地轨道清道夫 / 柔顺臂",
      jargons: [
        { term: "凯斯勒综合征", plain: "太空垃圾撞垃圾产生更多碎片，最后把地球锁死在垃圾壳里" },
        { term: "非合作翻滚目标", plain: "一颗彻底断电、正在每秒乱转好几圈的报废卫星" },
        { term: "电动力绳系离轨", plain: "给垃圾拖一条通电长尾巴，借地球磁场刹车让它掉进大气层烧毁" }
      ],
      essences: [
        { title: "物理本质 01｜轨道上是零重力下的角动量守恒噩梦", body: "卫星碎片以每秒7.8公里狂奔且胡乱翻滚，硬碰硬去抓只会把双方一起撞碎。" },
        { title: "物理本质 02｜抓捕动作只有几分钟，前期决策模拟要算几个月", body: "卫星发射一次成本上千万，地面数字孪生仿真、碰撞风险定价和轨道预测才是高频刚需。" },
        { title: "物理本质 03｜商业模式的核心不是‘环保’，是‘卫星保险与轨道牌照’", body: "没有商业公司白花钱捡垃圾，真正驱动付费的是避免现役高价值通信卫星被撞毁以及监管强制要求。" }
      ],
      socraticSteps: [
        { q: "第1问 · 撕掉黑话外衣", a: "太空碎片抓捕其实就像‘高速公路上的拖车公司+交警雷达’，只不过速度变成了子弹的十倍，一旦剐蹭整条车道都报废。" },
        { q: "第2问 · 锁定反常识瓶颈", a: "造机械臂的火箭公司最头疼的不是造不出钳子，而是地面仿真与大众理解断层、以及商业卫星运营商算不清买一次避碰/清理服务到底划不划算。" },
        { q: "第3问 · 72小时跨界切口", a: "调用公开的 Space-Track / CelesTrak 卫星轨道 TLE 开源数据，你不需要造火箭，就能做出面向特定买家的轨道风险产品或互动工具。" }
      ],
      pains: [
        { forId: "designer", title: "航天轨道态势监控屏晦涩难懂，决策者在密密麻麻参数中迷失", body: "地面控制室的大屏全是绿色数字矩阵和复杂坐标，极难直观表达两颗卫星在12小时后的碰撞概率与交会姿态。" },
        { forId: "teacher", title: "物理课本讲万有引力全是枯燥公式，学生根本感受不到轨道力学之美", body: "学生永远记不住第一宇宙速度和霍曼转移轨道，如果能直接拖拽卫星躲避垃圾，学习热情直接拉满。" },
        { forId: "finance", title: "商业卫星险精算模型极其粗糙，轨道拥挤导致保费暴涨且赔付纠纷多", body: "卫星运营商买保险时缺少实时‘轨道交通拥挤指数’与碰撞责任归因审计报告，金融定价严重滞后。" },
        { forId: "gamer", title: "太空清理研发周期太长，民间极客缺乏参与轨道策略优化的渠道", body: "其实如何在有限燃料下一次性规划抓捕5个翻滚碎片，本质上是一个极佳的硬核策略解谜问题。" }
      ]
    },
    {
      id: "ai_exoskeleton",
      name: "AI 银发外骨骼",
      short: "助老肌电动力服 / 轻量化",
      jargons: [
        { term: "sEMG 表面肌电传感", plain: "贴在皮肤上的贴片，比肌肉实际发力提前几十毫秒感知你想抬腿" },
        { term: "柔性鲍登线驱动", plain: "像自行车刹车线一样把沉重电机背在腰上，只把拉力传到膝盖" },
        { term: "人机共融阻尼控制", plain: "走路时顺滑助力不抢步子，快摔倒的瞬间立刻锁死关节当拐杖" }
      ],
      essences: [
        { title: "物理本质 01｜老人拒绝的不是辅助，是‘看起来像个病人’", body: "硬邦邦像钢铁侠一样的金属架会让老人在社区里感到羞耻；像护膝一样能藏进裤腿里的柔性结构才会被穿出门。" },
        { title: "物理本质 02｜硬件电机已白菜价，难的是理解老人的步态习惯", body: "每位老人的膝盖退化、左右脚不对称程度都不同，需要 AI 在走路前几天默默学习专属步态曲线。" },
        { title: "物理本质 03｜买单的是焦虑的子女与养老院，使用者却是抗拒复杂的老人", body: "这是一个典型的‘购买者 ≠ 使用者’市场，产品必须零按键让老人穿脱，同时给远方子女看懂的数据。" }
      ],
      socraticSteps: [
        { q: "第1问 · 撕掉黑话外衣", a: "别只盯着科幻机甲，银发外骨骼的本质就是‘装了微型电机和AI大脑的智能秋裤/护膝’，目标就一个：帮老人多买十年独立出门买菜的尊严。" },
        { q: "第2问 · 锁定反常识瓶颈", a: "目前国内很多外骨骼创业公司硬件做得很好，却卖不动：因为产品说明书像工程手册、老年人穿戴5分钟就放弃、子女买了怕吃灰。" },
        { q: "第3问 · 72小时跨界切口", a: "用手机摄像头姿态估计（MediaPipe）或开源 IMU 传感器数据即可切入步态分析、适老化穿戴体验改造或养老机构租赁算账。" }
      ],
      pains: [
        { forId: "designer", title: "外骨骼外观充满冰冷工业机械感，老人一穿觉得像‘被绑上支架’", body: "外露电线和警示黄黑条纹触发严重的病耻感，急需结合服装剪裁、隐藏式交互与温和亲切的老年人界面。" },
        { forId: "teacher", title: "物理治疗师人手严重不足，老人买回家后根本学不会正确调节步态模式", body: "养老院护工文化程度有限，面对复杂康复仪器的几十个参数直接懵圈，急需语音陪伴式傻瓜引导课程。" },
        { forId: "finance", title: "一台万元级外骨骼家庭购买决策重，但养老院按次租赁缺风控账本", body: "子女担心买完吃灰，厂家不敢赊账给养老院；如果按‘安全行走步数+防跌倒减保费’做分期审计就能引爆铺货。" },
        { forId: "gamer", title: "老人术后肌力恢复枯燥痛苦，每天走300米就像上刑场", body: "没有及时鼓励和成就感，老人容易因怕疼而拒绝下床，进而肌肉萎缩更快，极度需要温和有尊严的激励系统。" }
      ]
    }
  ];

  // 4 × 4 交叉化学反应立项卡矩阵
  const MODE_B_MATRIX = {
    synthetic_bio: {
      designer: {
        code: "UNICORN-BIO-DES",
        name: "BioStory Studio · 生物活性分子视觉叙事工坊",
        pitch: "用实时 3D 交互画布替代灰暗的科研软件，帮合成生物公司把‘看不见的发酵菌株’翻译成让美妆品牌和消费者秒懂的透明故事卡。",
        leverage: "开源蛋白结构预览 (Mol* 轻量封装) + AI 科普文案转译工作流 + 可视化交互网页模板",
        mvp72h: "第1天找3家国产活性肽/玻色因原料厂的官网折页痛点；第2天为其中1款原料做出1个可旋转查看的‘分子功效互动页’；第3天直接发给市场总监演示拿试点订单。",
        monetization: "向新锐美妆品牌/合成生物初创收取定制互动产品页与招商视觉包费用（单案 ¥8,000~¥25,000）。"
      },
      teacher: {
        code: "UNICORN-BIO-EDU",
        name: "CellCraft Lab · 零基础基因回路虚拟拼装营",
        pitch: "把高中生物课本里死记硬背的启动子、核糖体变成像乐高一样可拖拽试错的网页沙盒，培养下一代生物极客。",
        leverage: "开源生物零件库 (iGEM Registry 精选) + 浏览器端简化规则引擎 + AI 苏格拉底助教",
        mvp72h: "第1天设计‘让大肠杆菌在遇到重金属时发绿光’这1个关卡脚本；第2天用网页做成可点击的4步拼装小教具；第3天在生物老师社群招募20名高中生内测并收费开99元周末营。",
        monetization: "面向国际学校/竞赛生（iGEM/USABO）售卖高阶互动训练营（¥299/期）及校本选修课工具箱。"
      },
      finance: {
        code: "UNICORN-BIO-FIN",
        name: "FermentAudit · 生物制造放大良率风控精算台",
        pitch: "帮关注合成生物赛道的投资人与保险机构，用标准化的发酵成本与放大衰减指标，30分钟给一个实验室菌株做真实商业体检。",
        leverage: "公开原料市场价格爬虫 + AI 文献/专利良率提取管道 + 单位经济效益(UE)敏感性模型",
        mvp72h: "第1天整理5个热门合成生物品类的历史成本坍塌曲线；第2天搭建一个输入‘滴度/转化率/提取成本’自动报警亏损风险的审计表单工具；第3天发给2位硬科技VC分析师试用收集反馈。",
        monetization: "面向早期硬科技基金及产业园区提供尽调 SaaS 年费与单次项目技术经济评估报告。"
      },
      gamer: {
        code: "UNICORN-BIO-GAM",
        name: "BioTycoon · 细胞化工厂硬核策略模拟器",
        pitch: "把枯燥的‘代谢通量平衡’做成一款像《异星工厂》一样上头的网页经营游戏，同时收集玩家高分策略反哺真实生物路径灵感。",
        leverage: "轻量 Canvas 路径流模拟 + 真实代谢通路简化数值表 + 全球排行榜",
        mvp72h: "第1天把细胞吃糖产香兰素抽象成6个节点+3种酶的资源管道；第2天做出可玩10分钟的网页 Demo（平衡散热、毒副产物和产量）；第3天发布到独立游戏社区与生物学生论坛测留存。",
        monetization: "Steam/网页买断制 + 与生物科普馆或合成生物企业联名举办‘最优菌株设计大赛’赞助费。"
      }
    },
    bci: {
      designer: {
        code: "UNICORN-BCI-DES",
        name: "AuraWave · 情绪光影脑电氛围伴侣",
        pitch: "彻底抛弃医院心电图折线，把消费级脑环读取的专注与放松信号，实时渲染成极简治愈的桌面光影艺术与声音雕塑。",
        leverage: "WebBluetooth 直连百元级开源 EEG 头环 + WebGL/Canvas 流体光效 + 自适应白噪音引擎",
        mvp72h: "第1天借/买1个入门脑环并用模拟信号流写好驱动适配；第2天设计3套‘深海呼吸引导光影’视觉皮肤；第3天录30秒冥想变色短视频在小红书测试预约量。",
        monetization: "付费买断桌面端艺术软件（¥68）+ 与智能硬件厂商合作预装主题包分成。"
      },
      teacher: {
        code: "UNICORN-BCI-EDU",
        name: "FocusMirror · 考前专注力微习惯教练",
        pitch: "不靠家长吼叫，用5分钟轻量化脑电反馈帮备考学生直观看见‘走神瞬间’，通过科学番茄钟把专注变成可练习的肌肉。",
        leverage: "低成本消费级 EEG 数据流 + AI 个性化复盘日志 + 极简防沉迷计时器",
        mvp72h: "第1天针对高三晚自习走神场景写一套25分钟专注训练SOP；第2天做出支持实时专注分值提醒与走神复盘的极简Web仪表盘；第3天找3名高三/考研学生实测对比做题效率。",
        monetization: "21天专注力陪跑训练营（含租赁硬件或自备设备软件订阅，¥199/月）。"
      },
      finance: {
        code: "UNICORN-BCI-FIN",
        name: "NeuroGuard · 高净值岗位认知过载风控哨兵",
        pitch: "服务高频交易员、夜班调度员与长途货运车队，在人员发生致命判断失误前15分钟识别微睡眠与神经极度疲劳并触发熔断提示。",
        leverage: "EEG Theta/Alpha 频段比值异常检测 + 班组调度预警 Webhook + 历史风险审计日志",
        mvp72h: "第1天用开源疲劳脑电数据集验证提前10分钟预警的准确率规则；第2天做出向风控主管发告警并计算‘潜在挽回损失’的看板原型；第3天访谈1家物流车队安全主管打磨话术。",
        monetization: "按企业安全席位收取月度风控 SaaS 服务费，并与商用车险公司合作保费折扣返佣。"
      },
      gamer: {
        code: "UNICORN-BCI-GAM",
        name: "MindDuel · 意念拔河与专注魔法对战",
        pitch: "把无聊的脑电校准变成双人或单人‘集中意念点亮魔法盾’的闯关游戏，顺手帮康复机构解决中风患者运动想象训练放弃率高的问题。",
        leverage: "WebSocket 实时双人对战状态机 + 脑电专注阈值映射粒子特效 + 成就徽章体系",
        mvp72h: "第1天设计‘意念充能蓄力发波’极简对战规则；第2天用模拟键盘/脑环输入做出2分钟一局的网页双人对战版；第3天带到线下创客市集或桌游吧找10对情侣/朋友现场试玩。",
        monetization: "线下快闪体验设备授权 + 向康复医院提供游戏化康复软件授权费。"
      }
    },
    space_debris: {
      designer: {
        code: "UNICORN-SPC-DES",
        name: "OrbitLens · 近地轨道交通实时美学态势台",
        pitch: "把晦涩难懂的太空两行轨道根数（TLE）变成惊艳而直观的 3D 实时太空交通风险剧场，让商业航天公司 CEO 和媒体一秒看懂碰撞危机。",
        leverage: "CelesTrak 公开轨道接口 + SGP4 浏览器端轨道计算 + 极简工业蓝图交互面板",
        mvp72h: "第1天拉取星链与知名空间站的公开 TLE 数据；第2天用纯前端绘出高对比度极简交互轨道图并标出近期交会热区；第3天生成几张刷屏级高清海报投给航天媒体和商业卫星团队。",
        monetization: "商业航天公司品牌大屏定制 + 高精度态势订阅会员。"
      },
      teacher: {
        code: "UNICORN-SPC-EDU",
        name: "KeplerPlay · 太空清道夫物理探究沙盒",
        pitch: "彻底拯救高中万有引力抽象课堂！让学生在浏览器里亲手发射卫星、变轨追赶并网捕报废垃圾，彻底理解角动量与轨道力学。",
        leverage: "Canvas 2D 引力弹弓物理引擎 + 预设中学物理实验关卡 + 自动解题反馈",
        mvp72h: "第1天对齐高中物理必修二‘宇宙航行’全部难点做出3个互动闯关任务；第2天上线无需注册的纯网页物理沙盒；第3天发给5位一线物理名师在课堂试讲15分钟收集反响。",
        monetization: "向全国中小学科技馆与物理名师工作室售卖互动教学套件与校本实验课包。"
      },
      finance: {
        code: "UNICORN-SPC-FIN",
        name: "SpaceActuary · 低轨卫星碰撞险动态精算引擎",
        pitch: "全球低轨卫星即将突破十万颗，用自动化轨道交会密度与碎片回避成本算法，帮再保险公司实时定价每一颗卫星的太空交通险。",
        leverage: "公开空间碎片密度模型 + 蒙特卡洛碰撞概率估算 + 燃料消耗折损账本模型",
        mvp72h: "第1天研究1份真实卫星在轨保险条约并拆解其风险盲区；第2天做出输入‘轨道高度/倾角/卫星面积’即可输出年度碰撞预期损失(EAL)的计算器；第3天联系2位航空航天保险经纪人验证痛点。",
        monetization: "保险机构精算 API 调用费 + 商业卫星融资前独立风险评估报告费。"
      },
      gamer: {
        code: "UNICORN-SPC-GAM",
        name: "OrbitalSweeper · 硬核燃料约束太空捡垃圾",
        pitch: "将轨道力学‘变轨耗油极多’的残酷约束做成极度烧脑的独立策略游戏，众包收集人类玩家发现的超省燃料抓捕路线。",
        leverage: "牛顿引力数值积分器 + 霍曼转移辅助线预测 + 全球燃料消耗最少榜",
        mvp72h: "第1天调通两颗卫星引力追踪核心手感；第2天做3个真实历史太空碎片回收原型关卡；第3天在知乎/IndieNova 发开发日志测试硬核玩家通关率。",
        monetization: "独立游戏买断售卖 + 航天科普联动扩展包。"
      }
    },
    ai_exoskeleton: {
      designer: {
        code: "UNICORN-EXO-DES",
        name: "WarmStep · 隐形尊严适老化穿戴交互系统",
        pitch: "为外骨骼硬件厂重构外观包裹织物、零学习成本语音陪伴以及‘报喜不报忧’的子女温情周报，让老人主动爱穿它去公园散步。",
        leverage: "适老化字体视觉规范 + 温和语音提示脚本 + 微信小程序级极简子女关怀卡片",
        mvp72h: "第1天去公园访谈5位用过护膝/助行器的老人记录真实抵触点；第2天画出1套完全隐藏机械感的新穿戴方案与子女端3屏原型图；第3天拿给1家医疗康复硬件厂产品总监提案。",
        monetization: "向银发智能硬件厂商收取工业设计+适老交互改造咨询费（单案¥3万~¥10万）。"
      },
      teacher: {
        code: "UNICORN-EXO-EDU",
        name: "KinectGrandma · 银发居家安全行走陪练师",
        pitch: "针对买回家却不会用的助行设备与术后老人，用普通手机摄像头即可完成每周1次步态打卡教学，像老朋友一样纠正坏姿势。",
        leverage: "浏览器端轻量人体骨骼姿态识别 + 大字慢语速方言语音引导 + 家庭打卡简报",
        mvp72h: "第1天请教1位康复科医生确定老人起身/迈步3个最危险动作；第2天用网页调用摄像头做出能识别‘起身重心前倾不足’并语音夸奖的 Demo；第3天找自家或邻居家老人实际测试顺畅度。",
        monetization: "居家康复陪伴会员订阅（¥39/月，子女为父母购买）+ 社区养老驿站团购。"
      },
      finance: {
        code: "UNICORN-EXO-FIN",
        name: "CarePay · 养老外骨骼按步数租赁分账账本",
        pitch: "打破万元外骨骼卖不动的僵局！搭建一套连接硬件厂、社区养老院与长护险的‘按安全有效辅助步数计费+防跌倒理赔抵扣’金融账本。",
        leverage: "设备使用时长与步态合规验证日志 + 养老院分润清分台账 + 跌倒节省测算模型",
        mvp72h: "第1天算清一台外骨骼租给养老院单次收费15元的回本周期账本；第2天做出包含设备折旧、护工提成、安全减损测算的财务沙盘工具；第3天拿给本地连锁养老院院长与器械经销商测算。",
        monetization: "设备租赁清分 SaaS 手续费（抽成流水 3%~5%）+ 长护险数据风控对接服务。"
      },
      gamer: {
        code: "UNICORN-EXO-GAM",
        name: "WalkTheWorld · 银发族客厅虚拟环球散步",
        pitch: "把康复步行变成带着孙子一起‘用真实步数打卡桂林山水、重走年轻时去过的城市’的温情轻游戏，大幅提升老人每日复健依从性。",
        leverage: "极简步数同步 + 街景实景画卷进度条 + 孙辈语音明信片激励闭环",
        mvp72h: "第1天设计‘走1000步解锁一张老照片与孙辈30秒加油语音’的机制；第2天做出老人只需点一个大按钮就能边走边看风景的平板原型；第3天邀请1家日间照料中心的5位爷爷奶奶试用。",
        monetization: "适老康养软件授权给各大外骨骼/跑步机厂商作为标配内容增值包。"
      }
    }
  };

  /**
   * 构造工位 2 的极速追问高质量 Prompt（支持预设领域与自定义领域）
   */
  function buildStation2Prompt(domainName, essences, perspective) {
    const e1 = essences[0] ? essences[0].title : "第一性原理拆解";
    const e2 = essences[1] ? essences[1].title : "核心物理瓶颈";
    return [
      `我正在用“认知炼金炉”跨界拆解一个我完全陌生的硬核领域：【${domainName}】。`,
      `我的个人背景与优势视角是：【${perspective.name}（${perspective.tag}）】。`,
      ``,
      `已知初步拆解的底层本质包括：`,
      `1. ${e1}`,
      `2. ${e2}`,
      ``,
      `请你作为顶尖跨界产品导师，帮我完成以下 3 步极速追问：`,
      `①【去黑话】用高中生能听懂的比喻，列出该领域最唬人的 3 个术语及真实物理机制；`,
      `②【找裂缝】在这个行业里，科学家最擅长攻克硬件/算法极限，但最容易忽视哪 3 个“普通人的痛苦与摩擦”？`,
      `③【72小时一人独角兽 MVP】结合我作为“${perspective.name}”的优势，设计一个不需要自建实验室、不需要研发底层硬件，72小时内利用开源接口或 AI 就能做出 Demo 并拿到第一笔反馈/付费的最小商业方案！`
    ].join("\n");
  }

  /**
   * 自定义领域动态模版生成器：输入任何硬核陌生领域词，实时合成 4 工位完整方案
   */
  function generateCustomDomainBlueprint(rawDomain, perspectiveId) {
    const cleanName = (rawDomain || "").trim() || "可控核聚变";
    const perspective =
      MODE_B_PERSPECTIVES.find((p) => p.id === perspectiveId) || MODE_B_PERSPECTIVES[0];

    const jargons = [
      { term: `${cleanName} · 核心边界参数`, plain: "决定这项技术能不能稳定运转而不失控的那几个关键物理刻度" },
      { term: `${cleanName} · 系统耦合噪声`, plain: "实验室完美环境一旦搬到现实世界，各种灰尘、温差和人为失误带来的干扰" },
      { term: `${cleanName} · 商业化衰减率`, plain: "论文里的理想数值放到工厂量产时不可避免打的折扣" }
    ];

    const essences = [
      {
        title: `物理本质 01｜抛开名词，${cleanName}的核心是“能量/信息或物质的高效转换”`,
        body: `任何硬核技术本质都在做同一件事：以更低损耗把输入端变成人类需要的结果。看懂它的输入成本和输出价值，你就越过了 80% 的门槛。`
      },
      {
        title: `物理本质 02｜实验室不缺高精尖，缺的是“走出实验室的最后一公里”`,
        body: `技术发明者往往沉迷于把性能从 98% 推到 99.1%，却严重忽略了客户不敢买、用不会、算不清账或嫌界面太难用。`
      },
      {
        title: `物理本质 03｜跨界者不必重复造轮子，用软件/AI/体验包裹硬核能力`,
        body: `你的任务不是比领域专家更懂原理，而是当好“技术内核”与“真实人类需求”之间的超级翻译官与规则设计师。`
      }
    ];

    const socraticSteps = [
      {
        q: `第1问 · 撕掉 ${cleanName} 的黑话外衣`,
        a: `如果不能使用任何英文缩写和专业术语，如何向楼下开便利店的老板解释 ${cleanName} 到底帮谁省了钱或救了急？`
      },
      {
        q: `第2问 · 锁定最反常识的非技术瓶颈`,
        a: `假设明天 ${cleanName} 的底层技术已经免费开源，为什么行业里还是 90% 的客户用不起来？答案通常藏在培训、风控、合规或审美体验里。`
      },
      {
        q: `第3问 · ${perspective.name} 的 72 小时奇袭切口`,
        a: `凭借你作为【${perspective.name}】积累的直觉，完全可以围绕“${cleanName} 公开数据集 + 科普/看板/评估/互动模拟”在 72 小时内交付一个精准服务小B端或学习者的微型产品。`
      }
    ];

    const painMap = {
      designer: `【${cleanName}】行业充斥着晦涩的白皮书和上世纪风格控制台，融资路演与甲方采购决策极度痛苦`,
      teacher: `【${cleanName}】概念门槛高企导致行业严重缺人，新人入门缺少一步一动的互动理解工具`,
      finance: `【${cleanName}】前期重资产投入黑箱严重，投资人与采购方缺少客观可量化的成本回本与风险测算表`,
      gamer: `【${cleanName}】仿真验证、团队协作或公众科普流程漫长枯燥，急需高反馈模拟沙盒提高探索效率`
    };

    const pains = [
      {
        forId: perspective.id,
        title: `命中你的优势靶心：${perspective.tag}视角下的核心摩擦`,
        body: painMap[perspective.id]
      },
      {
        forId: "other1",
        title: "信息不对称断层：上游研发与下游采购鸡同鸭讲",
        body: `科研团队讲精度指标，客户只关心多久回本、出事谁赔、员工要不要重新学。`
      },
      {
        forId: "other2",
        title: "高门槛带来的信任恐惧：越黑箱，越不敢付首付款",
        body: `只要没有把复杂过程变成透明可见的仪表盘，客户决策周期就会无限拉长。`
      }
    ];

    const unicornMap = {
      designer: {
        code: `CUSTOM-${perspective.id.toUpperCase()}`,
        name: `${cleanName} · 工业级可视化叙事与交互提案台`,
        pitch: `为【${cleanName}】赛道初创企业打造“3分钟让外行投资人和大客户秒懂”的交互式数字沙盘与品牌视觉包装方案。`,
        leverage: "HTML5 Canvas 交互演示模板 + AI 术语视觉隐喻生成器 + 行业公开参数库",
        mvp72h: `第1天收集5家【${cleanName}】公司官网最看不懂的一张图；第2天将其重绘为可交互演示原型；第3天主动联系创始人送出免费重构样板换取首个付费订单。`,
        monetization: "技术商业化视觉包定制（¥6,000~¥20,000/套）+ 长期产品官网与控制台设计外包。"
      },
      teacher: {
        code: `CUSTOM-${perspective.id.toUpperCase()}`,
        name: `${cleanName} · 零门槛交互式启蒙沙盒与训练营`,
        pitch: `把【${cleanName}】的枯燥原理改造成可调参数的网页实验室，专供跨行求职者、青少年竞赛生与企业非技术高管快速建立系统认知。`,
        leverage: "轻量物理/逻辑网页模拟器 + AI 1对1苏格拉底答疑助教 + 社群打卡机制",
        mvp72h: `第1天提炼【${cleanName}】最核心的1个反常识因果公式；第2天做成网页交互小实验并配套3道关卡题；第3天在垂直社群招募首批体验官测试付费转化。`,
        monetization: "高客单行业科普/转行训练营（¥199~¥499）+ 企业新员工跨部门内训工具。"
      },
      finance: {
        code: `CUSTOM-${perspective.id.toUpperCase()}`,
        name: `${cleanName} · 商业尽调与单元经济风险精算器`,
        pitch: `绕开纯学术炫技，为关注【${cleanName}】的机构、银行和产业链买家提供一键测算投入产出比(ROI)与关键瓶颈灵敏度的决策审计台。`,
        leverage: "公开供应链报价检索 + AI 论文/研报关键参数提取 + 蒙特卡洛财务模型",
        mvp72h: `第1天访谈或研读3篇行业研报找出决定盈利的3个核心变量；第2天做成网页版“成本盈亏平衡沙盘”；第3天定向发给行业分析师与产业投资人收集付费线索。`,
        monetization: "行业投资分析 SaaS 订阅 + 定制可行性经济审计报告（¥5,000/份起）。"
      },
      gamer: {
        code: `CUSTOM-${perspective.id.toUpperCase()}`,
        name: `${cleanName} · 极限约束模拟策略沙盒`,
        pitch: `把【${cleanName}】面临的真实工程权衡（成本 vs 稳定性 vs 产能）做成一款硬核策略模拟器，兼顾硬核玩家爽感与行业人才筛选。`,
        leverage: "浏览器实时状态机 + 动态突发事件牌库 + 全球最佳策略方案排行榜",
        mvp72h: `第1天将【${cleanName}】的核心约束提炼为4项相互拉扯的数值；第2天完成10分钟单局可玩网页版原型；第3天上线社区挑战赛吸引硬核技术玩家与行业招聘方围观。`,
        monetization: "游戏内购买断制 + 为相关硬核企业提供“以赛代招”的工程思维筛选测评服务。"
      }
    };

    const unicornCard = unicornMap[perspective.id] || unicornMap.designer;

    return {
      id: "custom",
      name: cleanName,
      short: "自定义跨界拆解",
      jargons,
      essences,
      socraticSteps,
      pains,
      unicornCard,
      promptText: buildStation2Prompt(cleanName, essences, perspective),
      isCustom: true
    };
  }

  /**
   * 统一获取某预设领域 + 某视角的完整炼金蓝图
   */
  function getPresetBlueprint(domainId, perspectiveId) {
    const domain = MODE_B_DOMAINS.find((d) => d.id === domainId) || MODE_B_DOMAINS[0];
    const perspective =
      MODE_B_PERSPECTIVES.find((p) => p.id === perspectiveId) || MODE_B_PERSPECTIVES[0];
    const matrixEntry =
      (MODE_B_MATRIX[domain.id] && MODE_B_MATRIX[domain.id][perspective.id]) ||
      MODE_B_MATRIX.synthetic_bio.designer;

    return {
      id: domain.id,
      name: domain.name,
      short: domain.short,
      jargons: domain.jargons,
      essences: domain.essences,
      socraticSteps: domain.socraticSteps,
      pains: domain.pains,
      unicornCard: matrixEntry,
      promptText: buildStation2Prompt(domain.name, domain.essences, perspective),
      isCustom: false
    };
  }

  const ZH_DATA = {
    MODE_A_SCENARIOS,
    MODE_B_PERSPECTIVES,
    MODE_B_DOMAINS,
    MODE_B_MATRIX,
    buildStation2Prompt,
    getPresetBlueprint,
    generateCustomDomainBlueprint
  };

  (root.SANDBOX_DATA_I18N = root.SANDBOX_DATA_I18N || {}).zh = ZH_DATA;

  function resolveLang(lang) {
    if (typeof lang === "string" && lang.trim()) {
      return lang.trim().toLowerCase();
    }
    if (root.DEMO3_LANG && typeof root.DEMO3_LANG.get === "function") {
      return root.DEMO3_LANG.get();
    }
    return "en";
  }

  function getData(lang) {
    const targetLang = resolveLang(lang);
    const registry = root.SANDBOX_DATA_I18N || {};
    return registry[targetLang] || registry.en || registry.zh || ZH_DATA;
  }

  function getScenarios(lang) {
    return getData(lang).MODE_A_SCENARIOS;
  }

  function getPerspectives(lang) {
    return getData(lang).MODE_B_PERSPECTIVES;
  }

  function getDomains(lang) {
    return getData(lang).MODE_B_DOMAINS;
  }

  function getPresetBlueprintByLang(domainId, perspectiveId, lang) {
    const pack = getData(lang);
    if (pack && typeof pack.getPresetBlueprint === "function") {
      return pack.getPresetBlueprint(domainId, perspectiveId);
    }
    return getPresetBlueprint(domainId, perspectiveId);
  }

  function generateCustomDomainBlueprintByLang(rawDomain, perspectiveId, lang) {
    const pack = getData(lang);
    if (pack && typeof pack.generateCustomDomainBlueprint === "function") {
      return pack.generateCustomDomainBlueprint(rawDomain, perspectiveId);
    }
    return generateCustomDomainBlueprint(rawDomain, perspectiveId);
  }

  const SANDBOX_DATA = {
    getData,
    getScenarios,
    getPerspectives,
    getDomains,
    getPresetBlueprint: getPresetBlueprintByLang,
    generateCustomDomainBlueprint: generateCustomDomainBlueprintByLang
  };

  ["MODE_A_SCENARIOS", "MODE_B_PERSPECTIVES", "MODE_B_DOMAINS", "MODE_B_MATRIX"].forEach((prop) => {
    Object.defineProperty(SANDBOX_DATA, prop, {
      enumerable: true,
      configurable: true,
      get() {
        return getData()[prop];
      }
    });
  });

  if (typeof module !== "undefined" && module.exports) {
    module.exports = SANDBOX_DATA;
  }
  if (root) {
    root.SANDBOX_DATA = SANDBOX_DATA;
  }
})(typeof window !== "undefined" ? window : globalThis);
