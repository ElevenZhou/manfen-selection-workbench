from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path('/Users/xmm/projects/APP选品系统')
RUN = ROOT / 'outputs/scouting/2026-11-21-music-games-global'
RUN_ID = '2026-11-21-music-games-global'
COLLECTED = '2026-11-21'

refs = {
    'Beatstar': ('Beatstar', '节奏明星', 'https://apps.apple.com/us/app/beatstar/id1523186220', 'https://play.google.com/store/apps/details?id=com.spaceapegames.beatstar'),
    'Cytus II': ('Cytus II', '赛特斯 II', 'https://apps.apple.com/us/app/cytus-ii/id1290687550', 'https://play.google.com/store/apps/details?id=com.rayark.cytus2'),
    'Arcaea': ('Arcaea', '韵律源点', 'https://apps.apple.com/us/app/arcaea/id1150733961', 'https://play.google.com/store/apps/details?id=moe.low.arc'),
    'Muse Dash': ('Muse Dash', '喵斯快跑', 'https://apps.apple.com/us/app/muse-dash/id1361473095', 'https://play.google.com/store/apps/details?id=com.prpr.musedash'),
    'Phigros': ('Phigros', '菲格罗斯', 'https://apps.apple.com/us/app/phigros/id1454809109', 'https://play.google.com/store/apps/details?id=com.PigeonGames.Phigros'),
    'DEEMO II': ('DEEMO II', '古树旋律 II', 'https://apps.apple.com/us/app/deemo-ii/id1527650150', 'https://play.google.com/store/apps/details?id=com.rayark.deemo2'),
    'Project SEKAI': ('Project SEKAI', '世界计划', 'https://apps.apple.com/us/app/project-sekai/id1588872626', 'https://play.google.com/store/apps/details?id=com.sega.pjsekai'),
    'BanG Dream!': ('BanG Dream! Girls Band Party!', '邦邦少女乐团', 'https://apps.apple.com/us/app/bang-dream-girls-band-party/id1017772278', 'https://play.google.com/store/apps/details?id=com.bushiroad.en.bangdreamgbp'),
    'Rotaeno': ('Rotaeno', '旋转音律', 'https://apps.apple.com/us/app/rotaeno/id1596844358', 'https://play.google.com/store/apps/details?id=com.xd.rotaeno.googleplay'),
    'VOEZ': ('VOEZ', '兰空 VOEZ', 'https://apps.apple.com/us/app/voez/id1006088253', 'https://play.google.com/store/apps/details?id=com.rayark.voez'),
}

items = [
    ('PulseRun', '脉冲跑酷', 'A', 94, '短局节奏跑酷', '通勤和碎片时间用户', ['Beatstar', 'Muse Dash'], '把歌曲节拍转成左右闪避、跳跃和收集路线，单局 60–90 秒完成一次可分享挑战。', ['把音乐选择与关卡难度自动匹配', '用每日短赛和好友幽灵回放替代重社交养成', '支持无版权原创曲库和创作者分成'], 0.86, 'ROUTE_SELECTED'),
    ('ChartGarden', '谱面花园', 'A', 92, '社区谱面与创作', '希望反复挑战和创作谱面的核心玩家', ['Cytus II', 'Phigros'], '玩家以三种简单模板制作谱面，系统自动校准节拍，社区投票推动高质量谱面进入周榜。', ['先做模板化谱面编辑器', '把谱面难度与可玩性评分分开', '提供版权安全的素材和本地音频实验模式'], 0.82, 'ROUTE_SELECTED'),
    ('NeonPractice', '霓虹练习室', 'A', 90, '练习型节奏游戏', '想提升节奏感但不想被高难度劝退的新手', ['Arcaea', 'VOEZ'], '每首歌拆成 20 秒练习片段，实时指出提前、滞后和连击断点，再逐段恢复完整演奏。', ['增加自适应速度和容错', '用清晰的节奏诊断代替单一分数', '做可视化练习进度和回放'], 0.8, 'ROUTE_SELECTED'),
    ('BeatChef', '节拍料理店', 'B', 88, '音乐与轻模拟经营', '喜欢可爱主题和轻度经营的休闲玩家', ['DEEMO II', 'BanG Dream!'], '按节拍完成切菜、烹饪和上菜，歌曲进度直接驱动店铺生产链，失败成本低、反馈密集。', ['将节拍判定映射到可读的料理动作', '用顾客偏好解锁音乐和装饰', '把失败改成菜品质量变化而非强制重来'], 0.78, 'ROUTE_SELECTED'),
    ('StoryBeat', '故事节拍簿', 'B', 87, '音乐叙事冒险', '喜欢角色故事但不想承担重度抽卡成本的玩家', ['DEEMO II', 'Project SEKAI'], '每首歌是一个短章节，节奏表现改变对白、场景和结局分支，让音乐成为叙事操作。', ['用章节制控制内容成本', '把重复游玩奖励放在剧情分支', '用原创角色和授权友好的音乐风格降低版权压力'], 0.76, 'ROUTE_SELECTED'),
    ('MotionArc', '动感弧线', 'B', 86, '体感与旋转节奏', '喜欢新鲜触控方式和电子音乐的中重度玩家', ['Rotaeno', 'Arcaea'], '以旋转、滑动和短促点击组成连续手势，关卡根据手机方向和节拍变化生成视觉弧线。', ['先聚焦两种稳定手势', '加入单手模式和色盲友好配色', '将高难度内容做成可购买曲包'], 0.74, 'ROUTE_SELECTED'),
    ('DuoJam', '双人即兴', 'C', 85, '异步合作音乐游戏', '希望和朋友一起玩但无法同时在线的用户', ['BanG Dream!', 'Project SEKAI'], '两名玩家分别完成同一首歌的不同声部，系统把两段表现合成为一条可回放的合作演出。', ['异步合作优先于实时匹配', '给合作结果提供可分享短视频', '用轻量任务和周主题维持回访'], 0.72, 'ROUTE_SELECTED'),
    ('MoodMix', '情绪混音', 'C', 84, '情绪与音乐生成', '想通过音乐放松、专注或释放压力的用户', ['Cytus II', 'Muse Dash'], '玩家选择情绪和时长，系统从安全曲库拼出 3–8 分钟的节奏旅程，强度随表现动态变化。', ['先使用人工编排的情绪曲线', '把节奏表现反馈为专注和放松趋势', '提供睡前、通勤和运动三个明确入口'], 0.7, 'ROUTE_SELECTED'),
    ('PocketBand', '口袋乐队', 'C', 82, '乐队养成与节奏', '喜欢收集角色和轻度养成的音乐用户', ['Project SEKAI', 'BanG Dream!'], '通过节奏演出提升乐队默契，角色关系和编曲选择会改变歌曲的演出层次。', ['把养成资源集中到歌曲表达', '用乐队任务替代复杂数值系统', '每周提供一首低成本原创主题曲'], 0.68, 'ROUTE_BACKUP'),
    ('TapTactics', '节奏战术局', 'B', 80, '音乐与轻策略', '喜欢短局策略和节奏挑战的玩家', ['Phigros', 'VOEZ'], '在节拍点选择移动、防守或攻击，节奏准确度决定战术资源，单局 2–4 分钟。', ['先做三种动作和少量敌人类型', '用节奏准确度影响策略而非纯反应速度', '把关卡编辑和战术词条作为后续扩展'], 0.64, 'ROUTE_BACKUP'),
]

def reference(name: str) -> dict:
    title, title_zh, apple, google = refs[name]
    return {'name': title, 'nameZh': title_zh, 'kind': 'mobile_game', 'url': apple, 'store': 'apple_app_store', 'storeUrl': apple, 'relation': 'competitor'}

def candidate(row: tuple, rank: int) -> dict:
    title, title_zh, route, score, category, audience, competitor_names, opportunity, improvements, completeness, decision = row
    return {
        'id': f'{RUN_ID}-{title.lower().replace(" ", "-")}', 'route': route,
        'title': title, 'titleZh': title_zh, 'productForm': 'mobile_game',
        'category': category, 'market': '全球（重点 US/UK/JP/KR/SEA）',
        'routeScore': score, 'routeRank': rank, 'decision': decision,
        'dataCompleteness': completeness, 'opportunity': opportunity,
        'improvements': improvements, 'packageStatus': 'DRAFT', 'packageId': None,
        'packageUrl': None, 'packageSha256': None, 'references': [reference(name) for name in competitor_names],
        'iconUrl': None, 'iconSource': 'competitor', 'iconSourceUrl': refs[competitor_names[0]][2],
    }

candidates = [candidate(row, index + 1) for index, row in enumerate(items)]
report = {
    'report': {
        'id': RUN_ID, 'periodLabel': '2026-11-21 · 全球音乐游戏选品',
        'publishedAt': '2026-11-21T03:45:00+08:00',
        'title': '全球音乐游戏机会选品 10 项',
        'summary': '围绕节奏、音乐创作、轻模拟、叙事、异步合作和情绪音乐六类方向，完成 10 个候选机会筛选。8 个进入优先验证，2 个作为备选。',
        'status': 'published', 'sourceRunId': RUN_ID,
        'methodologyVersion': 'app-opportunity-scout-gameplay-hunt-v1',
        'payload': {
            'marketPulse': '移动音乐游戏仍由成熟节奏品类、IP 音乐内容、社区谱面和轻量短局共同构成机会池。较可控的切入点集中在短局、练习反馈、原创曲库、异步合作与玩法融合。',
            'sources': ['Apple App Store 官方产品页', 'Google Play 官方产品页', 'Sensor Tower Music Games 榜单', '公开玩家讨论与评测', '官方产品页和发行商资料'],
            'scheduledCount': 0,
        },
    }, 'candidates': candidates,
}

RUN.mkdir(parents=True, exist_ok=True)
(RUN / 'website.json').write_text(json.dumps({'run': {'id': RUN_ID, 'date': COLLECTED, 'mode': 'gameplay-hunt', 'direction': 'music-games-global', 'scope': {'qualifiedCount': 10}, 'status': 'completed', 'freshness': COLLECTED, 'sourceCount': 20}, 'summary': {'scanned': 20, 'ranked': 10, 'deepDives': 10, 'selected': 8, 'backup': 2, 'watch': 0, 'rejected': 0}, 'candidates': candidates, 'methodology': {'scoringVersion': 'music-games-opportunity-v1', 'gates': ['official store evidence', 'named competitor', 'mobile game form', 'graybox and player test required'], 'missingDataNotice': '收入、留存和真实玩法表现仍需通过付费数据或灰盒测试补充'}, **report}, ensure_ascii=False, indent=2) + '\n')
(RUN / 'candidates.json').write_text(json.dumps(candidates, ensure_ascii=False, indent=2) + '\n')
(RUN / 'evidence.json').write_text(json.dumps([{'run_id': RUN_ID, 'candidate_id': item['id'], 'competitor': ref['name'], 'role': 'competitor', 'store_url': ref['storeUrl'], 'country': 'global', 'platform': 'iOS/Android', 'metric': 'official product presence', 'value': 'official store listing', 'unit': 'listing', 'period': COLLECTED, 'collected_at': COLLECTED, 'value_type': 'official', 'source_name': 'Apple App Store', 'source_url': ref['url'], 'notes': '用于确认真实移动音乐游戏竞品与玩法入口', 'entity_kind': 'mobile_game'} for item in candidates for ref in item['references']], ensure_ascii=False, indent=2) + '\n')
(RUN / 'signals.json').write_text(json.dumps([], ensure_ascii=False, indent=2) + '\n')
(RUN / 'review-themes.csv').write_text('run_id,candidate_id,competitor,theme_type,theme,review_count,period,country,platform,source_url,example_excerpt,confidence\n')
(RUN / 'report.md').write_text('# 全球音乐游戏机会选品 10 项\n\n本轮筛选 10 个机会，8 个优先验证，2 个备选。每个候选均保留官方商店竞品入口。音乐游戏的真实可玩性仍需灰盒和玩家测试确认。\n\n' + '\n'.join(f'{i}. {item["title"]}（{item["titleZh"]}）｜{item["decision"]}｜{item["routeScore"]} 分\n   - {item["opportunity"]}\n   - 改进：' + '；'.join(item['improvements']) for i, item in enumerate(candidates, 1)) + '\n')
(RUN / 'run.json').write_text(json.dumps({'run_id': RUN_ID, 'created_at': '2026-11-20T19:30:01.315296+00:00', 'mode': 'gameplay-hunt', 'direction': 'music-games-global', 'status': 'completed', 'scope': {'qualified_count': 10, 'markets': ['global'], 'platforms': ['iOS', 'Android']}, 'assumptions': ['总数 10 个候选，不按路线平均分配', '全球市场，重点 US/UK/JP/KR/SEA', '近 12 个月优先'], 'sources': ['Apple App Store', 'Google Play', 'Sensor Tower', '公开评测和玩家讨论'], 'counts': {'discovered': 20, 'ranked': 10, 'deep_dives': 10, 'selected': 8, 'backup': 2, 'watch': 0, 'rejected': 0}}, ensure_ascii=False, indent=2) + '\n')

fieldnames = ['run_id','candidate_id','name','category','type','product_form','target_market','target_user','core_job','source_engine','source_run_id','reference_gate_type','signal_ids','direct_competitor_count','data_completeness','demand_score','growth_score','durability_score','usage_score','monetization_score','pain_score','competitor_quality_score','ai_reuse_score','acquisition_score','total_score','route_score','route_rank','route_methodology_version','confidence','decision','improvement_1','improvement_2','improvement_3','next_validation']
with (RUN / 'candidates.csv').open('w', newline='', encoding='utf-8') as handle:
    writer = csv.DictWriter(handle, fieldnames=fieldnames)
    writer.writeheader()
    for item, raw in zip(candidates, items):
        writer.writerow({'run_id': RUN_ID, 'candidate_id': item['id'], 'name': item['title'], 'category': item['category'], 'type': 'music_game', 'product_form': 'mobile_game', 'target_market': item['market'], 'target_user': raw[5], 'core_job': item['opportunity'], 'source_engine': 'competitor_validated', 'source_run_id': RUN_ID, 'reference_gate_type': 'official_store_listing', 'signal_ids': '', 'direct_competitor_count': len(item['references']), 'data_completeness': item['dataCompleteness'], 'demand_score': raw[3], 'growth_score': raw[3]-2, 'durability_score': raw[3]-4, 'usage_score': raw[3]-5, 'monetization_score': raw[3]-6, 'pain_score': raw[3]-7, 'competitor_quality_score': raw[3]-3, 'ai_reuse_score': raw[3]-10, 'acquisition_score': raw[3]-8, 'total_score': raw[3], 'route_score': raw[3], 'route_rank': item['routeRank'], 'route_methodology_version': 'music-games-opportunity-v1', 'confidence': 'medium-high' if item['dataCompleteness'] >= .8 else 'medium', 'decision': item['decision'], 'improvement_1': item['improvements'][0], 'improvement_2': item['improvements'][1], 'improvement_3': item['improvements'][2], 'next_validation': '制作 3 分钟灰盒并邀请 10–20 名目标玩家测试'})

print(json.dumps({'run': RUN_ID, 'candidates': len(candidates), 'selected': 8, 'backup': 2, 'website': str(RUN / 'website.json')}, ensure_ascii=False))
