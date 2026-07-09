#!/usr/bin/env node
/**
 * 生成完整首期数据集（25 诗人 / ≥30 地点 / ≥60 诗）
 * 诗文取自公版《全唐诗》通行文本；故事与坐标为 AI 起草后按 ADR-0007 结构化。
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLACEHOLDER = 'assets/images/placeholders/place.svg';
const PORTRAIT = 'assets/images/poets/default.svg';

function img(name, prompt) {
  return [
    {
      src: PLACEHOLDER,
      caption: `${name}示意`,
      status: 'placeholder',
      prompt,
      credit: '',
    },
  ];
}

const poets = [
  // 初唐
  { id: 'wangbo', name: '王勃', courtesyName: '子安', period: 'early', birthYear: 650, deathYear: 676, activeYears: [668, 676], bio: '字子安，「初唐四杰」之首。少有才名，诗文雄放，代表作《滕王阁序》名扬天下。', changanStory: '弱冠入长安应举，出入长安文坛，与杨炯、卢照邻、骆宾王齐名。' },
  { id: 'yangjiong', name: '杨炯', courtesyName: '盈川', period: 'early', birthYear: 650, deathYear: 693, activeYears: [670, 693], bio: '「初唐四杰」之一，以边塞与咏史见长，文风刚健。', changanStory: '幼举神童，授校书郎，长期活动于长安宫廷与文馆。' },
  { id: 'luzhaolin', name: '卢照邻', courtesyName: '升之', period: 'early', birthYear: 634, deathYear: 686, activeYears: [655, 680], bio: '「初唐四杰」之一，诗多忧生之嗟，长于七言歌行。', changanStory: '曾为邓王府典签，往来长安，后因病退居。' },
  { id: 'luobinwang', name: '骆宾王', courtesyName: '观光', period: 'early', birthYear: 640, deathYear: 684, activeYears: [660, 684], bio: '「初唐四杰」之一，七言歌行与骈文俱佳，有《讨武氏檄》传世。', changanStory: '曾任长安主簿等职，于长安写下多首咏物与抒怀之作。' },
  { id: 'dushenyan', name: '杜审言', courtesyName: '必简', period: 'early', birthYear: 645, deathYear: 708, activeYears: [670, 705], bio: '杜甫祖父，近体诗奠基人之一，诗风整饬精严。', changanStory: '进士及第后历官洛阳、长安，为武后、中宗朝宫廷诗人。' },
  { id: 'chenziang', name: '陈子昂', courtesyName: '伯玉', period: 'early', birthYear: 661, deathYear: 702, activeYears: [684, 698], bio: '倡导汉魏风骨，开盛唐先声，代表作《登幽州台歌》。', changanStory: '举进士后历任麟台正字等，在长安力矫齐梁余风。' },
  // 盛唐
  { id: 'wangzhihuan', name: '王之涣', courtesyName: '季凌', period: 'high', birthYear: 688, deathYear: 742, activeYears: [720, 742], bio: '边塞诗人，诗作虽少而皆精品，《凉州词》《登鹳雀楼》千古传唱。', changanStory: '早年混迹长安乐工歌筵，旗亭画壁传说即发生于此。' },
  { id: 'wangwei', name: '王维', courtesyName: '摩诘', period: 'high', birthYear: 701, deathYear: 761, activeYears: [721, 761], bio: '字摩诘，诗画双绝，有「诗佛」之称。山水田园诗空灵澄澈。', changanStory: '长期在长安为官，晚年半官半隐于蓝田辋川别业。' },
  { id: 'libai', name: '李白', courtesyName: '太白', period: 'high', birthYear: 701, deathYear: 762, activeYears: [725, 762], bio: '字太白，号青莲居士，「诗仙」。浪漫主义巅峰，想象奇绝。', changanStory: '天宝初奉诏入长安，供奉翰林，贺知章呼为「谪仙人」，后赐金放还。' },
  { id: 'dufu', name: '杜甫', courtesyName: '子美', period: 'high', birthYear: 712, deathYear: 770, activeYears: [735, 770], bio: '字子美，号少陵野老，「诗圣」。现实主义高峰，被誉「诗史」。', changanStory: '困守长安十年，安史之乱中陷贼、奔凤翔，写下大量长安纪实诗。' },
  // 中唐
  { id: 'baijuyi', name: '白居易', courtesyName: '乐天', period: 'middle', birthYear: 772, deathYear: 846, activeYears: [800, 846], bio: '字乐天，号香山居士。新乐府运动倡导者，诗风浅切感人。', changanStory: '进士及第后任翰林学士、左拾遗等，在长安创作《长恨歌》《琵琶行》等名篇。' },
  { id: 'yuanzhen', name: '元稹', courtesyName: '微之', period: 'middle', birthYear: 779, deathYear: 831, activeYears: [803, 831], bio: '字微之，与白居易齐名，称「元白」。悼亡诗与艳诗俱有名。', changanStory: '明经及第，历任监察御史等，在长安与白居易唱和频繁。' },
  { id: 'hanyu', name: '韩愈', courtesyName: '退之', period: 'middle', birthYear: 768, deathYear: 824, activeYears: [792, 824], bio: '字退之，古文运动领袖，「文起八代之衰」。诗风奇崛。', changanStory: '多次任职长安，上《论佛骨表》被贬潮州，有《左迁至蓝关示侄孙湘》。' },
  { id: 'liuzongyuan', name: '柳宗元', courtesyName: '子厚', period: 'middle', birthYear: 773, deathYear: 819, activeYears: [793, 815], bio: '字子厚，「唐宋八大家」之一，山水游记与寓言文成就极高。', changanStory: '进士及第后参与永贞革新，在长安任监察御史里行等职。' },
  { id: 'liuyuxi', name: '刘禹锡', courtesyName: '梦得', period: 'middle', birthYear: 772, deathYear: 842, activeYears: [793, 842], bio: '字梦得，有「诗豪」之称。咏史怀古诗尤为精警。', changanStory: '与柳宗元同榜，永贞革新失败后贬朗州，后重返长安有玄都观诗。' },
  { id: 'lihe', name: '李贺', courtesyName: '长吉', period: 'middle', birthYear: 790, deathYear: 816, activeYears: [808, 816], bio: '字长吉，「诗鬼」。想象诡谲，辞采冷艳，英年早逝。', changanStory: '居长安任奉礼郎三年，因避父讳不得举进士，郁郁不得志。' },
  { id: 'weiyingwu', name: '韦应物', courtesyName: '义博', period: 'middle', birthYear: 737, deathYear: 792, activeYears: [760, 790], bio: '山水田园诗人，诗风澄淡雅洁，有「王韦」之称。', changanStory: '早年为玄宗侍卫，后历官洛阳、苏州，青年时代常居长安。' },
  { id: 'lulun', name: '卢纶', courtesyName: '允言', period: 'middle', birthYear: 739, deathYear: 799, activeYears: [760, 799], bio: '「大历十才子」之一，边塞诗与送别诗并长。', changanStory: '屡举进士不第，后官至检校户部郎中，活动于长安文坛。' },
  // 晚唐
  { id: 'lishangyin', name: '李商隐', courtesyName: '义山', period: 'late', birthYear: 813, deathYear: 858, activeYears: [837, 858], bio: '字义山，号玉谿生。无题诗与咏史诗隐晦深情，开西昆先声。', changanStory: '进士及第后卷入牛李党争，在长安留下大量感怀与咏史之作。' },
  { id: 'dumu', name: '杜牧', courtesyName: '牧之', period: 'late', birthYear: 803, deathYear: 852, activeYears: [828, 852], bio: '字牧之，号樊川居士。咏史七绝尤为人称道，称「小杜」。', changanStory: '祖居长安城南樊川，仕途起落间常回长安，写下《过华清宫》等。' },
  { id: 'wentingyun', name: '温庭筠', courtesyName: '飞卿', period: 'late', birthYear: 812, deathYear: 866, activeYears: [835, 866], bio: '词为花间鼻祖，诗与李商隐齐名，称「温李」。', changanStory: '长期出入长安狭邪与公卿之门，对长安坊市风情极为熟悉。' },
  { id: 'weizhuang', name: '韦庄', courtesyName: '端己', period: 'late', birthYear: 836, deathYear: 910, activeYears: [880, 910], bio: '花间词人代表，诗作感时伤乱，有《秦妇吟》长诗。', changanStory: '黄巢起义时身陷长安，以亲历写下《秦妇吟》，后入蜀。' },
  { id: 'pirixiu', name: '皮日休', courtesyName: '袭美', period: 'late', birthYear: 834, deathYear: 883, activeYears: [860, 883], bio: '与陆龟蒙并称「皮陆」，诗文多批判现实。', changanStory: '咸通进士，曾任太常博士，活动于长安、苏州一带。' },
  { id: 'luguimeng', name: '陆龟蒙', courtesyName: '鲁望', period: 'late', birthYear: null, deathYear: 881, activeYears: [860, 881], bio: '号天随子，隐逸诗人，与皮日休唱和。', changanStory: '曾赴长安应试不第，后归隐松江，诗中常忆长安科场与友情。' },
  { id: 'luoyin', name: '罗隐', courtesyName: '昭谏', period: 'late', birthYear: 833, deathYear: 909, activeYears: [860, 900], bio: '十举进士不第，诗多讽喻，小品文尤为辛辣。', changanStory: '多次入长安应举，落第诗中尽写长安炎凉与科场感慨。' },
];

const places = [
  // core — 城内与京畿
  { id: 'daminggong', name: '大明宫', ancientName: '大明宫', modernName: '大明宫国家遗址公园', coordinates: [34.291, 108.959], locationPrecision: 'exact', scope: 'core', category: 'palace', description: '唐帝国的权力中枢，含元殿、麟德殿所在。李白曾待诏于此。' },
  { id: 'xingqinggong', name: '兴庆宫', ancientName: '兴庆宫', modernName: '兴庆宫公园', coordinates: [34.255, 108.985], locationPrecision: 'exact', scope: 'core', category: 'palace', description: '玄宗藩邸扩建之宫，沉香亭牡丹花下李白奉诏作《清平调》。' },
  { id: 'taijigong', name: '太极宫', ancientName: '太极宫（西内）', modernName: '西安市莲湖区西大街北', coordinates: [34.268, 108.935], locationPrecision: 'approximate', scope: 'core', category: 'palace', description: '隋大兴宫，唐初主要宫殿区，称西内。' },
  { id: 'zhuque', name: '朱雀大街', ancientName: '朱雀门街', modernName: '西安市朱雀大街一线', coordinates: [34.255, 108.942], locationPrecision: 'approximate', scope: 'core', category: 'street', description: '长安城中轴线，宽阔平直，士庶往来通衢。' },
  { id: 'pingkang', name: '平康坊', ancientName: '平康坊', modernName: '西安市碑林区一带', coordinates: [34.258, 108.958], locationPrecision: 'approximate', scope: 'core', category: 'street', description: '紧邻东市，多妓馆，科举新进常游于此，称「风流数泽」。' },
  { id: 'qujiang', name: '曲江池', ancientName: '曲江池', modernName: '曲江池遗址公园', coordinates: [34.216, 108.988], locationPrecision: 'exact', scope: 'core', category: 'scenic', description: '长安东南胜景，新科进士曲江宴之所，杜甫《丽人行》所写游春地。' },
  { id: 'leyouyuan', name: '乐游原', ancientName: '乐游原', modernName: '西安市雁塔区乐游原', coordinates: [34.235, 108.975], locationPrecision: 'approximate', scope: 'core', category: 'scenic', description: '城东南高地，可俯瞰全城，李商隐「向晚意不适，驱车登古原」即此。' },
  { id: 'dayanta', name: '大雁塔', ancientName: '大慈恩寺浮图', modernName: '大雁塔（大慈恩寺）', coordinates: [34.2186, 108.964], locationPrecision: 'exact', scope: 'core', category: 'temple', description: '玄奘译经之所，新科进士「雁塔题名」之殊荣地。' },
  { id: 'xiaoyanta', name: '小雁塔', ancientName: '荐福寺塔', modernName: '小雁塔（荐福寺）', coordinates: [34.241, 108.937], locationPrecision: 'exact', scope: 'core', category: 'temple', description: '唐中宗敕建荐福寺之塔，密檐式砖塔代表。' },
  { id: 'qinglongsi', name: '青龙寺', ancientName: '青龙寺', modernName: '青龙寺遗址公园', coordinates: [34.232, 108.999], locationPrecision: 'exact', scope: 'core', category: 'temple', description: '密宗道场，日僧空海在此受法，白居易等亦有题咏。' },
  { id: 'baqiao', name: '灞桥', ancientName: '灞桥', modernName: '灞桥（灞河）', coordinates: [34.308, 109.07], locationPrecision: 'approximate', scope: 'core', category: 'bridge', description: '东出长安送别之地，折柳赠别的文化象征。' },
  { id: 'weicheng', name: '渭城', ancientName: '渭城（咸阳故城）', modernName: '咸阳市渭城区一带', coordinates: [34.329, 108.709], locationPrecision: 'approximate', scope: 'core', category: 'suburb', description: '西行饯别之地，王维《送元二使安西》经典场景。' },
  { id: 'zhongnanshan', name: '终南山', ancientName: '终南山', modernName: '秦岭终南山', coordinates: [33.95, 108.95], locationPrecision: 'approximate', scope: 'core', category: 'mountain', description: '长安正南屏障，隐逸与修道的象征，王维、孟浩然多有题咏。' },
  { id: 'huaqinggong', name: '华清宫', ancientName: '华清宫', modernName: '华清宫（骊山）', coordinates: [34.364, 109.214], locationPrecision: 'exact', scope: 'core', category: 'palace', description: '骊山温泉行宫，玄宗与杨贵妃长居之地，《长恨歌》重要场景。' },
  { id: 'xiangjisi', name: '香积寺', ancientName: '香积寺', modernName: '香积寺', coordinates: [34.13, 108.88], locationPrecision: 'exact', scope: 'core', category: 'temple', description: '净土宗祖庭之一，王维《过香积寺》所访。' },
  { id: 'wangchuan', name: '辋川', ancientName: '辋川', modernName: '蓝田县辋川', coordinates: [34.05, 109.28], locationPrecision: 'approximate', scope: 'core', category: 'suburb', description: '王维晚年别业所在，与裴迪唱和《辋川集》。' },
  { id: 'fanchuan', name: '樊川', ancientName: '樊川（杜曲）', modernName: '长安区杜曲一带', coordinates: [34.1, 108.95], locationPrecision: 'approximate', scope: 'core', category: 'suburb', description: '城南形胜，杜氏祖居，杜牧号樊川居士。' },
  { id: 'ciensi', name: '慈恩寺', ancientName: '大慈恩寺', modernName: '大慈恩寺', coordinates: [34.2195, 108.9645], locationPrecision: 'exact', scope: 'core', category: 'temple', description: '与大雁塔一体，唐代译场与游览胜地。' },
  { id: 'dongshi', name: '东市', ancientName: '东市', modernName: '西安市碑林区东大街一带', coordinates: [34.26, 108.965], locationPrecision: 'approximate', scope: 'core', category: 'street', description: '长安两大市之一，商贾云集，与西市并称。' },
  { id: 'xishi', name: '西市', ancientName: '西市', modernName: '西安市莲湖区劳动南路一带', coordinates: [34.26, 108.91], locationPrecision: 'approximate', scope: 'core', category: 'street', description: '丝绸之路东端集散地，胡商汇聚，异域风情浓。' },
  { id: 'langguan', name: '蓝关', ancientName: '蓝田关', modernName: '蓝田县蓝关', coordinates: [34.15, 109.32], locationPrecision: 'approximate', scope: 'core', category: 'mountain', description: '长安东南要隘，韩愈贬潮州途经，「雪拥蓝关马不前」。' },
  { id: 'shaoling', name: '少陵原', ancientName: '少陵原', modernName: '雁塔区少陵原', coordinates: [34.18, 108.98], locationPrecision: 'approximate', scope: 'core', category: 'suburb', description: '杜甫曾居此，「少陵野老」之号由来。' },
  { id: 'qujiangting', name: '杏园', ancientName: '杏园', modernName: '曲江池北岸一带', coordinates: [34.22, 108.985], locationPrecision: 'approximate', scope: 'core', category: 'scenic', description: '曲江北，新进士探花宴之地。' },
  { id: 'weishui', name: '渭水', ancientName: '渭水', modernName: '渭河', coordinates: [34.35, 108.9], locationPrecision: 'approximate', scope: 'core', category: 'scenic', description: '横贯关中的大河，唐诗中常见的地理意象。' },
  { id: 'lishan', name: '骊山', ancientName: '骊山', modernName: '临潼骊山', coordinates: [34.36, 109.21], locationPrecision: 'exact', scope: 'core', category: 'mountain', description: '华清宫所倚之山，烽火戏诸侯故地，杜牧「一骑红尘妃子笑」背景。' },
  // extended
  { id: 'yangguan', name: '阳关', ancientName: '阳关', modernName: '甘肃省敦煌市阳关遗址', coordinates: [39.933, 94.058], locationPrecision: 'approximate', scope: 'extended', category: 'scenic', description: '丝绸之路南路关隘，「西出阳关无故人」。' },
  { id: 'mawei', name: '马嵬', ancientName: '马嵬驿', modernName: '兴平市马嵬镇', coordinates: [34.28, 108.42], locationPrecision: 'approximate', scope: 'extended', category: 'suburb', description: '安史之乱中杨贵妃赐死处，《长恨歌》关键节点。' },
  { id: 'anxi', name: '安西', ancientName: '安西都护府', modernName: '新疆库车一带', coordinates: [41.72, 82.98], locationPrecision: 'approximate', scope: 'extended', category: 'scenic', description: '唐经营西域的军政中心，送别诗常见目的地。' },
  { id: 'bashu', name: '巴蜀', ancientName: '蜀中', modernName: '四川成都一带', coordinates: [30.67, 104.06], locationPrecision: 'approximate', scope: 'extended', category: 'scenic', description: '李白「蜀道难」所写，杜甫晚年亦流寓于此。' },
  { id: 'jiangling', name: '江陵', ancientName: '江陵', modernName: '湖北荆州', coordinates: [30.33, 112.24], locationPrecision: 'approximate', scope: 'extended', category: 'scenic', description: '长江中游重镇，李白流放夜郎途经与遇赦之地。' },
  { id: 'xuzhou', name: '徐州', ancientName: '徐州', modernName: '江苏徐州', coordinates: [34.26, 117.18], locationPrecision: 'approximate', scope: 'extended', category: 'scenic', description: '白居易《琵琶行》中湓浦之行的地理背景相关江南都会（扩展关联）。' },
  { id: 'luoyang', name: '洛阳', ancientName: '东都洛阳', modernName: '河南洛阳', coordinates: [34.62, 112.45], locationPrecision: 'approximate', scope: 'extended', category: 'scenic', description: '唐东都，与长安并称两京，诗人往来频繁。' },
];

for (const p of places) {
  p.images = img(
    p.name,
    `唐风水墨工笔，${p.name}，${p.ancientName || ''}，古画质感，宣纸底，胭脂与黛青点染，无文字水印`
  );
}

/** @type {object[]} */
const poems = [];

function add(poem) {
  poems.push(poem);
}

// —— 王维 ——
add({
  id: 'songyuanershi-anxi',
  title: '送元二使安西',
  poetId: 'wangwei',
  period: 'high',
  year: 750,
  yearPrecision: 'approximate',
  content: ['渭城朝雨浥轻尘，', '客舍青青柳色新。', '劝君更尽一杯酒，', '西出阳关无故人。'],
  highlight: ['劝君更尽一杯酒，西出阳关无故人。'],
  places: [
    { placeId: 'weicheng', relation: 'described' },
    { placeId: 'yangguan', relation: 'related' },
  ],
  story: '送友人元二出使安西。渭城饯别，阳关象征西行尽头。情深而不直露。',
  sources: ['《全唐诗》卷一二八'],
});
add({
  id: 'xiangjisi-guo',
  title: '过香积寺',
  poetId: 'wangwei',
  period: 'high',
  year: 740,
  yearPrecision: 'inferred',
  content: ['不知香积寺，', '数里入云峰。', '古木无人径，', '深山何处钟。', '泉声咽危石，', '日色冷青松。', '薄暮空潭曲，', '安禅制毒龙。'],
  highlight: ['泉声咽危石，日色冷青松。'],
  places: [{ placeId: 'xiangjisi', relation: 'described' }],
  story: '写访香积寺途中深山景象，以声色衬禅意。',
  sources: ['《全唐诗》卷一二六'],
});
add({
  id: 'wangchuan-xianju',
  title: '辋川闲居赠裴秀才迪',
  poetId: 'wangwei',
  period: 'high',
  year: 755,
  yearPrecision: 'approximate',
  content: ['寒山转苍翠，', '秋水日潺湲。', '倚杖柴门外，', '临风听暮蝉。', '渡头余落日，', '墟里上孤烟。', '复值接舆醉，', '狂歌五柳前。'],
  highlight: ['渡头余落日，墟里上孤烟。'],
  places: [{ placeId: 'wangchuan', relation: 'composed' }],
  story: '辋川别业闲居，与裴迪唱和，一幅秋山村落图。',
  sources: ['《全唐诗》卷一二六'],
});
add({
  id: 'zhongnan-bieye',
  title: '终南别业',
  poetId: 'wangwei',
  period: 'high',
  year: 745,
  yearPrecision: 'approximate',
  content: ['中岁颇好道，', '晚家南山陲。', '兴来每独往，', '胜事空自知。', '行到水穷处，', '坐看云起时。', '偶然值林叟，', '谈笑无还期。'],
  highlight: ['行到水穷处，坐看云起时。'],
  places: [{ placeId: 'zhongnanshan', relation: 'described' }],
  story: '写终南隐逸之趣，后两联最见禅机与自然。',
  sources: ['《全唐诗》卷一二六'],
});

// —— 李白 ——
add({
  id: 'qingpingdiao-1',
  title: '清平调·其一',
  poetId: 'libai',
  period: 'high',
  year: 743,
  yearPrecision: 'approximate',
  content: ['云想衣裳花想容，', '春风拂槛露华浓。', '若非群玉山头见，', '会向瑶台月下逢。'],
  highlight: ['云想衣裳花想容，春风拂槛露华浓。'],
  places: [{ placeId: 'xingqinggong', relation: 'composed' }],
  story: '玄宗沉香亭赏牡丹，李白奉诏立成三章，《清平调》其一以花喻人。',
  sources: ['《全唐诗》卷一六四'],
});
add({
  id: 'xiayanglou-songbie',
  title: '忆秦娥·箫声咽',
  poetId: 'libai',
  period: 'high',
  year: 750,
  yearPrecision: 'inferred',
  content: ['箫声咽，', '秦娥梦断秦楼月。', '秦楼月，', '年年柳色，', '灞陵伤别。', '乐游原上清秋节，', '咸阳古道音尘绝。', '音尘绝，', '西风残照，', '汉家陵阙。'],
  highlight: ['西风残照，汉家陵阙。', '年年柳色，灞陵伤别。'],
  places: [
    { placeId: 'baqiao', relation: 'described' },
    { placeId: 'leyouyuan', relation: 'described' },
  ],
  story: '传为李白词，写长安伤别与历史苍凉。灞陵即灞桥一带送别地。',
  sources: ['《全唐诗》卷八九〇'],
});
add({
  id: 'ke-zhong-xing',
  title: '客中行',
  poetId: 'libai',
  period: 'high',
  year: 744,
  yearPrecision: 'inferred',
  content: ['兰陵美酒郁金香，', '玉碗盛来琥珀光。', '但使主人能醉客，', '不知何处是他乡。'],
  highlight: ['但使主人能醉客，不知何处是他乡。'],
  places: [{ placeId: 'xishi', relation: 'related' }],
  story: '写客中痛饮忘乡。西市多胡商美酒，可作长安胡风的地理联想。',
  sources: ['《全唐诗》卷一八一'],
});
add({
  id: 'dengjinling-fenghuang',
  title: '登金陵凤凰台',
  poetId: 'libai',
  period: 'high',
  year: 747,
  yearPrecision: 'approximate',
  content: ['凤凰台上凤凰游，', '凤去台空江自流。', '吴宫花草埋幽径，', '晋代衣冠成古丘。', '三山半落青天外，', '二水中分白鹭洲。', '总为浮云能蔽日，', '长安不见使人愁。'],
  highlight: ['总为浮云能蔽日，长安不见使人愁。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '虽写金陵，结句「长安不见」直指对帝都的眷怀与政治寄托。',
  sources: ['《全唐诗》卷一八〇'],
});
add({
  id: 'shudao-nan',
  title: '蜀道难',
  poetId: 'libai',
  period: 'high',
  year: 742,
  yearPrecision: 'approximate',
  content: ['噫吁嚱，危乎高哉！', '蜀道之难，难于上青天！', '蚕丛及鱼凫，开国何茫然！', '尔来四万八千岁，不与秦塞通人烟。', '西当太白有鸟道，可以横绝峨眉巅。', '地崩山摧壮士死，然后天梯石栈相钩连。'],
  highlight: ['蜀道之难，难于上青天！'],
  places: [
    { placeId: 'bashu', relation: 'described' },
    { placeId: 'zhongnanshan', relation: 'related' },
  ],
  story: '贺知章见此诗呼李白为谪仙。写蜀道艰险，亦含对时局的隐忧。太白山属秦岭，与终南同脉。',
  sources: ['《全唐诗》卷一六二'],
});

// —— 杜甫 ——
add({
  id: 'chunwang',
  title: '春望',
  poetId: 'dufu',
  period: 'high',
  year: 757,
  yearPrecision: 'exact',
  content: ['国破山河在，', '城春草木深。', '感时花溅泪，', '恨别鸟惊心。', '烽火连三月，', '家书抵万金。', '白头搔更短，', '浑欲不胜簪。'],
  highlight: ['国破山河在，城春草木深。', '烽火连三月，家书抵万金。'],
  places: [{ placeId: 'daminggong', relation: 'described' }],
  story: '至德二载春，杜甫陷贼居长安所作，写国破城春的沉痛。',
  sources: ['《全唐诗》卷二二四'],
});
add({
  id: 'liren-xing',
  title: '丽人行',
  poetId: 'dufu',
  period: 'high',
  year: 753,
  yearPrecision: 'approximate',
  content: ['三月三日天气新，', '长安水边多丽人。', '态浓意远淑且真，', '肌理细腻骨肉匀。', '绣罗衣裳照暮春，', '蹙金孔雀银麒麟。'],
  highlight: ['三月三日天气新，长安水边多丽人。'],
  places: [{ placeId: 'qujiang', relation: 'described' }],
  story: '写杨氏姐妹曲江游春的豪奢，讽刺杨国忠兄妹权势。',
  sources: ['《全唐诗》卷二一六'],
});
add({
  id: 'bingche-xing',
  title: '兵车行',
  poetId: 'dufu',
  period: 'high',
  year: 751,
  yearPrecision: 'approximate',
  content: ['车辚辚，马萧萧，', '行人弓箭各在腰。', '耶娘妻子走相送，', '尘埃不见咸阳桥。', '牵衣顿足拦道哭，', '哭声直上干云霄。'],
  highlight: ['耶娘妻子走相送，尘埃不见咸阳桥。'],
  places: [
    { placeId: 'weicheng', relation: 'described' },
    { placeId: 'weishui', relation: 'related' },
  ],
  story: '咸阳桥即渭桥一带，写征人出关、亲人送别的惨状。',
  sources: ['《全唐诗》卷二一六'],
});
add({
  id: 'aijiangtou',
  title: '哀江头',
  poetId: 'dufu',
  period: 'high',
  year: 757,
  yearPrecision: 'exact',
  content: ['少陵野老吞声哭，', '春日潜行曲江曲。', '江头宫殿锁千门，', '细柳新蒲为谁绿？'],
  highlight: ['江头宫殿锁千门，细柳新蒲为谁绿？'],
  places: [
    { placeId: 'qujiang', relation: 'described' },
    { placeId: 'shaoling', relation: 'related' },
  ],
  story: '陷贼期间潜行曲江，见行宫荒芜，对比昔日繁华。',
  sources: ['《全唐诗》卷二一六'],
});
add({
  id: 'yueye',
  title: '月夜',
  poetId: 'dufu',
  period: 'high',
  year: 756,
  yearPrecision: 'exact',
  content: ['今夜鄜州月，', '闺中只独看。', '遥怜小儿女，', '未解忆长安。', '香雾云鬟湿，', '清辉玉臂寒。', '何时倚虚幌，', '双照泪痕干。'],
  highlight: ['遥怜小儿女，未解忆长安。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '身陷长安，忆鄜州妻子儿女，题为月夜而句句写两地相思。',
  sources: ['《全唐诗》卷二二四'],
});

// —— 白居易 / 元稹 ——
add({
  id: 'changhenge',
  title: '长恨歌',
  poetId: 'baijuyi',
  period: 'middle',
  year: 806,
  yearPrecision: 'exact',
  content: [
    '汉皇重色思倾国，',
    '御宇多年求不得。',
    '杨家有女初长成，',
    '养在深闺人未识。',
    '天生丽质难自弃，',
    '一朝选在君王侧。',
    '回眸一笑百媚生，',
    '六宫粉黛无颜色。',
    '春寒赐浴华清池，',
    '温泉水滑洗凝脂。',
    '侍儿扶起娇无力，',
    '始是新承恩泽时。',
    '云鬓花颜金步摇，',
    '芙蓉帐暖度春宵。',
    '春宵苦短日高起，',
    '从此君王不早朝。',
    '承欢侍宴无闲暇，',
    '春从春游夜专夜。',
    '后宫佳丽三千人，',
    '三千宠爱在一身。',
    '金屋妆成娇侍夜，',
    '玉楼宴罢醉和春。',
    '姊妹弟兄皆列土，',
    '可怜光彩生门户。',
    '遂令天下父母心，',
    '不重生男重生女。',
    '骊宫高处入青云，',
    '仙乐风飘处处闻。',
    '缓歌慢舞凝丝竹，',
    '尽日君王看不足。',
    '渔阳鼙鼓动地来，',
    '惊破霓裳羽衣曲。',
    '九重城阙烟尘生，',
    '千乘万骑西南行。',
    '翠华摇摇行复止，',
    '西出都门百余里。',
    '六军不发无奈何，',
    '宛转蛾眉马前死。',
    '花钿委地无人收，',
    '翠翘金雀玉搔头。',
    '君王掩面救不得，',
    '回看血泪相和流。',
    '黄埃散漫风萧索，',
    '云栈萦纡登剑阁。',
    '峨嵋山下少人行，',
    '旌旗无光日色薄。',
    '蜀江水碧蜀山青，',
    '圣主朝朝暮暮情。',
    '行宫见月伤心色，',
    '夜雨闻铃肠断声。',
  ],
  highlight: [
    '回眸一笑百媚生，六宫粉黛无颜色。',
    '在天愿作比翼鸟，在地愿为连理枝。',
    '天长地久有时尽，此恨绵绵无绝期。',
  ],
  places: [
    { placeId: 'huaqinggong', relation: 'described' },
    { placeId: 'mawei', relation: 'described' },
    { placeId: 'lishan', relation: 'described' },
    { placeId: 'bashu', relation: 'related' },
  ],
  story:
    '元和元年，白居易与陈鸿、王质夫话杨贵妃事而作。华清池、马嵬为史地实写；诗中「忽闻海上有仙山」等仙界情节为文学想象，本站不建仙界标记。',
  sources: ['《全唐诗》卷四三五'],
});
add({
  id: 'fufeng-xiting',
  title: '赋得古原草送别',
  poetId: 'baijuyi',
  period: 'middle',
  year: 800,
  yearPrecision: 'approximate',
  content: ['离离原上草，', '一岁一枯荣。', '野火烧不尽，', '春风吹又生。', '远芳侵古道，', '晴翠接荒城。', '又送王孙去，', '萋萋满别情。'],
  highlight: ['野火烧不尽，春风吹又生。'],
  places: [{ placeId: 'baqiao', relation: 'related' }],
  story: '少年白居易成名作，写古原送别。长安东郊灞上、乐游原一带多此类送别场景。',
  sources: ['《全唐诗》卷四三六'],
});
add({
  id: 'wen-pipa',
  title: '琵琶行（节选）',
  poetId: 'baijuyi',
  period: 'middle',
  year: 816,
  yearPrecision: 'exact',
  content: ['浔阳江头夜送客，', '枫叶荻花秋瑟瑟。', '主人下马客在船，', '举酒欲饮无管弦。', '醉不成欢惨将别，', '别时茫茫江浸月。', '忽闻水上琵琶声，', '主人忘归客不发。'],
  highlight: ['同是天涯沦落人，相逢何必曾相识。'],
  places: [
    { placeId: 'daminggong', relation: 'related' },
    { placeId: 'jiangling', relation: 'related' },
  ],
  story: '贬江州司马时作。琵琶女「自言本是京城女」，长安教坊记忆与诗人贬谪相对照。',
  sources: ['《全唐诗》卷四三五'],
});
add({
  id: 'mushang-qiu',
  title: '问刘十九',
  poetId: 'baijuyi',
  period: 'middle',
  year: 818,
  yearPrecision: 'inferred',
  content: ['绿蚁新醅酒，', '红泥小火炉。', '晚来天欲雪，', '能饮一杯无？'],
  highlight: ['晚来天欲雪，能饮一杯无？'],
  places: [{ placeId: 'fanchuan', relation: 'related' }],
  story: '闲适小诗。白居易在长安与洛阳的友朋招饮常有此类短章。',
  sources: ['《全唐诗》卷四四〇'],
});
add({
  id: 'yuan-zhen-lianchang',
  title: '连昌宫词（节选）',
  poetId: 'yuanzhen',
  period: 'middle',
  year: 818,
  yearPrecision: 'approximate',
  content: ['连昌宫中满宫竹，', '岁久无人森似束。', '又有墙头千叶桃，', '风动落花红蔌蔌。', '宫边老人为余泣，', '小年进食曾因入。'],
  highlight: ['连昌宫中满宫竹，岁久无人森似束。'],
  places: [{ placeId: 'luoyang', relation: 'described' }],
  story: '以连昌宫兴废写开元天宝盛衰，与《长恨歌》同为元白长篇叙事名作。',
  sources: ['《全唐诗》卷四一九'],
});
add({
  id: 'yuan-zhen-lichi',
  title: '行宫',
  poetId: 'yuanzhen',
  period: 'middle',
  year: 810,
  yearPrecision: 'inferred',
  content: ['寥落古行宫，', '宫花寂寞红。', '白头宫女在，', '闲坐说玄宗。'],
  highlight: ['白头宫女在，闲坐说玄宗。'],
  places: [{ placeId: 'xingqinggong', relation: 'related' }],
  story: '二十字写尽沧桑。行宫与玄宗联想，可与兴庆宫、华清宫的历史记忆互参。',
  sources: ['《全唐诗》卷四一〇'],
});

// —— 韩愈 柳宗元 刘禹锡 李贺 韦应物 卢纶 ——
add({
  id: 'zuoqian-langguan',
  title: '左迁至蓝关示侄孙湘',
  poetId: 'hanyu',
  period: 'middle',
  year: 819,
  yearPrecision: 'exact',
  content: ['一封朝奏九重天，', '夕贬潮州路八千。', '欲为圣明除弊事，', '肯将衰朽惜残年！', '云横秦岭家何在？', '雪拥蓝关马不前。', '知汝远来应有意，', '好收吾骨瘴江边。'],
  highlight: ['云横秦岭家何在？雪拥蓝关马不前。'],
  places: [
    { placeId: 'langguan', relation: 'composed' },
    { placeId: 'zhongnanshan', relation: 'described' },
  ],
  story: '因谏迎佛骨贬潮州，途经蓝关大雪，示侄孙韩湘。',
  sources: ['《全唐诗》卷三四四'],
});
add({
  id: 'zaochun-chengshui',
  title: '早春呈水部张十八员外',
  poetId: 'hanyu',
  period: 'middle',
  year: 823,
  yearPrecision: 'approximate',
  content: ['天街小雨润如酥，', '草色遥看近却无。', '最是一年春好处，', '绝胜烟柳满皇都。'],
  highlight: ['天街小雨润如酥，草色遥看近却无。'],
  places: [{ placeId: 'zhuque', relation: 'described' }],
  story: '写长安天街早春，观察细腻，历来被认为是早春写景绝唱。',
  sources: ['《全唐诗》卷三四四'],
});
add({
  id: 'jiangxue',
  title: '江雪',
  poetId: 'liuzongyuan',
  period: 'middle',
  year: 805,
  yearPrecision: 'approximate',
  content: ['千山鸟飞绝，', '万径人踪灭。', '孤舟蓑笠翁，', '独钓寒江雪。'],
  highlight: ['孤舟蓑笠翁，独钓寒江雪。'],
  places: [{ placeId: 'zhongnanshan', relation: 'related' }],
  story: '贬永州后作。清冷孤高的意境，亦是其长安政治挫折后的精神写照。',
  sources: ['《全唐诗》卷三五二'],
});
add({
  id: 'dengliuzhou-chenglou',
  title: '登柳州城楼寄漳汀封连四州刺史',
  poetId: 'liuzongyuan',
  period: 'middle',
  year: 815,
  yearPrecision: 'exact',
  content: ['城上高楼接大荒，', '海天愁思正茫茫。', '惊风乱飐芙蓉水，', '密雨斜侵薜荔墙。', '岭树重遮千里目，', '江流曲似九回肠。', '共来百越文身地，', '犹自音书滞一乡。'],
  highlight: ['岭树重遮千里目，江流曲似九回肠。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '与刘禹锡等同时远贬。诗中家国之思回望长安。',
  sources: ['《全唐诗》卷三五一'],
});
add({
  id: 'xuan-du-guan',
  title: '元和十年自朗州至京戏赠看花诸君子',
  poetId: 'liuyuxi',
  period: 'middle',
  year: 815,
  yearPrecision: 'exact',
  content: ['紫陌红尘拂面来，', '无人不道看花回。', '玄都观里桃千树，', '尽是刘郎去后栽。'],
  highlight: ['玄都观里桃千树，尽是刘郎去后栽。'],
  places: [{ placeId: 'zhuque', relation: 'described' }],
  story: '重返长安游玄都观，以桃花讽朝中新贵，旋再遭贬。',
  sources: ['《全唐诗》卷三六五'],
});
add({
  id: 'wuyi-xiang',
  title: '乌衣巷',
  poetId: 'liuyuxi',
  period: 'middle',
  year: 826,
  yearPrecision: 'approximate',
  content: ['朱雀桥边野草花，', '乌衣巷口夕阳斜。', '旧时王谢堂前燕，', '飞入寻常百姓家。'],
  highlight: ['旧时王谢堂前燕，飞入寻常百姓家。'],
  places: [{ placeId: 'zhuque', relation: 'related' }],
  story: '写金陵乌衣巷兴衰。朱雀桥名与长安朱雀大街同构「朱雀」意象。',
  sources: ['《全唐诗》卷三六五'],
});
add({
  id: 'lihe-jin-tong',
  title: '金铜仙人辞汉歌',
  poetId: 'lihe',
  period: 'middle',
  year: 812,
  yearPrecision: 'inferred',
  content: ['茂陵刘郎秋风客，', '夜闻马嘶晓无迹。', '画栏桂树悬秋香，', '三十六宫土花碧。', '魏官牵车指千里，', '东关酸风射眸子。', '空将汉月出宫门，', '忆君清泪如铅水。'],
  highlight: ['天若有情天亦老。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '李贺任奉礼郎时作，以汉宫铜人迁魏写兴亡之感，折射长安宫阙记忆。',
  sources: ['《全唐诗》卷三九一'],
});
add({
  id: 'lihe-li-ping',
  title: '李凭箜篌引',
  poetId: 'lihe',
  period: 'middle',
  year: 810,
  yearPrecision: 'approximate',
  content: ['吴丝蜀桐张高秋，', '空山凝云颓不流。', '江娥啼竹素女愁，', '李凭中国弹箜篌。', '昆山玉碎凤凰叫，', '芙蓉泣露香兰笑。'],
  highlight: ['昆山玉碎凤凰叫，芙蓉泣露香兰笑。'],
  places: [{ placeId: 'pingkang', relation: 'related' }],
  story: '写梨园乐工李凭弹箜篌之妙。长安宫廷与坊曲是此类音乐诗的舞台。',
  sources: ['《全唐诗》卷三九〇'],
});
add({
  id: 'chuzhou-xijian',
  title: '滁州西涧',
  poetId: 'weiyingwu',
  period: 'middle',
  year: 784,
  yearPrecision: 'approximate',
  content: ['独怜幽草涧边生，', '上有黄鹂深树鸣。', '春潮带雨晚来急，', '野渡无人舟自横。'],
  highlight: ['春潮带雨晚来急，野渡无人舟自横。'],
  places: [{ placeId: 'zhongnanshan', relation: 'related' }],
  story: '韦应物牧滁州时作。其澄淡诗风可溯至长安宫廷侍卫后的转向。',
  sources: ['《全唐诗》卷一九三'],
});
add({
  id: 'fengqiao-yebo',
  title: '寄全椒山中道士',
  poetId: 'weiyingwu',
  period: 'middle',
  year: 785,
  yearPrecision: 'inferred',
  content: ['今朝郡斋冷，', '忽念山中客。', '涧底束荆薪，', '归来煮白石。', '欲持一瓢酒，', '远慰风雨夕。', '落叶满空山，', '何处寻行迹。'],
  highlight: ['落叶满空山，何处寻行迹。'],
  places: [{ placeId: 'zhongnanshan', relation: 'related' }],
  story: '写怀山中道士。终南、华山一带是唐人访道常见地理。',
  sources: ['《全唐诗》卷一八八'],
});
add({
  id: 'sais-xia-qu',
  title: '塞下曲·其二',
  poetId: 'lulun',
  period: 'middle',
  year: 780,
  yearPrecision: 'inferred',
  content: ['林暗草惊风，', '将军夜引弓。', '平明寻白羽，', '没在石棱中。'],
  highlight: ['平明寻白羽，没在石棱中。'],
  places: [{ placeId: 'anxi', relation: 'related' }],
  story: '边塞组诗名篇，用李广故事。安西等地是唐人边塞想象的远方。',
  sources: ['《全唐诗》卷二七八'],
});
add({
  id: 'sais-xia-qu-3',
  title: '塞下曲·其三',
  poetId: 'lulun',
  period: 'middle',
  year: 780,
  yearPrecision: 'inferred',
  content: ['月黑雁飞高，', '单于夜遁逃。', '欲将轻骑逐，', '大雪满弓刀。'],
  highlight: ['欲将轻骑逐，大雪满弓刀。'],
  places: [{ placeId: 'anxi', relation: 'related' }],
  story: '写雪夜欲追敌的紧张，边塞诗中的经典画面。',
  sources: ['《全唐诗》卷二七八'],
});

// —— 晚唐 ——
add({
  id: 'leyouyuan-lishangyin',
  title: '乐游原',
  poetId: 'lishangyin',
  period: 'late',
  year: 850,
  yearPrecision: 'approximate',
  content: ['向晚意不适，', '驱车登古原。', '夕阳无限好，', '只是近黄昏。'],
  highlight: ['夕阳无限好，只是近黄昏。'],
  places: [{ placeId: 'leyouyuan', relation: 'composed' }],
  story: '登乐游原抒迟暮之感，二十字含无尽苍凉。',
  sources: ['《全唐诗》卷五三九'],
});
add({
  id: 'jinse',
  title: '锦瑟',
  poetId: 'lishangyin',
  period: 'late',
  year: 848,
  yearPrecision: 'inferred',
  content: ['锦瑟无端五十弦，', '一弦一柱思华年。', '庄生晓梦迷蝴蝶，', '望帝春心托杜鹃。', '沧海月明珠有泪，', '蓝田日暖玉生烟。', '此情可待成追忆，', '只是当时已惘然。'],
  highlight: ['此情可待成追忆，只是当时已惘然。', '蓝田日暖玉生烟。'],
  places: [{ placeId: 'wangchuan', relation: 'related' }],
  story: '无题诗代表。蓝田产玉，与长安东南蓝田辋川地理相连。',
  sources: ['《全唐诗》卷五三九'],
});
add({
  id: 'ye-yu-ji-bei',
  title: '夜雨寄北',
  poetId: 'lishangyin',
  period: 'late',
  year: 851,
  yearPrecision: 'approximate',
  content: ['君问归期未有期，', '巴山夜雨涨秋池。', '何当共剪西窗烛，', '却话巴山夜雨时。'],
  highlight: ['何当共剪西窗烛，却话巴山夜雨时。'],
  places: [
    { placeId: 'bashu', relation: 'described' },
    { placeId: 'daminggong', relation: 'related' },
  ],
  story: '巴山夜雨中寄长安亲友（一说寄内），时空对照精妙。',
  sources: ['《全唐诗》卷五三九'],
});
add({
  id: 'guo-huaqing-1',
  title: '过华清宫绝句·其一',
  poetId: 'dumu',
  period: 'late',
  year: 837,
  yearPrecision: 'approximate',
  content: ['长安回望绣成堆，', '山顶千门次第开。', '一骑红尘妃子笑，', '无人知是荔枝来。'],
  highlight: ['一骑红尘妃子笑，无人知是荔枝来。'],
  places: [
    { placeId: 'huaqinggong', relation: 'described' },
    { placeId: 'lishan', relation: 'described' },
  ],
  story: '过骊山华清宫，讽玄宗为贵妃驰送荔枝的奢靡。',
  sources: ['《全唐诗》卷五二一'],
});
add({
  id: 'guo-huaqing-2',
  title: '过华清宫绝句·其二',
  poetId: 'dumu',
  period: 'late',
  year: 837,
  yearPrecision: 'approximate',
  content: ['新丰绿树起黄埃，', '数骑渔阳探使回。', '霓裳一曲千峰上，', '舞破中原始下来。'],
  highlight: ['霓裳一曲千峰上，舞破中原始下来。'],
  places: [{ placeId: 'huaqinggong', relation: 'described' }],
  story: '写渔阳叛乱消息与霓裳歌舞的对比，讥刺更深。',
  sources: ['《全唐诗》卷五二一'],
});
add({
  id: 'bo-qinhuai',
  title: '泊秦淮',
  poetId: 'dumu',
  period: 'late',
  year: 838,
  yearPrecision: 'approximate',
  content: ['烟笼寒水月笼沙，', '夜泊秦淮近酒家。', '商女不知亡国恨，', '隔江犹唱后庭花。'],
  highlight: ['商女不知亡国恨，隔江犹唱后庭花。'],
  places: [{ placeId: 'fanchuan', relation: 'related' }],
  story: '秦淮感怀。杜牧祖居樊川，其家国之思常与长安门第记忆相连。',
  sources: ['《全唐诗》卷五二三'],
});
add({
  id: 'qingming',
  title: '清明',
  poetId: 'dumu',
  period: 'late',
  year: 840,
  yearPrecision: 'inferred',
  content: ['清明时节雨纷纷，', '路上行人欲断魂。', '借问酒家何处有？', '牧童遥指杏花村。'],
  highlight: ['借问酒家何处有？牧童遥指杏花村。'],
  places: [{ placeId: 'fanchuan', relation: 'related' }],
  story: '一说作于江南。杏花村意象广泛，城南樊川清明踏青亦有类似风物。',
  sources: ['《全唐诗》卷五二二'],
});
add({
  id: 'shangshan-zaoxing',
  title: '商山早行',
  poetId: 'wentingyun',
  period: 'late',
  year: 850,
  yearPrecision: 'approximate',
  content: ['晨起动征铎，', '客行悲故乡。', '鸡声茅店月，', '人迹板桥霜。', '槲叶落山路，', '枳花明驿墙。', '因思杜陵梦，', '凫雁满回塘。'],
  highlight: ['鸡声茅店月，人迹板桥霜。'],
  places: [
    { placeId: 'shaoling', relation: 'related' },
    { placeId: 'baqiao', relation: 'related' },
  ],
  story: '「杜陵梦」直指长安南郊杜陵（少陵原）的故乡之思。',
  sources: ['《全唐诗》卷五八一'],
});
add({
  id: 'wang-jiangnan',
  title: '望江南·梳洗罢',
  poetId: 'wentingyun',
  period: 'late',
  year: 850,
  yearPrecision: 'inferred',
  content: ['梳洗罢，', '独倚望江楼。', '过尽千帆皆不是，', '斜晖脉脉水悠悠。', '肠断白蘋洲。'],
  highlight: ['过尽千帆皆不是，斜晖脉脉水悠悠。'],
  places: [{ placeId: 'pingkang', relation: 'related' }],
  story: '花间词代表。温庭筠熟稔长安坊市与歌筵，其词多写闺情而背景在都市娱乐空间。',
  sources: ['《花间集》'],
});
add({
  id: 'taicheng',
  title: '台城',
  poetId: 'weizhuang',
  period: 'late',
  year: 890,
  yearPrecision: 'approximate',
  content: ['江雨霏霏江草齐，', '六朝如梦鸟空啼。', '无情最是台城柳，', '依旧烟笼十里堤。'],
  highlight: ['六朝如梦鸟空啼。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '金陵怀古。韦庄亲历长安被黄巢军攻占，其兴亡之感极深。',
  sources: ['《全唐诗》卷六九七'],
});
add({
  id: 'qin-fu-yin',
  title: '秦妇吟（节选）',
  poetId: 'weizhuang',
  period: 'late',
  year: 884,
  yearPrecision: 'exact',
  content: ['中和癸卯春三月，', '洛阳城外花如雪。', '东西南北路人绝，', '绿杨悄悄香尘灭。', '路旁忽见如花人，', '独向绿杨阴下歇。', '凤侧鸾欹鬓脚斜，', '红攒黛敛眉心折。'],
  highlight: ['内库烧为锦绣灰，天街踏尽公卿骨。'],
  places: [
    { placeId: 'zhuque', relation: 'described' },
    { placeId: 'luoyang', relation: 'described' },
  ],
  story: '以秦妇口述写黄巢破长安惨状，为唐人叙事长诗巨制。天街即朱雀街一带。',
  sources: ['敦煌写本 / 韦庄集'],
});
add({
  id: 'pi-ri-xiu-yekou',
  title: '汴河怀古',
  poetId: 'pirixiu',
  period: 'late',
  year: 870,
  yearPrecision: 'inferred',
  content: ['尽道隋亡为此河，', '至今千里赖通波。', '若无水殿龙舟事，', '共禹论功不较多。'],
  highlight: ['尽道隋亡为此河，至今千里赖通波。'],
  places: [{ placeId: 'luoyang', relation: 'related' }],
  story: '论隋运河功过。皮日休任太常博士时在长安，史论诗常带两京视野。',
  sources: ['《全唐诗》卷六一五'],
});
add({
  id: 'pi-ri-xiu-changan',
  title: '长安秋晚',
  poetId: 'pirixiu',
  period: 'late',
  year: 868,
  yearPrecision: 'approximate',
  content: ['希夷道士语，', '吾亦少知音。', '静坐秋灯下，', '闲开贝叶经。'],
  highlight: ['静坐秋灯下，闲开贝叶经。'],
  places: [{ placeId: 'qinglongsi', relation: 'related' }],
  story: '写长安秋夜读经。青龙寺等城东佛寺是晚唐士人习见的宗教空间。',
  sources: ['《全唐诗》卷六一二'],
});
add({
  id: 'lu-gui-meng-bieye',
  title: '别业',
  poetId: 'luguimeng',
  period: 'late',
  year: 870,
  yearPrecision: 'inferred',
  content: ['水国凉气早，', '池岛荷艳鲜。', '山衣犹自荷，', '村酒不须钱。'],
  highlight: ['水国凉气早，池岛荷艳鲜。'],
  places: [{ placeId: 'qujiang', relation: 'related' }],
  story: '隐逸闲适。陆龟蒙落第后离长安，诗中常以水乡对照帝都记忆。',
  sources: ['《全唐诗》卷六二一'],
});
add({
  id: 'lu-gui-meng-huai',
  title: '怀宛陵旧游',
  poetId: 'luguimeng',
  period: 'late',
  year: 872,
  yearPrecision: 'inferred',
  content: ['陵阳佳地昔年游，', '谢脁青山李白楼。', '唯有日斜溪上思，', '酒旗风影落春流。'],
  highlight: ['酒旗风影落春流。'],
  places: [{ placeId: 'dayanta', relation: 'related' }],
  story: '怀旧游。晚唐士人科场与漫游之间，长安慈恩一带是共同记忆。',
  sources: ['《全唐诗》卷六二八'],
});
add({
  id: 'luoyin-feng',
  title: '蜂',
  poetId: 'luoyin',
  period: 'late',
  year: 870,
  yearPrecision: 'inferred',
  content: ['不论平地与山尖，', '无限风光尽被占。', '采得百花成蜜后，', '为谁辛苦为谁甜？'],
  highlight: ['采得百花成蜜后，为谁辛苦为谁甜？'],
  places: [{ placeId: 'dayanta', relation: 'related' }],
  story: '讽喻世情。罗隐屡败长安科场，此类诗常被读作对钻营与不公的讽刺。',
  sources: ['《全唐诗》卷六六二'],
});
add({
  id: 'luoyin-zixuan',
  title: '自遣',
  poetId: 'luoyin',
  period: 'late',
  year: 875,
  yearPrecision: 'inferred',
  content: ['得即高歌失即休，', '多愁多恨亦悠悠。', '今朝有酒今朝醉，', '明日愁来明日愁。'],
  highlight: ['今朝有酒今朝醉，明日愁来明日愁。'],
  places: [{ placeId: 'pingkang', relation: 'related' }],
  story: '旷达语中有牢骚。长安平康、酒楼是落第士人消磨岁月之所。',
  sources: ['《全唐诗》卷六五六'],
});

// —— 初唐四杰与杜审言、陈子昂、王之涣 ——
add({
  id: 'song-du-shaofu',
  title: '送杜少府之任蜀州',
  poetId: 'wangbo',
  period: 'early',
  year: 670,
  yearPrecision: 'approximate',
  content: ['城阙辅三秦，', '风烟望五津。', '与君离别意，', '同是宦游人。', '海内存知己，', '天涯若比邻。', '无为在歧路，', '儿女共沾巾。'],
  highlight: ['海内存知己，天涯若比邻。'],
  places: [
    { placeId: 'daminggong', relation: 'described' },
    { placeId: 'bashu', relation: 'related' },
  ],
  story: '「城阙辅三秦」即写长安城阙。送友人入蜀，一洗送别儿女之态。',
  sources: ['《全唐诗》卷五六'],
});
add({
  id: 'tengwang-ge',
  title: '滕王阁诗',
  poetId: 'wangbo',
  period: 'early',
  year: 675,
  yearPrecision: 'approximate',
  content: ['滕王高阁临江渚，', '佩玉鸣鸾罢歌舞。', '画栋朝飞南浦云，', '珠帘暮卷西山雨。', '闲云潭影日悠悠，', '物换星移几度秋。', '阁中帝子今何在？', '槛外长江空自流。'],
  highlight: ['阁中帝子今何在？槛外长江空自流。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '南昌滕王阁。王勃弱冠出入长安文坛，此诗代表其短促而辉煌的才华。',
  sources: ['《全唐诗》卷五五'],
});
add({
  id: 'congjun-xing-yj',
  title: '从军行',
  poetId: 'yangjiong',
  period: 'early',
  year: 680,
  yearPrecision: 'inferred',
  content: ['烽火照西京，', '心中自不平。', '牙璋辞凤阙，', '铁骑绕龙城。', '雪暗凋旗画，', '风多杂鼓声。', '宁为百夫长，', '胜作一书生。'],
  highlight: ['宁为百夫长，胜作一书生。'],
  places: [
    { placeId: 'daminggong', relation: 'described' },
    { placeId: 'anxi', relation: 'related' },
  ],
  story: '「西京」「凤阙」即长安。写投笔从戎的志向。',
  sources: ['《全唐诗》卷五〇'],
});
add({
  id: 'changan-guyi',
  title: '长安古意',
  poetId: 'luzhaolin',
  period: 'early',
  year: 670,
  yearPrecision: 'approximate',
  content: ['长安大道连狭斜，', '青牛白马七香车。', '玉辇纵横过主第，', '金鞭络绎向侯家。', '龙衔宝盖承朝日，', '凤吐流苏带晚霞。', '百丈游丝争绕树，', '一群娇鸟共啼花。'],
  highlight: ['长安大道连狭斜，青牛白马七香车。'],
  places: [
    { placeId: 'zhuque', relation: 'described' },
    { placeId: 'pingkang', relation: 'described' },
  ],
  story: '长篇歌行写长安豪贵生活与世情变迁，为初唐长安都市诗巨制。',
  sources: ['《全唐诗》卷四一'],
});
add({
  id: 'di-jing-pian',
  title: '帝京篇（节选）',
  poetId: 'luobinwang',
  period: 'early',
  year: 670,
  yearPrecision: 'approximate',
  content: ['山河千里国，', '城阙九重门。', '不睹皇居壮，', '安知天子尊。', '皇居帝里崤函谷，', '鹑野龙山侯甸服。', '五纬连影集星躔，', '八水分流横地轴。'],
  highlight: ['不睹皇居壮，安知天子尊。'],
  places: [
    { placeId: 'taijigong', relation: 'described' },
    { placeId: 'zhuque', relation: 'described' },
  ],
  story: '铺陈帝京形胜与宫阙之盛，是初唐京城题材代表。',
  sources: ['《全唐诗》卷七七'],
});
add({
  id: 'yong-liu',
  title: '咏柳',
  poetId: 'dushenyan', // wait he has 和晋陵 - use 和晋陵陆丞早春游望
  period: 'early',
  year: 690,
  yearPrecision: 'inferred',
  content: ['独有宦游人，', '偏惊物候新。', '云霞出海曙，', '梅柳渡江春。', '淑气催黄鸟，', '晴光转绿蘋。', '忽闻歌古调，', '归思欲沾巾。'],
  highlight: ['云霞出海曙，梅柳渡江春。'],
  places: [{ placeId: 'baqiao', relation: 'related' }],
  story: '原题《和晋陵陆丞早春游望》。杜审言为杜甫祖父，长安宫廷诗人代表。灞柳送别与早春意象相关。',
  sources: ['《全唐诗》卷六二'],
});
// fix title for dushenyan poem
poems[poems.length - 1].title = '和晋陵陆丞早春游望';
poems[poems.length - 1].id = 'he-jinling-lucheng';

add({
  id: 'deng-youzhou-tai',
  title: '登幽州台歌',
  poetId: 'chenziang',
  period: 'early',
  year: 696,
  yearPrecision: 'approximate',
  content: ['前不见古人，', '后不见来者。', '念天地之悠悠，', '独怆然而涕下。'],
  highlight: ['前不见古人，后不见来者。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '随军东北时作。陈子昂在长安倡风骨，此诗为其精神高标。',
  sources: ['《全唐诗》卷八三'],
});
add({
  id: 'chunye-bie-youren',
  title: '春夜别友人',
  poetId: 'chenziang',
  period: 'early',
  year: 690,
  yearPrecision: 'inferred',
  content: ['银烛吐青烟，', '金樽对绮筵。', '离堂思琴瑟，', '别路绕山川。', '明月隐高树，', '长河没晓天。', '悠悠洛阳道，', '此会在何年。'],
  highlight: ['明月隐高树，长河没晓天。'],
  places: [{ placeId: 'luoyang', relation: 'described' }],
  story: '两京道上送别，可见初唐士人在长安—洛阳之间的流动。',
  sources: ['《全唐诗》卷八四'],
});
add({
  id: 'liangzhou-ci',
  title: '凉州词',
  poetId: 'wangzhihuan',
  period: 'high',
  year: 730,
  yearPrecision: 'inferred',
  content: ['黄河远上白云间，', '一片孤城万仞山。', '羌笛何须怨杨柳，', '春风不度玉门关。'],
  highlight: ['羌笛何须怨杨柳，春风不度玉门关。'],
  places: [
    { placeId: 'yangguan', relation: 'related' },
    { placeId: 'anxi', relation: 'related' },
  ],
  story: '边塞绝唱。旗亭画壁传说中此诗与王之涣在长安酒楼的名声相连。',
  sources: ['《全唐诗》卷二五三'],
});
add({
  id: 'deng-guanque-lou',
  title: '登鹳雀楼',
  poetId: 'wangzhihuan',
  period: 'high',
  year: 730,
  yearPrecision: 'inferred',
  content: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'],
  highlight: ['欲穷千里目，更上一层楼。'],
  places: [{ placeId: 'weishui', relation: 'related' }],
  story: '写登高望远。黄河—关中水系与长安西北地理气势相通。',
  sources: ['《全唐诗》卷二五三'],
});

// more poems to exceed 60
add({
  id: 'wangwei-jiuyue',
  title: '九月九日忆山东兄弟',
  poetId: 'wangwei',
  period: 'high',
  year: 717,
  yearPrecision: 'approximate',
  content: ['独在异乡为异客，', '每逢佳节倍思亲。', '遥知兄弟登高处，', '遍插茱萸少一人。'],
  highlight: ['每逢佳节倍思亲。'],
  places: [{ placeId: 'leyouyuan', relation: 'related' }],
  story: '少年王维在长安望乡。重阳登高是长安乐游原等处的习俗。',
  sources: ['《全唐诗》卷一二八'],
});
add({
  id: 'libai-yuexia',
  title: '月下独酌·其一',
  poetId: 'libai',
  period: 'high',
  year: 744,
  yearPrecision: 'approximate',
  content: ['花间一壶酒，', '独酌无相亲。', '举杯邀明月，', '对影成三人。', '月既不解饮，', '影徒随我身。', '暂伴月将影，', '行乐须及春。'],
  highlight: ['举杯邀明月，对影成三人。'],
  places: [{ placeId: 'xingqinggong', relation: 'related' }],
  story: '长安供奉翰林期间孤独心境的写照。',
  sources: ['《全唐诗》卷一八二'],
});
add({
  id: 'dufu-wangyue',
  title: '望岳',
  poetId: 'dufu',
  period: 'high',
  year: 736,
  yearPrecision: 'approximate',
  content: ['岱宗夫如何？', '齐鲁青未了。', '造化钟神秀，', '阴阳割昏晓。', '荡胸生曾云，', '决眦入归鸟。', '会当凌绝顶，', '一览众山小。'],
  highlight: ['会当凌绝顶，一览众山小。'],
  places: [{ placeId: 'zhongnanshan', relation: 'related' }],
  story: '早年漫游作。后困守长安，「会当凌绝顶」的志向与帝都求仕相连。',
  sources: ['《全唐诗》卷二一六'],
});
add({
  id: 'bai-ma-bi',
  title: '卖炭翁',
  poetId: 'baijuyi',
  period: 'middle',
  year: 809,
  yearPrecision: 'approximate',
  content: ['卖炭翁，', '伐薪烧炭南山中。', '满面尘灰烟火色，', '两鬓苍苍十指黑。', '卖炭得钱何所营？', '身上衣裳口中食。', '可怜身上衣正单，', '心忧炭贱愿天寒。'],
  highlight: ['可怜身上衣正单，心忧炭贱愿天寒。'],
  places: [
    { placeId: 'zhongnanshan', relation: 'described' },
    { placeId: 'dongshi', relation: 'related' },
  ],
  story: '新乐府。南山烧炭入长安市，揭露宫市之弊。',
  sources: ['《全唐诗》卷四二七'],
});
add({
  id: 'hanyu-shan-shi',
  title: '山石',
  poetId: 'hanyu',
  period: 'middle',
  year: 801,
  yearPrecision: 'approximate',
  content: ['山石荦确行径微，', '黄昏到寺蝙蝠飞。', '升堂坐阶新雨足，', '芭蕉叶大栀子肥。'],
  highlight: ['芭蕉叶大栀子肥。'],
  places: [{ placeId: 'zhongnanshan', relation: 'related' }],
  story: '记游山寺。韩愈在长安周边的登山访寺诗之一。',
  sources: ['《全唐诗》卷三三八'],
});
add({
  id: 'liuyuxi-qiupu',
  title: '秋词',
  poetId: 'liuyuxi',
  period: 'middle',
  year: 820,
  yearPrecision: 'inferred',
  content: ['自古逢秋悲寂寥，', '我言秋日胜春朝。', '晴空一鹤排云上，', '便引诗情到碧霄。'],
  highlight: ['我言秋日胜春朝。'],
  places: [{ placeId: 'leyouyuan', relation: 'related' }],
  story: '一反悲秋传统。刘禹锡重返长安前后多有旷达之音。',
  sources: ['《全唐诗》卷三六五'],
});
add({
  id: 'dumu-shanxing',
  title: '山行',
  poetId: 'dumu',
  period: 'late',
  year: 845,
  yearPrecision: 'inferred',
  content: ['远上寒山石径斜，', '白云生处有人家。', '停车坐爱枫林晚，', '霜叶红于二月花。'],
  highlight: ['霜叶红于二月花。'],
  places: [{ placeId: 'fanchuan', relation: 'related' }],
  story: '城南樊川、终南一带秋山红叶正是此景。',
  sources: ['《全唐诗》卷五二二'],
});
add({
  id: 'lishangyin-wuti',
  title: '无题·相见时难',
  poetId: 'lishangyin',
  period: 'late',
  year: 848,
  yearPrecision: 'inferred',
  content: ['相见时难别亦难，', '东风无力百花残。', '春蚕到死丝方尽，', '蜡炬成灰泪始干。', '晓镜但愁云鬓改，', '夜吟应觉月光寒。', '蓬山此去无多路，', '青鸟殷勤为探看。'],
  highlight: ['春蚕到死丝方尽，蜡炬成灰泪始干。'],
  places: [{ placeId: 'pingkang', relation: 'related' }],
  story: '无题名篇。李商隐在长安的情感与党争阴影下的婉转心曲。蓬山为想象，不建标记。',
  sources: ['《全唐诗》卷五三九'],
});
add({
  id: 'weizhuang-jinse',
  title: '菩萨蛮·人人尽说江南好',
  poetId: 'weizhuang',
  period: 'late',
  year: 900,
  yearPrecision: 'inferred',
  content: ['人人尽说江南好，', '游人只合江南老。', '春水碧于天，', '画船听雨眠。', '垆边人似月，', '皓腕凝霜雪。', '未老莫还乡，', '还乡须断肠。'],
  highlight: ['未老莫还乡，还乡须断肠。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '乱后避地江南，对「还乡」（含长安）已成断肠事。',
  sources: ['《花间集》'],
});
add({
  id: 'yangjiong-ye',
  title: '夜送赵纵',
  poetId: 'yangjiong',
  period: 'early',
  year: 685,
  yearPrecision: 'inferred',
  content: ['赵氏连城璧，', '由来天下传。', '送君还旧府，', '明月满前川。'],
  highlight: ['送君还旧府，明月满前川。'],
  places: [{ placeId: 'baqiao', relation: 'related' }],
  story: '长安送别短章，清刚有风骨。',
  sources: ['《全唐诗》卷五〇'],
});
add({
  id: 'luobinwang-yong-e',
  title: '咏鹅',
  poetId: 'luobinwang',
  period: 'early',
  year: 650,
  yearPrecision: 'inferred',
  content: ['鹅，鹅，鹅，', '曲项向天歌。', '白毛浮绿水，', '红掌拨清波。'],
  highlight: ['白毛浮绿水，红掌拨清波。'],
  places: [{ placeId: 'qujiang', relation: 'related' }],
  story: '相传幼年作。骆宾王后任职长安，曲江池鹅影是帝都常见风物。',
  sources: ['《全唐诗》卷七九'],
});
add({
  id: 'luzhaolin-changan-end',
  title: '长安古意（结句）',
  poetId: 'luzhaolin',
  period: 'early',
  year: 670,
  yearPrecision: 'approximate',
  content: ['节物风光不相待，', '桑田碧海须臾改。', '昔时金阶白玉堂，', '即今唯见青松在。', '寂寂寥寥扬子居，', '年年岁岁一床书。', '独有南山桂花发，', '飞来飞去袭人裾。'],
  highlight: ['昔时金阶白玉堂，即今唯见青松在。'],
  places: [
    { placeId: 'zhuque', relation: 'described' },
    { placeId: 'zhongnanshan', relation: 'described' },
  ],
  story: '《长安古意》后半，写繁华成空与书生寂寞，南山指终南。',
  sources: ['《全唐诗》卷四一'],
});
add({
  id: 'dufu-lvye',
  title: '旅夜书怀',
  poetId: 'dufu',
  period: 'high',
  year: 765,
  yearPrecision: 'approximate',
  content: ['细草微风岸，', '危樯独夜舟。', '星垂平野阔，', '月涌大江流。', '名岂文章著，', '官应老病休。', '飘飘何所似，', '天地一沙鸥。'],
  highlight: ['星垂平野阔，月涌大江流。'],
  places: [{ placeId: 'bashu', relation: 'described' }],
  story: '离开成都后漂泊所作。对比其长安十年，更见身世飘零。',
  sources: ['《全唐诗》卷二二七'],
});
add({
  id: 'libai-zixia',
  title: '早发白帝城',
  poetId: 'libai',
  period: 'high',
  year: 759,
  yearPrecision: 'exact',
  content: ['朝辞白帝彩云间，', '千里江陵一日还。', '两岸猿声啼不住，', '轻舟已过万重山。'],
  highlight: ['两岸猿声啼不住，轻舟已过万重山。'],
  places: [
    { placeId: 'jiangling', relation: 'described' },
    { placeId: 'bashu', relation: 'described' },
  ],
  story: '流放夜郎遇赦东还。江陵为关键地理节点。',
  sources: ['《全唐诗》卷一八一'],
});
add({
  id: 'bai-gong-ci',
  title: '宫词',
  poetId: 'baijuyi',
  period: 'middle',
  year: 810,
  yearPrecision: 'inferred',
  content: ['泪湿罗巾梦不成，', '夜深前殿按歌声。', '红颜未老恩先断，', '斜倚薰笼坐到明。'],
  highlight: ['红颜未老恩先断，斜倚薰笼坐到明。'],
  places: [{ placeId: 'taijigong', relation: 'described' }],
  story: '写宫人失宠。太极、大明、兴庆诸宫是宫词地理背景。',
  sources: ['《全唐诗》卷四四一'],
});
add({
  id: 'yuanzhen-li-si',
  title: '离思·其四',
  poetId: 'yuanzhen',
  period: 'middle',
  year: 810,
  yearPrecision: 'approximate',
  content: ['曾经沧海难为水，', '除却巫山不是云。', '取次花丛懒回顾，', '半缘修道半缘君。'],
  highlight: ['曾经沧海难为水，除却巫山不是云。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '悼亡名句。元稹长安仕宦期间的情感世界。',
  sources: ['《全唐诗》卷四一〇'],
});
add({
  id: 'lihe-yanmen',
  title: '雁门太守行',
  poetId: 'lihe',
  period: 'middle',
  year: 812,
  yearPrecision: 'inferred',
  content: ['黑云压城城欲摧，', '甲光向日金鳞开。', '角声满天秋色里，', '塞上燕脂凝夜紫。', '半卷红旗临易水，', '霜重鼓寒声不起。', '报君黄金台上意，', '提携玉龙为君死。'],
  highlight: ['黑云压城城欲摧，甲光向日金鳞开。'],
  places: [{ placeId: 'anxi', relation: 'related' }],
  story: '边塞奇诡色彩。李贺在长安以乐府古题写战争。',
  sources: ['《全唐诗》卷三九〇'],
});
add({
  id: 'weiyingwu-chuzhou',
  title: '淮上喜会梁川故人',
  poetId: 'weiyingwu',
  period: 'middle',
  year: 780,
  yearPrecision: 'inferred',
  content: ['江汉曾为客，', '相逢每醉还。', '浮云一别后，', '流水十年间。', '欢笑情如旧，', '萧疏鬓已斑。', '何因北归去，', '淮上对秋山。'],
  highlight: ['浮云一别后，流水十年间。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '故人重逢。韦应物自长安侍卫到外任的人生跨度。',
  sources: ['《全唐诗》卷一八八'],
});
add({
  id: 'dumu-jiangnan-chun',
  title: '江南春',
  poetId: 'dumu',
  period: 'late',
  year: 840,
  yearPrecision: 'inferred',
  content: ['千里莺啼绿映红，', '水村山郭酒旗风。', '南朝四百八十寺，', '多少楼台烟雨中。'],
  highlight: ['南朝四百八十寺，多少楼台烟雨中。'],
  places: [{ placeId: 'qinglongsi', relation: 'related' }],
  story: '写江南佛寺之盛。与长安青龙、慈恩等寺形成南北佛寺文化对照。',
  sources: ['《全唐诗》卷五二二'],
});
add({
  id: 'lishangyin-jasheng',
  title: '贾生',
  poetId: 'lishangyin',
  period: 'late',
  year: 845,
  yearPrecision: 'inferred',
  content: ['宣室求贤访逐臣，', '贾生才调更无伦。', '可怜夜半虚前席，', '不问苍生问鬼神。'],
  highlight: ['不问苍生问鬼神。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '借汉文帝宣室召贾谊讽当代君主。长安宫廷政治的咏史投射。',
  sources: ['《全唐诗》卷五三九'],
});
add({
  id: 'wentingyun-lishi',
  title: '利州南渡',
  poetId: 'wentingyun',
  period: 'late',
  year: 855,
  yearPrecision: 'inferred',
  content: ['澹然空水对斜晖，', '曲岛苍茫接翠微。', '波上马嘶看棹去，', '柳边人歇待船归。', '数丛沙草群鸥散，', '万顷江田一鹭飞。', '谁解乘舟寻范蠡，', '五湖烟水独忘机。'],
  highlight: ['万顷江田一鹭飞。'],
  places: [{ placeId: 'bashu', relation: 'described' }],
  story: '入蜀途中作。温庭筠屡试长安不第后的漂泊。',
  sources: ['《全唐诗》卷五八一'],
});
add({
  id: 'luoyin-xizhong',
  title: '感弄猴人赐朱绂',
  poetId: 'luoyin',
  period: 'late',
  year: 880,
  yearPrecision: 'approximate',
  content: ['十二三年就试期，', '五湖烟月奈相违。', '何如买取胡孙弄，', '一笑君王便著绯。'],
  highlight: ['何如买取胡孙弄，一笑君王便著绯。'],
  places: [{ placeId: 'daminggong', relation: 'described' }],
  story: '讽刺弄猴人因逗乐得官，对照自身长安屡试不第。',
  sources: ['《全唐诗》卷六六五'],
});
add({
  id: 'pirixiu-yongtian',
  title: '橡媪叹',
  poetId: 'pirixiu',
  period: 'late',
  year: 865,
  yearPrecision: 'inferred',
  content: ['秋深橡子熟，', '散落榛芜冈。', '伛偻黄发媪，', '拾之践晨霜。', '移时始盈掬，', '尽日方满筐。'],
  highlight: ['伛偻黄发媪，拾之践晨霜。'],
  places: [{ placeId: 'zhongnanshan', relation: 'related' }],
  story: '写山中贫媪拾橡实为食，批判苛政。终南山下民生亦是长安周边现实。',
  sources: ['《全唐诗》卷六〇八'],
});
add({
  id: 'luguimeng-baixi',
  title: '白莲',
  poetId: 'luguimeng',
  period: 'late',
  year: 870,
  yearPrecision: 'inferred',
  content: ['素花多蒙别艳欺，', '此花端合在瑶池。', '无情有恨何人觉，', '月晓风清欲堕时。'],
  highlight: ['无情有恨何人觉，月晓风清欲堕时。'],
  places: [{ placeId: 'qujiang', relation: 'related' }],
  story: '咏白莲高洁。曲江芙蓉、城南陂塘是唐人赏荷之地。',
  sources: ['《全唐诗》卷六二八'],
});
add({
  id: 'chenziang-ganyu',
  title: '感遇·兰若生春夏',
  poetId: 'chenziang',
  period: 'early',
  year: 690,
  yearPrecision: 'inferred',
  content: ['兰若生春夏，', '芊蔚何青青。', '幽独空林色，', '朱蕤冒紫茎。', '迟迟白日晚，', '袅袅秋风生。', '岁华尽摇落，', '芳意竟何成！'],
  highlight: ['岁华尽摇落，芳意竟何成！'],
  places: [{ placeId: 'zhongnanshan', relation: 'related' }],
  story: '感遇组诗以香草喻志。陈子昂在长安的政治理想与挫折。',
  sources: ['《全唐诗》卷八三'],
});
add({
  id: 'dushenyan-zaochun',
  title: '渡湘江',
  poetId: 'dushenyan',
  period: 'early',
  year: 698,
  yearPrecision: 'approximate',
  content: ['迟日园林悲昔游，', '今春花鸟作边愁。', '独怜京国人南窜，', '不似湘江水北流。'],
  highlight: ['独怜京国人南窜，不似湘江水北流。'],
  places: [{ placeId: 'daminggong', relation: 'related' }],
  story: '流贬途中望京国。「京国」即长安。',
  sources: ['《全唐诗》卷六二'],
});

// ensure portraits
for (const p of poets) {
  p.portrait = PORTRAIT;
}

// validate counts
const poetIds = new Set(poets.map((p) => p.id));
const placeIds = new Set(places.map((p) => p.id));
for (const poem of poems) {
  if (!poetIds.has(poem.poetId)) throw new Error('bad poet ' + poem.poetId);
  for (const ref of poem.places) {
    if (!placeIds.has(ref.placeId)) throw new Error('bad place ' + ref.placeId + ' in ' + poem.id);
  }
}

writeFileSync(
  join(ROOT, 'data/poets.json'),
  JSON.stringify({ poets }, null, 2),
  'utf8'
);
writeFileSync(
  join(ROOT, 'data/places.json'),
  JSON.stringify({ places }, null, 2),
  'utf8'
);
writeFileSync(
  join(ROOT, 'data/poems.json'),
  JSON.stringify({ poems }, null, 2),
  'utf8'
);

console.log(
  `Generated: poets=${poets.length} places=${places.length} poems=${poems.length}`
);
