import type {
  AnalyzeMistakeRequest,
  AnalyzeMistakeResponse,
  GeneratedQuestionSet,
  KnowledgePoint,
  LearningOverviewResponse,
  MasteryRecord,
  Mistake,
  MistakeCause,
  Question,
  QuestionSource,
  StudyTask,
  Subject,
  WeeklyReport
} from "@app/schemas";

const subjectLabels: Record<Subject, string> = {
  chinese: "语文",
  math: "数学",
  english: "英语",
  physics: "物理",
  chemistry: "化学",
  geography: "地理"
};

export function getSubjectLabel(subject: Subject) {
  return subjectLabels[subject];
}

export function createInitialLearningOverview(now = new Date()): LearningOverviewResponse {
  const generatedAt = now.toISOString();
  const knowledgePoints: KnowledgePoint[] = [
    { id: "math-function", subject: "math", chapter: "函数与导数", name: "函数性质与零点", parentId: null, examWeight: 5 },
    { id: "math-derivative", subject: "math", chapter: "函数与导数", name: "导数与参数范围", parentId: "math-function", examWeight: 5 },
    { id: "math-vector", subject: "math", chapter: "向量与立体几何", name: "空间向量建系", parentId: null, examWeight: 4 },
    { id: "math-trig", subject: "math", chapter: "三角函数与解三角形", name: "三角恒等变换与图像", parentId: null, examWeight: 4 },
    { id: "math-probability", subject: "math", chapter: "概率统计", name: "条件概率与分布列", parentId: null, examWeight: 4 },
    { id: "physics-motion", subject: "physics", chapter: "力学", name: "牛顿运动定律综合", parentId: null, examWeight: 5 },
    { id: "physics-energy", subject: "physics", chapter: "力学", name: "功能关系与动量", parentId: "physics-motion", examWeight: 5 },
    { id: "physics-electric", subject: "physics", chapter: "电磁学", name: "带电粒子运动", parentId: null, examWeight: 5 },
    { id: "physics-experiment", subject: "physics", chapter: "实验", name: "力电实验数据处理", parentId: null, examWeight: 4 },
    { id: "chem-balance", subject: "chemistry", chapter: "反应原理", name: "化学平衡移动", parentId: null, examWeight: 4 },
    { id: "chem-ions", subject: "chemistry", chapter: "水溶液与离子反应", name: "离子方程式与沉淀转化", parentId: null, examWeight: 4 },
    { id: "chem-organic", subject: "chemistry", chapter: "有机化学基础", name: "官能团性质与同分异构", parentId: null, examWeight: 4 },
    { id: "geography-climate", subject: "geography", chapter: "自然地理", name: "气候类型与区域特征", parentId: null, examWeight: 4 },
    { id: "geography-earth", subject: "geography", chapter: "自然地理", name: "地球运动与等值线判读", parentId: null, examWeight: 4 },
    { id: "geography-human", subject: "geography", chapter: "人文地理", name: "产业区位与区域发展", parentId: null, examWeight: 4 },
    { id: "english-reading", subject: "english", chapter: "阅读理解", name: "主旨推断与长难句", parentId: null, examWeight: 4 },
    { id: "english-cloze", subject: "english", chapter: "完形与语法填空", name: "语篇逻辑与词法辨析", parentId: null, examWeight: 3 },
    { id: "english-writing", subject: "english", chapter: "写作", name: "应用文与读后续写", parentId: null, examWeight: 4 },
    { id: "chinese-reading", subject: "chinese", chapter: "现代文阅读", name: "论述类文本与文学类文本", parentId: null, examWeight: 4 },
    { id: "chinese-classical", subject: "chinese", chapter: "古诗文", name: "文言翻译与诗歌鉴赏", parentId: null, examWeight: 4 },
    { id: "chinese-writing", subject: "chinese", chapter: "写作", name: "议论文结构与素材调用", parentId: null, examWeight: 5 }
  ];

  const mastery: MasteryRecord[] = [
    { knowledgePointId: "math-function", level: "basic", score: 68, attempts: 24, correctAttempts: 16, lastPracticedAt: generatedAt },
    { knowledgePointId: "math-derivative", level: "understood", score: 46, attempts: 18, correctAttempts: 7, lastPracticedAt: generatedAt },
    { knowledgePointId: "math-vector", level: "basic", score: 72, attempts: 11, correctAttempts: 8, lastPracticedAt: generatedAt },
    { knowledgePointId: "math-trig", level: "basic", score: 62, attempts: 12, correctAttempts: 7, lastPracticedAt: generatedAt },
    { knowledgePointId: "math-probability", level: "understood", score: 55, attempts: 9, correctAttempts: 4, lastPracticedAt: generatedAt },
    { knowledgePointId: "physics-motion", level: "understood", score: 52, attempts: 16, correctAttempts: 8, lastPracticedAt: generatedAt },
    { knowledgePointId: "physics-energy", level: "understood", score: 48, attempts: 10, correctAttempts: 4, lastPracticedAt: generatedAt },
    { knowledgePointId: "physics-electric", level: "unstarted", score: 30, attempts: 5, correctAttempts: 1, lastPracticedAt: null },
    { knowledgePointId: "physics-experiment", level: "understood", score: 50, attempts: 8, correctAttempts: 3, lastPracticedAt: generatedAt },
    { knowledgePointId: "chem-balance", level: "basic", score: 64, attempts: 14, correctAttempts: 9, lastPracticedAt: generatedAt },
    { knowledgePointId: "chem-ions", level: "basic", score: 66, attempts: 10, correctAttempts: 7, lastPracticedAt: generatedAt },
    { knowledgePointId: "chem-organic", level: "understood", score: 54, attempts: 7, correctAttempts: 3, lastPracticedAt: generatedAt },
    { knowledgePointId: "geography-climate", level: "stable", score: 84, attempts: 21, correctAttempts: 18, lastPracticedAt: generatedAt },
    { knowledgePointId: "geography-earth", level: "basic", score: 69, attempts: 11, correctAttempts: 7, lastPracticedAt: generatedAt },
    { knowledgePointId: "geography-human", level: "basic", score: 73, attempts: 13, correctAttempts: 9, lastPracticedAt: generatedAt },
    { knowledgePointId: "english-reading", level: "basic", score: 70, attempts: 30, correctAttempts: 22, lastPracticedAt: generatedAt },
    { knowledgePointId: "english-cloze", level: "understood", score: 56, attempts: 15, correctAttempts: 7, lastPracticedAt: generatedAt },
    { knowledgePointId: "english-writing", level: "basic", score: 63, attempts: 9, correctAttempts: 5, lastPracticedAt: generatedAt },
    { knowledgePointId: "chinese-reading", level: "basic", score: 61, attempts: 10, correctAttempts: 6, lastPracticedAt: generatedAt },
    { knowledgePointId: "chinese-classical", level: "understood", score: 53, attempts: 8, correctAttempts: 3, lastPracticedAt: generatedAt },
    { knowledgePointId: "chinese-writing", level: "understood", score: 58, attempts: 8, correctAttempts: 4, lastPracticedAt: generatedAt }
  ];

  const source: QuestionSource = {
    id: "src-seed-school",
    type: "manual",
    title: "入学诊断样题",
    provider: "personal",
    licenseScope: "personal_only",
    importedAt: generatedAt,
    note: "用于演示个人复读题库的数据结构。"
  };

  const questions: Question[] = [
    {
      id: "q-derivative-001",
      sourceId: source.id,
      subject: "math",
      knowledgePointIds: ["math-derivative"],
      type: "calculation",
      difficulty: 4,
      stem: "已知函数 f(x)=x^3-3ax 在区间 [-1,2] 上存在两个极值点，求参数 a 的取值范围。",
      answer: "a>0，且两个临界点需落在区间内，结合 f'(x)=3x^2-3a 得 0<a<=1。",
      analysis: "先求导，再把临界点位置转化为参数范围，最后检查区间端点条件。",
      createdAt: generatedAt
    },
    {
      id: "q-physics-001",
      sourceId: source.id,
      subject: "physics",
      knowledgePointIds: ["physics-motion"],
      type: "calculation",
      difficulty: 4,
      stem: "木块在粗糙水平面上受恒力作用从静止开始运动，已知位移和时间，求动摩擦因数。",
      answer: "由位移公式求加速度，再用牛顿第二定律 F-f=ma，f=μmg。",
      analysis: "把运动学量和受力分析串联，注意合力方向和摩擦力方向。",
      createdAt: generatedAt
    }
  ];

  const mistakes: Mistake[] = [
    {
      id: "m-derivative-001",
      questionId: "q-derivative-001",
      subject: "math",
      knowledgePointIds: ["math-derivative"],
      studentAnswer: "a>=0",
      scoreLost: 5,
      causes: ["method_gap", "expression_issue"],
      diagnosis: "会求导，但没有把两个极值点和区间位置条件完整转成不等式。",
      nextRule: "遇到参数范围题，先写必要条件，再逐条检查端点、定义域和等号是否成立。",
      reviewStage: 1,
      createdAt: generatedAt
    }
  ];

  return {
    generatedAt,
    student: {
      name: "复读学生",
      province: "四川",
      track: "新高考 3+1+2：语文、数学、英语、物理、化学、地理",
      targetScore: 620,
      daysToExam: getDaysToNextGaokao(now)
    },
    subjects: ["chinese", "math", "english", "physics", "chemistry", "geography"],
    knowledgePoints,
    mastery,
    questionSources: [source],
    questions,
    assets: [],
    mistakes,
    dailyTasks: buildDailyPlan(knowledgePoints, mastery, mistakes, 180),
    exams: [
      {
        id: "exam-baseline",
        title: "复读入学诊断",
        takenAt: generatedAt,
        scores: {
          chinese: 103,
          math: 91,
          english: 108,
          physics: 64,
          chemistry: 71,
          geography: 78
        },
        total: 515,
        summary: "数学导数、物理力学综合和语文作文结构是当前优先提分点。"
      }
    ],
    weeklyReport: buildWeeklyReport(knowledgePoints, mastery, mistakes, generatedAt)
  };
}

export function diagnoseMistake(input: AnalyzeMistakeRequest): AnalyzeMistakeResponse {
  const joined = `${input.questionStem}\n${input.studentAnswer}`.toLowerCase();
  const causes = new Set<MistakeCause>();

  if (input.scoreLost >= 6) {
    causes.add("method_gap");
  }
  if (/[+\-*/=]/.test(input.studentAnswer) || joined.includes("计算")) {
    causes.add("calculation_error");
  }
  if (joined.includes("范围") || joined.includes("条件") || joined.includes("等号")) {
    causes.add("expression_issue");
  }
  if (input.studentAnswer.length < input.standardAnswer.length * 0.35) {
    causes.add("concept_gap");
  }
  if (causes.size === 0) {
    causes.add("reading_error");
  }

  return {
    causes: Array.from(causes),
    diagnosis: "这道题的失分主要来自条件转化不完整和过程校验不足，需要把题干约束逐条落到公式或文字结论。",
    nextRule: "下次先列条件清单，再计算；得到答案后回代题干，检查单位、范围、等号和特殊情况。",
    recommendedDrill: "安排 3 道同知识点基础题、2 道中档变式题和 1 道限时综合题。"
  };
}

export function buildDailyPlan(
  knowledgePoints: KnowledgePoint[],
  mastery: MasteryRecord[],
  mistakes: Mistake[],
  availableMinutes: number
): StudyTask[] {
  const mistakeCounts = new Map<string, number>();
  for (const mistake of mistakes) {
    for (const knowledgePointId of mistake.knowledgePointIds) {
      mistakeCounts.set(knowledgePointId, (mistakeCounts.get(knowledgePointId) ?? 0) + 1);
    }
  }

  return [...mastery]
    .sort((left, right) => {
      const leftPoint = knowledgePoints.find((point) => point.id === left.knowledgePointId);
      const rightPoint = knowledgePoints.find((point) => point.id === right.knowledgePointId);
      const leftScore = left.score - (leftPoint?.examWeight ?? 1) * 6 - (mistakeCounts.get(left.knowledgePointId) ?? 0) * 12;
      const rightScore = right.score - (rightPoint?.examWeight ?? 1) * 6 - (mistakeCounts.get(right.knowledgePointId) ?? 0) * 12;
      return leftScore - rightScore;
    })
    .slice(0, 5)
    .map((record, index) => {
      const point = knowledgePoints.find((candidate) => candidate.id === record.knowledgePointId);
      const minutes = Math.max(20, Math.floor(availableMinutes / 5));

      return {
        id: `task-${record.knowledgePointId}`,
        title: `${point ? getSubjectLabel(point.subject) : "学科"}补弱：${point?.name ?? record.knowledgePointId}`,
        subject: point?.subject ?? "math",
        knowledgePointId: record.knowledgePointId,
        minutes,
        priority: 5 - index,
        reason: `掌握度 ${record.score} 分，考试权重 ${point?.examWeight ?? 1}，需要优先复盘和限时训练。`,
        status: "pending"
      };
    });
}

export function generateSimilarQuestions(baseQuestion: Question, source: QuestionSource, count: number): GeneratedQuestionSet {
  const questions: Question[] = Array.from({ length: count }, (_, index) => ({
    id: `${baseQuestion.id}-variant-${index + 1}`,
    sourceId: source.id,
    subject: baseQuestion.subject,
    knowledgePointIds: baseQuestion.knowledgePointIds,
    type: baseQuestion.type,
    difficulty: Math.min(5, Math.max(1, baseQuestion.difficulty + (index % 3) - 1)),
    stem: `变式 ${index + 1}：${baseQuestion.stem} 请改变一个条件后重新求解，并说明关键限制。`,
    answer: "按原题同一核心方法求解，先列条件，再计算并回代检查。",
    analysis: "这是一道 AI 生成的个人训练题，重点训练同知识点迁移和条件校验。",
    createdAt: source.importedAt
  }));

  return { source, questions };
}

export function parseImportedQuestions(input: {
  rawText: string;
  source: QuestionSource;
  subject: Subject;
  knowledgePointId: string;
  maxQuestions?: number;
}): Question[] {
  const stems = splitQuestionText(input.rawText).slice(0, input.maxQuestions ?? 12);

  return stems.map((stem, index) => ({
    id: `${input.source.id}-q-${index + 1}`,
    sourceId: input.source.id,
    subject: input.subject,
    knowledgePointIds: [input.knowledgePointId],
    type: inferQuestionType(stem),
    difficulty: inferDifficulty(stem),
    stem,
    answer: "待人工确认。",
    analysis: "已从题源文本拆分生成候选题，需要人工核对题干、答案、解析和知识点后再进入训练。",
    createdAt: input.source.importedAt
  }));
}

export function buildWeeklyReport(
  knowledgePoints: KnowledgePoint[],
  mastery: MasteryRecord[],
  mistakes: Mistake[],
  generatedAt: string
): WeeklyReport {
  const weakest = [...mastery]
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map((record) => knowledgePoints.find((point) => point.id === record.knowledgePointId)?.name ?? record.knowledgePointId);

  return {
    generatedAt,
    focus: weakest.map((name) => `优先补弱：${name}`),
    progress: ["已建立知识点画像、错题归因和每日任务闭环。", "地理自然地理题稳定性较好，可以降低日常时间占比。"],
    risks: mistakes.length > 0 ? ["错题二刷数量偏少，当前掌握度可能高估。"] : ["缺少真实错题输入，系统诊断仍以基线数据为主。"],
    nextWeek: ["每天完成 1 轮薄弱点限时训练。", "每道错题至少完成二刷和一次口头复盘。", "周末用套卷校验提分是否迁移到真实考试。"]
  };
}

function splitQuestionText(rawText: string) {
  const normalized = rawText
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalized) {
    return [];
  }

  const numbered = normalized
    .split(/\n(?=(?:\d{1,2}[.、．)]|[一二三四五六七八九十]+[、.．]))/u)
    .map(cleanQuestionStem)
    .filter((item) => item.length >= 8);

  if (numbered.length > 1) {
    return numbered;
  }

  return normalized
    .split(/\n{2,}/)
    .map(cleanQuestionStem)
    .filter((item) => item.length >= 8);
}

function cleanQuestionStem(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 1200);
}

function inferQuestionType(stem: string): Question["type"] {
  if (/多选|不定项|至少.*项/u.test(stem)) {
    return "multiple_choice";
  }
  if (/选择题|单选|下列.*正确|A[.、．].*B[.、．].*C[.、．].*D[.、．]/u.test(stem)) {
    return "single_choice";
  }
  if (/填空|____|（\s*）|\(\s*\)/u.test(stem)) {
    return "fill_blank";
  }
  if (/实验|装置|现象|探究/u.test(stem)) {
    return "experiment";
  }
  if (/作文|论述|赏析|翻译/u.test(stem)) {
    return "essay";
  }
  return "calculation";
}

function inferDifficulty(stem: string) {
  const lengthScore = stem.length > 500 ? 2 : stem.length > 220 ? 1 : 0;
  const signalScore = /(综合|证明|参数|最值|推导|实验设计|开放)/u.test(stem) ? 1 : 0;
  return Math.min(5, Math.max(1, 2 + lengthScore + signalScore));
}

function getDaysToNextGaokao(now: Date) {
  const year = now.getMonth() > 5 || (now.getMonth() === 5 && now.getDate() > 7) ? now.getFullYear() + 1 : now.getFullYear();
  const examDate = new Date(year, 5, 7);
  return Math.max(0, Math.ceil((examDate.getTime() - now.getTime()) / 86_400_000));
}
