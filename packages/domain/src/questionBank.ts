import type { GeneratedQuestionSet, Question, QuestionSource } from "@app/schemas";

interface QuestionSeed {
  id: string;
  knowledgePointIds: string[];
  type: Question["type"];
  difficulty: number;
  stem: string;
  answer: string;
  analysis: string;
}

interface QuestionSetSeed {
  id: string;
  title: string;
  subject: Question["subject"];
  questions: QuestionSeed[];
}

const supplementalQuestionSets: QuestionSetSeed[] = [
  {
    id: "src-bank-math",
    title: "数学薄弱点原创训练",
    subject: "math",
    questions: [
      {
        id: "q-bank-math-001",
        knowledgePointIds: ["math-derivative"],
        type: "calculation",
        difficulty: 4,
        stem: "已知函数 f(x)=x^3-3x^2+ax 在区间 [0,3] 上单调递增，求实数 a 的取值范围。",
        answer: "a >= 3。",
        analysis: "先求 f'(x)=3x^2-6x+a。要在 [0,3] 单调递增，需要导函数在区间内恒非负。二次函数顶点在 x=1，最小值为 a-3，所以 a >= 3。"
      },
      {
        id: "q-bank-math-002",
        knowledgePointIds: ["math-function"],
        type: "calculation",
        difficulty: 3,
        stem: "函数 g(x)=ln(x+1)-kx 在 (0,+∞) 上有零点，判断 k 的取值范围。",
        answer: "0 < k < 1。",
        analysis: "把零点转化为 k=ln(x+1)/x。令 h(x)=ln(x+1)/x，x>0。h(x) 从 1 递减趋近 0，因此 k 的范围是 (0,1)。"
      },
      {
        id: "q-bank-math-003",
        knowledgePointIds: ["math-vector"],
        type: "calculation",
        difficulty: 3,
        stem: "在空间直角坐标系中，A(1,0,2)，B(3,2,0)，C(0,1,1)。求向量 AB 与 AC 的夹角余弦值。",
        answer: "cos = 1/3。",
        analysis: "AB=(2,2,-2)，AC=(-1,1,-1)，点积为 2，|AB|=2√3，|AC|=√3，所以 cos=2/(6)=1/3。若按 BA 与 AC 则符号相反，需先确认向量方向。"
      },
      {
        id: "q-bank-math-004",
        knowledgePointIds: ["math-function"],
        type: "single_choice",
        difficulty: 2,
        stem: "已知偶函数 f(x) 在 [0,+∞) 上单调递增，下列结论正确的是：A. f(-2)<f(1) B. f(-2)=f(2) C. f(-1)>f(2) D. f(0)>f(1)",
        answer: "B。",
        analysis: "偶函数满足 f(-x)=f(x)，因此 f(-2)=f(2)。单调性只用于比较非负自变量上的函数值。"
      },
      {
        id: "q-bank-math-005",
        knowledgePointIds: ["math-trig"],
        type: "calculation",
        difficulty: 3,
        stem: "已知 sin x=3/5，且 x 为第二象限角，求 cos 2x 的值。",
        answer: "cos 2x = 7/25。",
        analysis: "第二象限 cos x<0，但 cos2x=1-2sin^2x=1-18/25=7/25，与 cos x 的符号无直接关系。"
      },
      {
        id: "q-bank-math-006",
        knowledgePointIds: ["math-trig"],
        type: "single_choice",
        difficulty: 3,
        stem: "函数 y=2sin(2x+π/3) 的最小正周期是：A. π/2 B. π C. 2π D. 4π",
        answer: "B。",
        analysis: "y=Asin(ωx+φ) 的周期为 2π/|ω|，这里 ω=2，所以周期为 π。"
      },
      {
        id: "q-bank-math-007",
        knowledgePointIds: ["math-probability"],
        type: "calculation",
        difficulty: 4,
        stem: "袋中有 3 个红球、2 个白球，不放回任取 2 个。求至少取到 1 个红球的概率。",
        answer: "9/10。",
        analysis: "用对立事件更快：至少 1 个红球的对立是 2 个全为白球，概率为 C(2,2)/C(5,2)=1/10，所以所求为 9/10。"
      },
      {
        id: "q-bank-math-008",
        knowledgePointIds: ["math-probability"],
        type: "calculation",
        difficulty: 4,
        stem: "随机变量 X 的分布列为 P(X=0)=0.2，P(X=1)=0.5，P(X=2)=0.3，求 E(X) 与 D(X)。",
        answer: "E(X)=1.1，D(X)=0.49。",
        analysis: "E(X)=0×0.2+1×0.5+2×0.3=1.1；E(X^2)=0+0.5+4×0.3=1.7，所以 D(X)=1.7-1.1^2=0.49。"
      }
    ]
  },
  {
    id: "src-bank-physics",
    title: "物理力电综合原创训练",
    subject: "physics",
    questions: [
      {
        id: "q-bank-physics-001",
        knowledgePointIds: ["physics-motion"],
        type: "calculation",
        difficulty: 3,
        stem: "质量 2 kg 的物块在水平面上受到 10 N 水平拉力，从静止开始 4 s 内位移 16 m。取 g=10 m/s^2，求动摩擦因数。",
        answer: "0.3。",
        analysis: "由 s=1/2at^2 得 a=2 m/s^2。合力 ma=4 N，摩擦力为 10-4=6 N，μ=6/(2*10)=0.3。"
      },
      {
        id: "q-bank-physics-002",
        knowledgePointIds: ["physics-motion"],
        type: "calculation",
        difficulty: 4,
        stem: "小球从高处水平抛出，初速度为 10 m/s，落地时速度方向与水平方向夹角为 45°。取 g=10 m/s^2，求下落高度。",
        answer: "5 m。",
        analysis: "落地时 tan45°=vy/vx=1，所以 vy=10 m/s。由 vy^2=2gh 得 h=100/(20)=5 m。"
      },
      {
        id: "q-bank-physics-003",
        knowledgePointIds: ["physics-electric"],
        type: "calculation",
        difficulty: 4,
        stem: "带电粒子以速度 v 垂直进入匀强磁场，做半径为 r 的圆周运动。若速度变为 2v，其他条件不变，半径如何变化？周期如何变化？",
        answer: "半径变为 2r，周期不变。",
        analysis: "半径 r=mv/(qB)，与速度成正比；周期 T=2πm/(qB)，与速度无关。"
      },
      {
        id: "q-bank-physics-004",
        knowledgePointIds: ["physics-electric"],
        type: "single_choice",
        difficulty: 3,
        stem: "理想电压表内阻应尽可能大，接入电路时主要目的是：A. 减小被测电路电流改变 B. 增大总电流 C. 提高电源电压 D. 消除导线电阻",
        answer: "A。",
        analysis: "电压表并联测量，内阻越大，分流越小，对原电路影响越小。"
      },
      {
        id: "q-bank-physics-005",
        knowledgePointIds: ["physics-energy"],
        type: "calculation",
        difficulty: 4,
        stem: "质量 1 kg 的物体从粗糙斜面顶端由静止下滑，下降高度 2 m，到底端速度 4 m/s，取 g=10 m/s^2，求克服摩擦力做功。",
        answer: "12 J。",
        analysis: "重力势能减少 mgh=20 J，动能增加 1/2mv^2=8 J，机械能减少 12 J，即克服摩擦力做功 12 J。"
      },
      {
        id: "q-bank-physics-006",
        knowledgePointIds: ["physics-energy"],
        type: "calculation",
        difficulty: 4,
        stem: "两小车在光滑水平面上相向运动并粘在一起，碰前动量大小相等、方向相反。碰后整体速度如何？机械能是否守恒？",
        answer: "碰后整体速度为 0，机械能不守恒。",
        analysis: "系统总动量为 0，完全非弹性碰撞后仍为 0；粘在一起说明有机械能转化为内能，机械能不守恒。"
      },
      {
        id: "q-bank-physics-007",
        knowledgePointIds: ["physics-experiment"],
        type: "experiment",
        difficulty: 3,
        stem: "用打点计时器研究匀变速直线运动时，为什么常取相邻若干段位移差来求加速度？",
        answer: "可以利用 Δx=aT^2，并通过多段数据平均减小偶然误差。",
        analysis: "实验题要把公式来源和误差控制都说清楚，不能只写一个计算式。"
      },
      {
        id: "q-bank-physics-008",
        knowledgePointIds: ["physics-experiment"],
        type: "experiment",
        difficulty: 4,
        stem: "测电源电动势和内阻时，若电压表内阻不是无限大，实验结果中电动势和内阻通常会怎样偏差？",
        answer: "通常测得电动势偏小、内阻偏小。",
        analysis: "电压表分流使外电路等效变化，U-I 图线截距和斜率都会受影响；复习时应结合等效电路分析偏差方向。"
      }
    ]
  },
  {
    id: "src-bank-chemistry",
    title: "化学反应原理原创训练",
    subject: "chemistry",
    questions: [
      {
        id: "q-bank-chem-001",
        knowledgePointIds: ["chem-balance"],
        type: "calculation",
        difficulty: 3,
        stem: "在恒温恒容容器中发生反应 N2O4(g) ⇌ 2NO2(g)。达到平衡后再充入少量 N2O4，平衡如何移动？NO2 的物质的量如何变化？",
        answer: "平衡正向移动，NO2 的物质的量增大。",
        analysis: "增加反应物浓度，平衡向消耗反应物方向移动。恒容下虽然压强变化，但浓度变化是直接判断依据。"
      },
      {
        id: "q-bank-chem-002",
        knowledgePointIds: ["chem-balance"],
        type: "single_choice",
        difficulty: 3,
        stem: "可逆反应达到平衡的本质是：A. 各物质浓度相等 B. 正逆反应速率相等 C. 反应停止 D. 反应物完全转化",
        answer: "B。",
        analysis: "化学平衡是动态平衡，正逆反应仍在进行，只是速率相等，宏观组成不再变化。"
      },
      {
        id: "q-bank-chem-003",
        knowledgePointIds: ["chem-balance"],
        type: "calculation",
        difficulty: 4,
        stem: "某弱酸 HA 的电离平衡常数 Ka=1.0×10^-5。若 0.10 mol/L HA 溶液近似计算氢离子浓度，写出估算思路。",
        answer: "[H+]≈1.0×10^-3 mol/L。",
        analysis: "弱酸近似电离时 Ka≈x^2/c，x≈√(1.0×10^-5×0.10)=1.0×10^-3。"
      },
      {
        id: "q-bank-chem-004",
        knowledgePointIds: ["chem-balance"],
        type: "experiment",
        difficulty: 4,
        stem: "设计实验比较 Mg、Al、Fe 与稀盐酸反应快慢时，至少需要控制哪些变量？",
        answer: "金属表面积、金属质量或物质的量、盐酸浓度、温度、搅拌条件等。",
        analysis: "比较反应速率必须单一变量控制，否则金属活泼性与接触面积、浓度、温度等因素会混在一起。"
      },
      {
        id: "q-bank-chem-005",
        knowledgePointIds: ["chem-ions"],
        type: "calculation",
        difficulty: 3,
        stem: "向含 Ba2+ 的溶液中滴加 SO4^2- 溶液生成白色沉淀，写出离子方程式。",
        answer: "Ba2+ + SO4^2- = BaSO4↓。",
        analysis: "离子方程式只保留实际参加反应的离子，硫酸钡是难溶物，要写沉淀符号。"
      },
      {
        id: "q-bank-chem-006",
        knowledgePointIds: ["chem-ions"],
        type: "single_choice",
        difficulty: 3,
        stem: "下列离子在强酸性溶液中能大量共存的是：A. CO3^2- B. OH- C. Cl- D. HCO3-",
        answer: "C。",
        analysis: "强酸性中 CO3^2-、OH-、HCO3- 都会与 H+ 反应，Cl- 通常可大量存在。"
      },
      {
        id: "q-bank-chem-007",
        knowledgePointIds: ["chem-organic"],
        type: "single_choice",
        difficulty: 3,
        stem: "能使酸性 KMnO4 溶液褪色的有机物通常含有：A. 烷烃单键 B. 苯环稳定结构 C. 碳碳双键 D. 饱和卤代烃",
        answer: "C。",
        analysis: "碳碳双键易被氧化，可使酸性高锰酸钾褪色；但具体题目仍需注意苯环侧链等特殊情况。"
      },
      {
        id: "q-bank-chem-008",
        knowledgePointIds: ["chem-organic"],
        type: "calculation",
        difficulty: 4,
        stem: "某酯水解后得到乙酸和乙醇，写出该酯的结构简式，并说明判断依据。",
        answer: "CH3COOCH2CH3。",
        analysis: "酯水解断裂酰氧键，酸端来自羧酸，醇端来自醇；乙酸与乙醇对应乙酸乙酯。"
      }
    ]
  },
  {
    id: "src-bank-geography",
    title: "地理自然地理原创训练",
    subject: "geography",
    questions: [
      {
        id: "q-bank-geo-001",
        knowledgePointIds: ["geography-climate"],
        type: "essay",
        difficulty: 3,
        stem: "某地夏季高温多雨、冬季低温少雨，且位于大陆东岸。判断其可能的气候类型，并说明成因。",
        answer: "季风气候。受海陆热力性质差异影响，夏季来自海洋的季风带来水汽，冬季受大陆冷干气流影响。",
        analysis: "先抓住雨热同期和大陆东岸，再从季风环流解释降水季节变化。"
      },
      {
        id: "q-bank-geo-002",
        knowledgePointIds: ["geography-climate"],
        type: "single_choice",
        difficulty: 2,
        stem: "影响山地垂直自然带谱复杂程度的主要因素是：A. 山体相对高度和纬度 B. 河流流向 C. 人口密度 D. 城市等级",
        answer: "A。",
        analysis: "垂直带谱由水热条件随海拔变化形成，相对高度越大、纬度越低，带谱通常越复杂。"
      },
      {
        id: "q-bank-geo-003",
        knowledgePointIds: ["geography-climate"],
        type: "essay",
        difficulty: 4,
        stem: "分析我国西北地区发展灌溉农业时容易出现的生态问题，并提出防治措施。",
        answer: "可能出现土地盐碱化、地下水位变化、河流下游水量减少等。措施包括节水灌溉、排灌结合、控制灌溉规模、优化作物结构。",
        analysis: "地理综合题要按自然背景、生产活动、生态后果、治理措施四步组织答案。"
      },
      {
        id: "q-bank-geo-004",
        knowledgePointIds: ["geography-climate"],
        type: "essay",
        difficulty: 3,
        stem: "同一纬度大陆西岸和东岸降水差异明显，说明可能的环流或洋流原因。",
        answer: "大陆西岸可能受副热带高压、离岸风或寒流影响而少雨；大陆东岸可能受季风、暖流或来自海洋气流影响而多雨。",
        analysis: "要把降水差异落到水汽来源、气流上升条件和洋流性质三类因素。"
      },
      {
        id: "q-bank-geo-005",
        knowledgePointIds: ["geography-earth"],
        type: "calculation",
        difficulty: 3,
        stem: "若某地正午太阳高度在一年中变化明显，且夏至日达到最大，说明该地可能位于哪一半球？",
        answer: "北半球。",
        analysis: "北半球夏至日前后太阳直射点位于北回归线附近，北半球多数地区正午太阳高度达到全年较大值。"
      },
      {
        id: "q-bank-geo-006",
        knowledgePointIds: ["geography-earth"],
        type: "essay",
        difficulty: 4,
        stem: "等高线图中，河流流向应如何判断？如果等高线向高处弯曲，河谷方向如何确定？",
        answer: "河流从高处流向低处；等高线穿过河谷时凸向高处，凸出方向指向上游。",
        analysis: "等值线题要先读数值变化，再看弯曲方向。河谷等高线凸向高值区，是判断水系方向的常用依据。"
      },
      {
        id: "q-bank-geo-007",
        knowledgePointIds: ["geography-human"],
        type: "essay",
        difficulty: 3,
        stem: "分析电子信息产业布局时，除市场外还应重点考虑哪些区位因素？",
        answer: "科技人才、交通通信、产业协作、政策环境、创新平台和生活服务条件等。",
        analysis: "新兴产业区位不能只写原料和能源，要突出技术、人才、信息和产业链协同。"
      },
      {
        id: "q-bank-geo-008",
        knowledgePointIds: ["geography-human"],
        type: "essay",
        difficulty: 4,
        stem: "某资源型城市转型发展文旅和新能源产业，可能带来哪些积极影响？",
        answer: "优化产业结构、增加就业、改善生态环境、提升城市形象、降低对单一资源的依赖。",
        analysis: "区域发展题按经济、社会、生态三类影响组织答案，注意写出从资源依赖到多元发展的逻辑。"
      }
    ]
  },
  {
    id: "src-bank-english",
    title: "英语阅读原创训练",
    subject: "english",
    questions: [
      {
        id: "q-bank-english-001",
        knowledgePointIds: ["english-reading"],
        type: "single_choice",
        difficulty: 3,
        stem: "In a passage, the sentence 'The policy was a double-edged sword' most likely means the policy: A. had both benefits and risks B. was very old C. was easy to carry out D. was completely useless",
        answer: "A。",
        analysis: "double-edged sword 表示一件事有利也有弊，阅读中要结合转折和例证判断隐含态度。"
      },
      {
        id: "q-bank-english-002",
        knowledgePointIds: ["english-reading"],
        type: "essay",
        difficulty: 4,
        stem: "A paragraph first describes a problem, then gives two examples, and finally suggests a solution. What is the function of the examples?",
        answer: "They support and make the problem concrete before the solution is introduced.",
        analysis: "结构题要判断例子服务于哪一个中心句，通常不是独立观点，而是支撑前后论证。"
      },
      {
        id: "q-bank-english-003",
        knowledgePointIds: ["english-reading"],
        type: "fill_blank",
        difficulty: 3,
        stem: "Complete the sentence: The experiment was repeated several times ______ the result could be checked.",
        answer: "so that。",
        analysis: "后半句表示目的，so that 引导目的状语从句。"
      },
      {
        id: "q-bank-english-004",
        knowledgePointIds: ["english-reading"],
        type: "single_choice",
        difficulty: 3,
        stem: "When the author says a new tool 'lowers the barrier', the closest meaning is: A. makes something easier to start B. builds a wall C. reduces quality D. hides information",
        answer: "A。",
        analysis: "barrier 是障碍，lower the barrier 表示降低门槛，使进入或开始更容易。"
      },
      {
        id: "q-bank-english-005",
        knowledgePointIds: ["english-cloze"],
        type: "single_choice",
        difficulty: 3,
        stem: "Choose the best word: The team kept testing the device until it finally worked ______. A. properly B. hardly C. rarely D. nearly",
        answer: "A。",
        analysis: "properly 表示正常地、恰当地，符合 repeatedly testing until it worked 的语境。"
      },
      {
        id: "q-bank-english-006",
        knowledgePointIds: ["english-cloze"],
        type: "fill_blank",
        difficulty: 3,
        stem: "Fill in the blank with one word: It was his careful planning ______ made the project successful.",
        answer: "that。",
        analysis: "这是强调句型 It was...that...，强调 careful planning。"
      },
      {
        id: "q-bank-english-007",
        knowledgePointIds: ["english-writing"],
        type: "essay",
        difficulty: 3,
        stem: "Write one opening sentence for an application letter to a school volunteer program.",
        answer: "I am writing to apply for the volunteer position in your school program.",
        analysis: "应用文开头要直接说明写信目的，避免铺垫过长。"
      },
      {
        id: "q-bank-english-008",
        knowledgePointIds: ["english-writing"],
        type: "essay",
        difficulty: 4,
        stem: "In continuation writing, how can a student make the second paragraph connect naturally with the given story?",
        answer: "Use the same characters, conflict, emotional tone and key objects from the original story, then show a clear change or resolution.",
        analysis: "读后续写重在衔接原文线索和情感走向，不能另起一个与原文无关的新故事。"
      }
    ]
  },
  {
    id: "src-bank-chinese",
    title: "语文写作原创训练",
    subject: "chinese",
    questions: [
      {
        id: "q-bank-chinese-001",
        knowledgePointIds: ["chinese-writing"],
        type: "essay",
        difficulty: 3,
        stem: "围绕“慢下来不是停下来，而是为了看清方向”写一个议论文分论点，并补充一个可展开的论据。",
        answer: "分论点示例：适度放慢节奏，能让行动从盲目转向精准。论据可写科研、运动训练或个人复盘。",
        analysis: "写作训练要把观点写成可证明的判断句，再配一个能展开因果链的论据。"
      },
      {
        id: "q-bank-chinese-002",
        knowledgePointIds: ["chinese-writing"],
        type: "essay",
        difficulty: 4,
        stem: "材料作文中如果出现两个看似相反的关键词，如“守正”和“创新”，审题时应如何处理？",
        answer: "应建立二者关系：守正提供方向和底线，创新提供方法和活力，避免只写其中一面。",
        analysis: "关系型材料要先辨析概念，再搭建统一框架，防止变成单关键词作文。"
      },
      {
        id: "q-bank-chinese-003",
        knowledgePointIds: ["chinese-writing"],
        type: "essay",
        difficulty: 3,
        stem: "请把“青年要有理想”改写成更有辨析度的议论文中心论点。",
        answer: "青年理想不应停留在热情口号中，而要在时代需要与个人行动的结合中落地。",
        analysis: "中心论点要避免空泛，加入限制、对象、路径或价值判断后才更适合展开。"
      },
      {
        id: "q-bank-chinese-004",
        knowledgePointIds: ["chinese-writing"],
        type: "essay",
        difficulty: 4,
        stem: "一篇议论文开头只有排比和抒情，没有明确观点，可能造成什么问题？如何修改？",
        answer: "问题是阅卷者难以快速把握立意。修改时应在抒情后加入清晰中心论点，并点明材料关键词。",
        analysis: "高考作文开头要兼顾表达和判分效率，观点越早清晰，后文越容易形成结构。"
      },
      {
        id: "q-bank-chinese-005",
        knowledgePointIds: ["chinese-reading"],
        type: "essay",
        difficulty: 3,
        stem: "论述类文本中，题目要求分析某段的论证作用，答题时应从哪些角度组织？",
        answer: "可从提出或承接观点、使用论据、论证方法、与上下文结构关系、服务中心论点等角度作答。",
        analysis: "论证作用题不能只概括内容，还要说明它在论证链条中的位置和作用。"
      },
      {
        id: "q-bank-chinese-006",
        knowledgePointIds: ["chinese-reading"],
        type: "essay",
        difficulty: 4,
        stem: "文学类文本中反复出现同一意象，通常可能有哪些作用？",
        answer: "可能推动情节、烘托氛围、暗示人物心理、强化主题、形成结构照应。",
        analysis: "意象作用题要结合具体语境，不要机械罗列；至少写出内容、结构、主题三个层面。"
      },
      {
        id: "q-bank-chinese-007",
        knowledgePointIds: ["chinese-classical"],
        type: "essay",
        difficulty: 3,
        stem: "文言翻译中遇到省略句，应如何处理？",
        answer: "先根据上下文补出省略的主语、宾语或介词宾语，再按现代汉语语序通顺表达。",
        analysis: "文言翻译要落实字词、句式和语境，省略成分不补会导致句意不完整。"
      },
      {
        id: "q-bank-chinese-008",
        knowledgePointIds: ["chinese-classical"],
        type: "essay",
        difficulty: 4,
        stem: "诗歌鉴赏中问“以景结情”的表达效果，答题要点是什么？",
        answer: "用景物画面收束全诗，使情感含蓄不尽，形成余味，并通过景物特征暗示诗人情绪。",
        analysis: "表达效果题要同时写手法、画面、情感和读者感受，避免只说“情景交融”。"
      }
    ]
  }
];

export function createSupplementalQuestionBank(now = new Date()): GeneratedQuestionSet[] {
  const importedAt = now.toISOString();

  return supplementalQuestionSets.map((set) => {
    const source: QuestionSource = {
      id: set.id,
      type: "ai_generated",
      title: set.title,
      provider: "app-original-bank",
      licenseScope: "ai_generated",
      importedAt,
      note: "系统内置原创训练题，用于补足个人复读初始题库，可继续人工校对和扩展。"
    };

    return {
      source,
      questions: set.questions.map((question) => ({
        id: question.id,
        sourceId: source.id,
        subject: set.subject,
        knowledgePointIds: question.knowledgePointIds,
        type: question.type,
        difficulty: question.difficulty,
        stem: question.stem,
        answer: question.answer,
        analysis: question.analysis,
        createdAt: importedAt
      }))
    };
  });
}
