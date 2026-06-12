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
