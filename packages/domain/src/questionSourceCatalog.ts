import type { Subject } from "@app/schemas";

export interface QuestionSourceCatalogItem {
  id: string;
  title: string;
  provider: string;
  url: string;
  subject: Subject;
  knowledgePointId: string;
  sourceType: "web_import" | "gaokao_paper";
  note: string;
  tags: string[];
}

const questionSourceCatalog: QuestionSourceCatalogItem[] = [
  {
    id: "catalog-eol-gaokao-index",
    title: "中国教育在线历年高考真题总入口",
    provider: "中国教育在线",
    url: "https://gaokao.eol.cn/e_html/gk/gkst/",
    subject: "math",
    knowledgePointId: "math-function",
    sourceType: "web_import",
    note: "公开真题索引页，适合先导入为候选题源，再按年份和学科人工拆分校对。",
    tags: ["真题", "总入口", "公开网页"]
  },
  {
    id: "catalog-jinhong-2025-national2",
    title: "锦宏高考 2025 全国二卷与四川选科汇总",
    provider: "锦宏高考",
    url: "https://www.jhgk.cn/trendDetails.htm?id=12fdc00a-18ea-446a-9dce-30767de28a15",
    subject: "physics",
    knowledgePointId: "physics-motion",
    sourceType: "gaokao_paper",
    note: "包含全国二卷主科和四川物理、地理等选科线索；化学条目可能不完整，导入后需要人工确认。",
    tags: ["2025", "全国二卷", "四川", "真题"]
  },
  {
    id: "catalog-gaokzx-2025-papers",
    title: "北京高考在线 2025 全国各省试题答案汇总",
    provider: "北京高考在线",
    url: "https://www.gaokzx.com/gk/shitiku/141763.html",
    subject: "math",
    knowledgePointId: "math-function",
    sourceType: "gaokao_paper",
    note: "公开汇总页，适合作为年度真题入口；正文含资料领取和推广内容，导入后需要筛掉非题目文本。",
    tags: ["2025", "真题", "答案", "汇总"]
  },
  {
    id: "catalog-gaokzx-2025-analysis",
    title: "北京高考在线 2025 全国各科试题评析",
    provider: "北京高考在线",
    url: "https://www.gaokzx.com/gk/shitiku/141672.html",
    subject: "chemistry",
    knowledgePointId: "chem-balance",
    sourceType: "web_import",
    note: "适合补充命题趋势、考点权重和复盘方向，不应直接当作完整题干。",
    tags: ["2025", "评析", "考点"]
  },
  {
    id: "catalog-chsi-analysis",
    title: "阳光高考试题评析入口",
    provider: "阳光高考",
    url: "https://gaokao.chsi.com.cn/wap/news/stpx?tabIndex=stfx",
    subject: "geography",
    knowledgePointId: "geography-climate",
    sourceType: "web_import",
    note: "权威评析入口，适合抽取学科能力要求和命题方向，配合题目人工整理使用。",
    tags: ["评析", "权威入口", "考点"]
  },
  {
    id: "catalog-zizzs-2025-papers",
    title: "自主选拔在线 2025 高考试题答案汇总",
    provider: "自主选拔在线",
    url: "https://www.zizzs.com/gk/shitiku/200680.html",
    subject: "english",
    knowledgePointId: "english-reading",
    sourceType: "gaokao_paper",
    note: "公开汇总入口，适合补充主科真题线索；导入后需要人工确认题干完整性。",
    tags: ["2025", "真题", "英语", "汇总"]
  },
  {
    id: "catalog-zizzs-2025-analysis",
    title: "自主选拔在线 2025 高考各科试题评析",
    provider: "自主选拔在线",
    url: "https://www.zizzs.com/gk/shitiku/200689.html",
    subject: "chinese",
    knowledgePointId: "chinese-writing",
    sourceType: "web_import",
    note: "适合补充作文、阅读和各科命题趋势，不作为标准答案来源。",
    tags: ["2025", "评析", "语文", "作文"]
  }
];

export function getQuestionSourceCatalog() {
  return questionSourceCatalog;
}

export function getQuestionSourceCatalogItem(sourceId: string) {
  return questionSourceCatalog.find((item) => item.id === sourceId) ?? null;
}
