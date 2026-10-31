import type { ProjectTranslation } from './projectTranslations';

/** First draft: native-speaker review required before relying on eligibility information. */
export const CHINESE_PROJECTS: Record<number, ProjectTranslation> = {
  1: {
    description: 'Savin Hill 车站附近占地四英亩的综合开发项目：完工后共有 488 套住房；一期自 2023 年开放，包含 84 套经济适用住房的 Hancock 楼正推进建设。',
    parcelNote: 'Dorchester Avenue、Hancock Street、Pleasant Street 和 Greenmount Street 之间的汽车经销商及仓库地块，靠近 Savin Hill 站。',
    unitMix: '一期于 2023 年夏季开放，共 245 套公寓，其中 33 套有收入限制，适用 AMI 的 50% 和 70% 档位（开发商未公布各档数量）。二期即计划在 Hancock Street 动工的 Hancock 楼，共 84 套，全部有收入限制：17 套为 AMI 的 30%，其中约九套留给面临无家可归风险的家庭；17 套为 50%；50 套为 60%。下方徽标显示 Hancock 楼的分布，这是开发商唯一公布的分档数据。',
    amenities: ['Dorchester Avenue 沿街一层零售空间', '一期有六套符合 ADA 无障碍要求的收入限制住房', '自行车存放处和屋顶露台'],
    communityBenefits: '根据市政府“社区多样性保护政策”试点，一期半数收入限制住房优先提供给已住在四分之三英里范围内、租金负担较重的家庭。市政府于 2025 年 1 月向二期拨款 500 万美元；州政府于 2026 年 2 月追加税收抵免和补贴，以启动 Hancock 楼建设。',
    howToApply: "对于其列出的 Dot Block 公寓，ACRES（原 Maloney Properties 经纪部门）表示，申请按先到先处理，不是抽签。2026 年 10 月 31 日，该网站显示目前没有空房，并称无空房时申请会加入等候名单。请向 ACRES 确认当前状态和申请说明。",
    renderingNote: '效果图和已批准的规划图纸载于规划部门项目档案。',
  },
  2: {
    developer: 'Preservation of Affordable Housing（POAH）与 Dorchester Bay EDC',
    description: '在历史建筑 Dorchester Savings Bank Hall 地块建设全部为经济适用住房的公寓和艺术空间。',
    parcelNote: 'Uphams Corner 艺术区 568–574 Columbia Road 原 Dorchester Savings Bank Hall 后方的停车场。',
    unitMix: '48 套有收入限制的公寓，从单间到三居室，供收入为 AMI 的 30% 至 80% 的家庭申请，另有 3,500 平方英尺商业空间。',
    amenities: ['将 1890 年代的银行大厅改作展览空间', '以低于市场的商业租金租给艺术组织', 'Fairmount Line 沿线、交通便利的地块'],
    communityBenefits: '银行大厅将修复而非拆除，并以可负担价格租给非营利艺术组织；住房收入限制涵盖 AMI 的 30% 至 80%。',
    howToApply: "POAH 和 Dorchester Bay EDC 于 2026 年 6 月动工。这里尚未确认申请日期或等候名单状态。请向开发商咨询，并查看 Metrolist 的最新信息。",
    renderingNote: 'POAH 和 DBEDC 公布了效果图及由社区主导的征求提案材料。',
  },
  3: {
    description: '两栋全部为经济适用住房的小楼将于 2026 年完工，以家庭公寓取代空地。',
    parcelNote: 'Codman Square / Four Corners 地区两处原先空置的地块：151 Spencer Street 和 25 New England Avenue。',
    unitMix: '两栋楼共有 42 套有收入限制的家庭公寓：Spencer Street 19 套，New England Avenue 23 套。',
    amenities: ['适合家庭居住的住房', 'CSNDC 提供的居民服务', '步行不远即可到达 Talbot Avenue（Fairmount Line）'],
    communityBenefits: '在空地上新建家庭住房，CSNDC 在现场继续为租户提供居民服务。',
    howToApply: "CSNDC 曾报告 2026 年 2 月举行了抽签。Housing Navigator 在 2026 年 10 月 31 日显示等候名单开放。状态可能变化；请致电 WinnResidential (617) 287-9580 确认房源和申请方式。",
    renderingNote: '规划图和工程进度照片发布在 CSNDC 的房地产更新中。',
  },
  4: {
    description: 'Red Line 的 Shawmut 站旁，原汽车钣金维修场地上兴建的四层全经济适用住房楼宇。',
    parcelNote: 'Fitzpatrick Bros. 汽车钣金维修场地及相邻停车场，紧靠 Red Line 的 Shawmut 站。',
    unitMix: '72 套有收入限制的公寓，从单间到三居室，分布在 AMI 的 30%、50%、60%、80% 和 120% 档位。',
    amenities: ['全电气化楼宇，屋顶设有太阳能设施', 'Passive House 设计', '现场 Bluebikes 站点', '25 个地下停车位'],
    communityBenefits: '全部住房均有收入限制，其中包括四套两居室或三居室；车站周边公共空间和自行车设施也将改善。',
    howToApply: "Trinity Financial 预计 2026 年开工、2028 年完工。日期和申请状态可能变化；请向开发商查询并查看 Metrolist，不要假定申请已开放或已关闭。",
    renderingNote: '效果图和规划图纸可在规划部门及 Trinity 的项目网页查看。',
  },
};
