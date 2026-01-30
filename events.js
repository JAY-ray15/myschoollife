// 事件卡牌数据
// 影响: energy(E), academics(A), connection(C), self(S)
// 正数为增加，负数为减少

const CHARACTERS = {
    narrator: { name: '', role: '', avatar: '🎓' },
    roommate: { name: '室友', role: '室友', avatar: '🛏️' },
    professor: { name: '王教授', role: '任课老师', avatar: '👨‍🏫' },
    crush: { name: 'TA', role: '暗恋的人', avatar: '💕' },
    counselor: { name: '辅导员', role: '辅导员', avatar: '📋' },
    parent: { name: '妈妈', role: '家人', avatar: '📞' },
    friend: { name: '朋友', role: '朋友', avatar: '👥' },
    self: { name: '', role: '内心', avatar: '🤔' },
    club: { name: '社长', role: '社团', avatar: '🎪' },
    nobody: { name: '', role: '', avatar: '📝' }
};

const EVENTS = [
    {
        text: "早上七点，闹钟响了。你昨晚三点才睡。",
        character: CHARACTERS.self,
        left: { text: "起床去上课", effect: { E: -15, A: +10 } },
        right: { text: "再睡一小时", effect: { E: +10, A: -15 } }
    },
    {
        text: "室友在打游戏，声音很大，你想休息。",
        character: CHARACTERS.roommate,
        left: { text: "忍了", effect: { E: -10, S: -5 } },
        right: { text: "让他小声点", effect: { C: -10, E: +5 } }
    },
    {
        text: "社团群里在讨论周末活动，但你还有作业没写完。",
        character: CHARACTERS.club,
        left: { text: "参加活动", effect: { C: +15, A: -10 } },
        right: { text: "写作业", effect: { A: +10, C: -10 } }
    },
    {
        text: "朋友圈里，同学们都在晒各种成就和实习offer。",
        character: CHARACTERS.self,
        left: { text: "继续刷", effect: { S: -15, E: -5 } },
        right: { text: "放下手机", effect: { S: +5, C: -5 } }
    },
    {
        text: "期中考试还有一周，你才开始复习。",
        character: CHARACTERS.professor,
        left: { text: "通宵复习", effect: { E: -20, A: +15 } },
        right: { text: "正常复习", effect: { A: +5, E: -5 } }
    },
    {
        text: "「今晚有空吗？」对方发来消息。",
        character: CHARACTERS.crush,
        left: { text: "答应", effect: { C: +20, A: -10, E: -5 } },
        right: { text: "拒绝，要学习", effect: { A: +5, S: -10, C: -5 } }
    },
    {
        text: "辅导员发消息，说你最近出勤率有点低。",
        character: CHARACTERS.counselor,
        left: { text: "道歉保证改正", effect: { S: -5, A: +5 } },
        right: { text: "装死不回", effect: { S: +5, A: -10 } }
    },
    {
        text: "你发现自己在课堂上完全听不懂老师在讲什么。",
        character: CHARACTERS.professor,
        left: { text: "课后自学", effect: { E: -15, A: +10 } },
        right: { text: "摆烂不管", effect: { E: +5, A: -15, S: -5 } }
    },
    {
        text: "父母打来电话，问你这最近怎么样。",
        character: CHARACTERS.parent,
        left: { text: "报喜不报忧", effect: { S: -10, C: +5 } },
        right: { text: "说实话", effect: { S: +5, C: -5 } }
    },
    {
        text: "室友过生日，邀请你一起去聚餐。",
        character: CHARACTERS.roommate,
        left: { text: "去", effect: { C: +15, E: -10, A: -5 } },
        right: { text: "不去", effect: { A: +5, C: -15 } }
    },
    {
        text: "你看到有人在做兼职，一个月能赚两千块。",
        character: CHARACTERS.nobody,
        left: { text: "也去找兼职", effect: { E: -15, A: -10, S: +5 } },
        right: { text: "专心学习", effect: { A: +5, E: +5 } }
    },
    {
        text: "深夜，你刷视频刷到凌晨两点。",
        character: CHARACTERS.self,
        left: { text: "继续刷", effect: { E: -10, S: -10 } },
        right: { text: "强制睡觉", effect: { E: +5, S: -5 } }
    },
    {
        text: "老师说下周要交大作业，现在开始吗？",
        character: CHARACTERS.professor,
        left: { text: "现在开始", effect: { E: -10, A: +15 } },
        right: { text: "再说", effect: { E: +5, A: -10 } }
    },
    {
        text: "朋友心情不好，找你倾诉。",
        character: CHARACTERS.friend,
        left: { text: "陪他聊", effect: { C: +15, E: -10 } },
        right: { text: "敷衍一下", effect: { C: -10, E: +5 } }
    },
    {
        text: "你发现室友在背后议论你。",
        character: CHARACTERS.roommate,
        left: { text: "质问他", effect: { C: -15, S: +5 } },
        right: { text: "装不知道", effect: { S: -10, E: -5 } }
    },
    {
        text: "学校举办篮球赛，班级需要人参加。",
        character: CHARACTERS.friend,
        left: { text: "报名", effect: { C: +10, E: -15, A: -5 } },
        right: { text: "不参加", effect: { A: +5, C: -5 } }
    },
    {
        text: "你在网上看到一篇关于「内卷」的文章。",
        character: CHARACTERS.self,
        left: { text: "焦虑地读完", effect: { S: -15, E: -5 } },
        right: { text: "划走", effect: { S: +5 } }
    },
    {
        text: "小组作业，队友都没动静。",
        character: CHARACTERS.friend,
        left: { text: "一个人做完", effect: { E: -20, A: +10, S: -5 } },
        right: { text: "催队友", effect: { C: -10, E: -5 } }
    },
    {
        text: "周末，你可以去图书馆或者睡觉。",
        character: CHARACTERS.nobody,
        left: { text: "图书馆", effect: { A: +10, E: -10 } },
        right: { text: "睡一天", effect: { E: +15, A: -10 } }
    },
    {
        text: "你开始怀疑自己选的专业到底是不是自己喜欢的。",
        character: CHARACTERS.self,
        left: { text: "深入思考", effect: { S: +10, E: -10 } },
        right: { text: "不想了", effect: { S: -10, E: +5 } }
    },
    // DDL压力相关事件
    {
        text: "下周有三个DDL同时到来。你感觉到了吗？",
        character: CHARACTERS.professor,
        left: { text: "开始赶工", effect: { E: -20, A: +10 } },
        right: { text: "先玩再说", effect: { A: -15, E: +5 } },
        isDDL: true
    },
    {
        text: "你发现自己有两周没去上课了。",
        character: CHARACTERS.counselor,
        left: { text: "补课", effect: { E: -15, A: +10 } },
        right: { text: "继续逃", effect: { A: -20, S: -5 } },
        isDDL: true
    },
    {
        text: "考试时间表出来了，你的考试连着四天。",
        character: CHARACTERS.professor,
        left: { text: "制定计划", effect: { E: -5, A: +10, S: +5 } },
        right: { text: "随缘", effect: { S: -10, A: -10 } },
        isDDL: true
    },
    {
        text: "你发现还有三天就要交论文，而你只写了标题。",
        character: CHARACTERS.professor,
        left: { text: "通宵写", effect: { E: -25, A: +15 } },
        right: { text: "申请延期", effect: { A: -10, S: -5 } },
        isDDL: true
    },
    {
        text: "室友问你复习得怎么样了。你觉得呢？",
        character: CHARACTERS.roommate,
        left: { text: "还行吧", effect: { S: -5, C: +5 } },
        right: { text: "别问了", effect: { C: -10, S: -5 } },
        isDDL: true
    },
    {
        text: "你在朋友圈看到别人已经复习完三轮了。",
        character: CHARACTERS.self,
        left: { text: "慌了", effect: { S: -15, E: -10 } },
        right: { text: "关我什么事", effect: { S: +5, C: -5 } },
        isDDL: true
    },
    {
        text: "凌晨三点，你还在赶ddl，咖啡已经不管用了。",
        character: CHARACTERS.self,
        left: { text: "继续", effect: { E: -25, A: +10 } },
        right: { text: "睡觉", effect: { A: -15, E: +10 } },
        isDDL: true
    },
    {
        text: "你发现自己已经记不清上次好好吃饭是什么时候了。",
        character: CHARACTERS.nobody,
        left: { text: "去吃顿好的", effect: { E: +10, A: -5 } },
        right: { text: "继续赶ddl", effect: { E: -15, A: +5 } },
        isDDL: true
    }
];

// 结局数据
const ENDINGS = {
    energy: {
        title: "崩溃",
        text: "你彻底崩溃了。\n\n睡眠不足让你连走路都打晃，有一天早上，你无论如何也起不来了。辅导员把你送到了医院，医生说你需要休息。学期提前结束。",
        icon: "💀"
    },
    academics: {
        title: "挂科",
        text: "各科挂科，你的学期成绩以零告终。\n\n连最基本的学分都没保住。看着成绩单上那一串刺眼的红色，你不知道该怎么和父母说。",
        icon: "📕"
    },
    connection: {
        title: "孤独",
        text: "朋友和室友全都离你而去。\n\n你孤独地度过了整个学期。有一天你想找个人说话，翻开通讯录，却发现不知道该打给谁。",
        icon: "👤"
    },
    self: {
        title: "迷失",
        text: "你完全迷失了自己。\n\n不知道为何而学，为谁而努力。你只是在机械地活着，像一具没有灵魂的躯壳。",
        icon: "🔮"
    },
    semester: {
        balanced: {
            title: "一个普通的学期",
            text: "学期结束了。\n\n你活下来了。没有什么特别的惊喜，也没有什么特别的遗憾。这就是大多数人的大学生活吧。",
            icon: "🎓"
        },
        social: {
            title: "一个热闹的学期",
            text: "学期结束了。\n\n你认识了很多朋友，参加了很多活动，但成绩单上的数字提醒你，有些东西被你忽略了。",
            icon: "🎉"
        },
        academic: {
            title: "一个努力的学期",
            text: "学期结束了。\n\n你的成绩很好，但当你放下书本，发现自己好像错过了很多别的东西。",
            icon: "📚"
        },
        awakened: {
            title: "一个觉醒的学期",
            text: "学期结束了。\n\n你找到了自己真正想要的东西，虽然过程很痛苦，但你终于明白了自己是谁。",
            icon: "✨"
        }
    }
};
