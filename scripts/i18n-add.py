#!/usr/bin/env python3
"""Add keys to en.ts and every locale dictionary in one pass.

Parity is the whole point of the layout: `Dict` is typed from English, so a key
that lands in only one file is a build error. Doing the insertions in one script
means the nine files can never drift apart mid-migration.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
EN = ROOT / "src" / "i18n" / "en.ts"
LOCALES = ["es", "ht", "pt", "vi", "zh", "ar", "so", "kea"]

# key -> {lang: text} ; 'en' is the English value.
NEW: dict[str, dict[str, str]] = {
    "time.yesterday": {
        "en": "Yesterday",
        "es": "Ayer",
        "ht": "Yè",
        "pt": "Ontem",
        "vi": "Hôm qua",
        "zh": "昨天",
        "ar": "أمس",
        "so": "Shalay",
        "kea": "Onte",
    },
    "news.autoRefreshed": {
        "en": "The feed reloads on its own while this page is open.",
        "es": "El contenido se recarga solo mientras esta página está abierta.",
        "ht": "Kontni a rechaje pou kont li pandan paj sa a ouvri.",
        "pt": "O conteúdo recarrega sozinho enquanto esta página está aberta.",
        "vi": "Nội dung tự tải lại khi trang này đang mở.",
        "zh": "页面保持打开时，内容会自动重新加载。",
        "ar": "يُعاد تحميل المحتوى تلقائيًا ما دامت هذه الصفحة مفتوحة.",
        "so": "Waxyaabaha si toos ah ayaa loo dib-u-soo-dejiyaa inta boggan furan yahay.",
        "kea": "Konteúdi ta rekarga solus mentre sta pájina ubri.",
    },
    "resources.intro": {
        "en": "Verified organizations and services for Dorchester residents.",
        "es": "Organizaciones y servicios verificados para residentes de Dorchester.",
        "ht": "Òganizasyon ak sèvis verifye pou rezidan Dorchester.",
        "pt": "Organizações e serviços verificados para moradores de Dorchester.",
        "vi": "Các tổ chức và dịch vụ đã được xác minh dành cho cư dân Dorchester.",
        "zh": "经核实的组织与服务，供多切斯特居民使用。",
        "ar": "منظمات وخدمات تم التحقق منها لمقيمي دورتشيستر.",
        "so": "Hay'ado iyo adeegyo la xaqiijiyay oo loogu talagalay dadka deggan Dorchester.",
        "kea": "Organizasonus i servisus confermá pa residente di Dorchester.",
    },
    "common.ongoing": {
        "en": "Applications open",
        "es": "Convocatoria abierta",
        "ht": "Dat yo ap resevwa demann",
        "pt": "Inscrições abertas",
        "vi": "Đang nhận đơn",
        "zh": "开放申请",
        "ar": "التقديم مفتوح",
        "so": "Codsi la qaadanayo",
        "kea": "Konsiderason habri",
    },
    "common.refresh": {
        "en": "Refresh",
        "es": "Actualizar",
        "ht": "Rezekite",
        "pt": "Atualizar",
        "vi": "Làm mới",
        "zh": "刷新",
        "ar": "تحديث",
        "so": "Cusbooneysii",
        "kea": "Atualiza",
    },
    "common.tryAnotherFilter": {
        "en": "Try another filter, or refresh the list.",
        "es": "Pruebe otro filtro o actualice la lista.",
        "ht": "Eseye yon lòt filtè oswa rezekite lis la.",
        "pt": "Tente outro filtro ou atualize a lista.",
        "vi": "Thử bộ lọc khác hoặc làm mới danh sách.",
        "zh": "换一个筛选条件，或刷新列表。",
        "ar": "جرّب مرشحًا آخر أو حدّث القائمة.",
        "so": "Isku day shaandho kale, ama liiska cusbooneysii.",
        "kea": "Prova otro filtru ou atualiza a lista.",
    },
    "emergency.body": {
        "en": "Food, shelter and rent help today, in your language. Interpreters are on the line.",
        "es": "Ayuda de comida, refugio y renta hoy, en su idioma. Hay intérpretes en la línea.",
        "ht": "Èd manje, abri ak lojman jodi a, nan lang ou. Gen entèprèt sou liy lan.",
        "pt": "Ajuda com alimentos, abrigo e aluguel hoje, no seu idioma. Há intérpretes na linha.",
        "vi": "Hỗ trợ thực phẩm, chỗ ở và tiền thuê ngay hôm nay, bằng ngôn ngữ của bạn. Có thông dịch viên.",
        "zh": "今天即可获得食物、住所和房租帮助，提供您的语言服务，线上有口译。",
        "ar": "مساعدة بالغذاء والمأوى والإيجار اليوم، بلغتك. يوجد مترجمون على الخط.",
        "so": "Caawimaad cunto, hoy iyo kirro maanta, luqaddaada. Turjumaanno ayaa khadka ku jira.",
        "kea": "Auda ku kumida, abritu i kasa hoji, na bo lingua. Intérprètes sta na linha.",
    },
    "faq.topic.housing": {
        "en": "Housing and rent",
        "es": "Vivienda y renta",
        "ht": "Lojman ak lwaye",
        "pt": "Moradia e aluguel",
        "vi": "Nhà ở và tiền thuê",
        "zh": "住房与租金",
        "ar": "الإسكان والإيجار",
        "so": "Guryeynta iyo kirada",
        "kea": "Kasa i renda",
    },
    "food.callHotline": {
        "en": "The FoodSource Hotline finds the nearest pantry and answers in your language.",
        "es": "La línea FoodSource encuentra la despensa más cercana y responde en su idioma.",
        "ht": "Liy FoodSource jwenn depo manje ki pi pre e li reponn nan lang ou.",
        "pt": "A linha FoodSource encontra a despensa mais próxima e atende no seu idioma.",
        "vi": "Đường dây FoodSource tìm điểm phát thực phẩm gần nhất và trả lời bằng ngôn ngữ của bạn.",
        "zh": "FoodSource 热线可为您查找最近的食品发放点，并用您的语言解答。",
        "ar": "خط FoodSource يجد أقرب مركز توزيع طعام ويجيبك بلغتك.",
        "so": "Xariirka FoodSource wuxuu kuu helaa meesha cunto ee ugu dhow, wuuna kuugu jawaabaa luqaddaada.",
        "kea": "Linha FoodSource ta atcha despensa mas prosimu i ta responde na bo lingua.",
    },
    "intro.subtitle": {
        "en": "Free, no account, no immigration questions",
        "es": "Gratis, sin cuenta, sin preguntas sobre inmigración",
        "ht": "Gratis, san kont, san kesyon sou imigrasyon",
        "pt": "Grátis, sem conta e sem perguntas sobre imigração",
        "vi": "Miễn phí, không cần tài khoản, không hỏi về tình trạng di trú",
        "zh": "免费，无需注册，不询问移民身份",
        "ar": "مجاني، بدون حساب ولا أسئلة عن الوضع القانوني",
        "so": "Bilaash, akoon ma baahna, su’aalo socdaal ma jiro",
        "kea": "Gratis, konta nun, pregunta sobre imigrason nun",
    },
    "intro.body": {
        "en": "DOR101 keeps one list of food, housing, health and legal help in Dorchester, checked against the source and published in nine languages.",
        "es": "DOR101 mantiene una sola lista de ayuda de comida, vivienda, salud y legal en Dorchester, verificada con la fuente y publicada en nueve idiomas.",
        "ht": "DOR101 kenbe yon sèl lis èd manje, lojman, sante ak legal nan Dorchester, verifye ak sous la e pibliye nan nevyen lang.",
        "pt": "O DOR101 mantém uma única lista de ajuda alimentar, habitacional, de saúde e jurídica em Dorchester, verificada com a fonte e publicada em nove idiomas.",
        "vi": "DOR101 lưu một danh sách duy nhất về hỗ trợ thực phẩm, nhà ở, y tế và pháp lý tại Dorchester, được đối chiếu với nguồn và xuất bản bằng chín ngôn ngữ.",
        "zh": "DOR101 为多切斯特集中一份食物、住房、医疗与法律援助名单，逐项对照来源核实，并以九种语言发布。",
        "ar": "يحتفظ DOR101 بقائمة واحدة لمساعدات الغذاء والسكن والرعاية الصحية والقانونية في دورتشيستر، مع التحقق من كل بند من مصدره ونشره بتسع لغات.",
        "so": "DOR101 wuxuu hayaa hal liis oo caawimaad cunto, guri, caafimaad iyo sharci oo Dorchester ah, oo lala xaqiijiyay ilaha lana daabacay sagaal luqadood.",
        "kea": "DOR101 ta tene un sola lista di ajuda ku kumida, kasa, Saúde i Ley na Dorchester, confermá ku fonte i publiká na nove lingua.",
    },
    "map.subtitle": {
        "en": "Satellite imagery, live MBTA arrivals and every verified resource pin.",
        "es": "Imágenes de satélite, llegadas del MBTA en vivo y cada punto verificado.",
        "ht": "Imaj satelit, arive MBTA an dirèk ak chak pwen verifye.",
        "pt": "Imagens de satélite, chegadas do MBTA ao vivo e cada ponto verificado.",
        "vi": "Ảnh vệ tinh, giờ đến MBTA trực tiếp và mọi điểm đánh dấu đã xác minh.",
        "zh": "卫星影像、MBTA 实时到站信息，以及每个经核实的资源标记。",
        "ar": "صور الأقمار الصناعية ووصول MBTA المباشر وكل موقع تم التحقق منه.",
        "so": "Sawirro dayax-gacan, soo gaadhista MBTA ee tooska ah iyo dhammaan meelaha la xaqiijiyay.",
        "kea": "Imadjen satelite, chegada di MBTA na tempu real i kada ponto confermá.",
    },
    "news.liveFeed": {
        "en": "Live feed",
        "es": "Feed en vivo",
        "ht": "Flux an dirèk",
        "pt": "Feed ao vivo",
        "vi": "Bản tin trực tiếp",
        "zh": "实时动态",
        "ar": "بث مباشر",
        "so": "Toos u daadegaya",
        "kea": "Na tempu real",
    },
    "news.last24h": {
        "en": "Last 24 hours",
        "es": "Últimas 24 horas",
        "ht": "Dènye 24 èdtan yo",
        "pt": "Últimas 24 horas",
        "vi": "24 giờ qua",
        "zh": "最近 24 小时",
        "ar": "آخر 24 ساعة",
        "so": "24-kii saac ee la soo dhaafay",
        "kea": "Últimas 24 ora",
    },
    "news.badgeNew": {
        "en": "New",
        "es": "Nuevo",
        "ht": "Nouvo",
        "pt": "Novo",
        "vi": "Mới",
        "zh": "新",
        "ar": "جديد",
        "so": "Cusub",
        "kea": "Novu",
    },
    "news.fromPublisher": {
        "en": "From the publisher",
        "es": "Del medio original",
        "ht": "Sous editè a",
        "pt": "Do veículo original",
        "vi": "Từ tòa soạn gốc",
        "zh": "来自原发布方",
        "ar": "من الناشر الأصلي",
        "so": "Isha warbaahinta",
        "kea": "Di medián orijinál",
    },
    "news.sourcesNote": {
        "en": "Headlines come straight from each publisher’s feed. Nothing is rewritten here.",
        "es": "Los titulares llegan directo del feed de cada medio. Nada se reescribe aquí.",
        "ht": "Tit yo soti dirèkteman nan flux chak editè. Anyen pa reekri isit la.",
        "pt": "As manchetes vêm direto do feed de cada veículo. Nada é reescrito aqui.",
        "vi": "Tiêu đề lấy trực tiếp từ nguồn của từng tòa soạn. Không có gì được viết lại ở đây.",
        "zh": "标题直接来自各发布方的信息源，本站不作改写。",
        "ar": "تأتي العناوين مباشرة من خلاصة كل ناشر. لا يُعاد صياغة أي شيء هنا.",
        "so": "Cinwaannadu waxay toos uga yimaadaan il kasta. Waxba halkan lagama beddelin.",
        "kea": "Titlon bin direktu for di feed di kada medián. Nada ta reeskribi aki.",
    },
    "projects.source": {
        "en": "Development data comes from the BPDA project docket.",
        "es": "Los datos de desarrollo provienen del expediente de proyectos de la BPDA.",
        "ht": "Done devlopman yo soti nan dosye pwojè BPDA a.",
        "pt": "Os dados de desenvolvimento vêm do dossiê de projetos da BPDA.",
        "vi": "Dữ liệu phát triển lấy từ hồ sơ dự án của BPDA.",
        "zh": "开发数据来自 BPDA 的项目档案。",
        "ar": "تأتي بيانات التطوير من ملف مشاريع هيئة BPDA.",
        "so": "Xogta horumarinta waxay ka timaaddaa diiwaanka mashruuca BPDA.",
        "kea": "Dadus di desenvolvimentu bin for di dosié di projetu BPDA.",
    },
    "resources.notSure": {
        "en": "Not sure where to start?",
        "es": "¿No sabe por dónde empezar?",
        "ht": "Pa konnen kote pou kòmanse?",
        "pt": "Não sabe por onde começar?",
        "vi": "Không biết bắt đầu từ đâu?",
        "zh": "不确定该从哪里开始？",
        "ar": "لست متأكدًا من أين تبدأ؟",
        "so": "Ma ogee meesha aad ka bilaabi lahayd?",
        "kea": "Bo sa sabi di undi kumensa?",
    },
    "resources.call211": {
        "en": "Call 2-1-1 any time, day or night, for free and confidential help finding services.",
        "es": "Llame al 2-1-1 a cualquier hora, de día o de noche, para ayuda gratuita y confidencial al buscar servicios.",
        "ht": "Rele 2-1-1 nenpòt lè, lajounen kou lafwè, pou èd gratis ak konfidansyèl pou jwenn sèvis.",
        "pt": "Ligue para 2-1-1 a qualquer hora, de dia ou de noite, para ajuda gratuita e confidencial ao procurar serviços.",
        "vi": "Gọi 2-1-1 bất cứ lúc nào, ngày hay đêm, để được hỗ trợ miễn phí và bảo mật khi tìm dịch vụ.",
        "zh": "全天候拨打 2-1-1，免费且保密地协助您找到所需服务。",
        "ar": "اتصل بـ 2-1-1 في أي وقت، ليلًا أو نهارًا، للحصول على مساعدة مجانية وسرية لإيجاد الخدمات.",
        "so": "Wac 2-1-1 wakhti kasta, habeen iyo maalin, si aad bilaash iyo sir ugu hesho caawimaad aad ku helto adeegyo.",
        "kea": "Liga 2-1-1 kualka ora, di i notchi, pa oda gratis i konfidensiál pa atcha servisus.",
    },
}

KEY_LINE = re.compile(r"^  '([^']+)':")


def quote(text: str) -> str:
    return "'" + text.replace("\\", "\\\\").replace("'", "\\'") + "'"


def en_block(entry: tuple[str, dict[str, str]]) -> str:
    key, table = entry
    return f"  {quote(key)}: {quote(table['en'])},"


def insert_into(path: pathlib.Path, anchor: str | None, line_fn, label: str) -> None:
    src = path.read_text()
    lines = src.splitlines()
    index = None
    if anchor:
        for i, l in enumerate(lines):
            m = KEY_LINE.match(l)
            if m and m.group(1) == anchor:
                # Advance past a multi-line value.
                j = i
                while j + 1 < len(lines) and not lines[j].rstrip().endswith(("',", "\",")):
                    j += 1
                index = j + 1
                break
    if index is None:
        for i, l in enumerate(lines):
            if l.startswith("};") or l.strip() == "}":
                index = i
                break
    if index is None:
        print(f"!! no insertion point for {label} in {path}")
        sys.exit(1)
    new_lines = [line_fn(key) for key in entries_for(path)]
    lines[index:index] = new_lines
    path.write_text("\n".join(lines) + "\n")


def entries_for(path: pathlib.Path):
    return list(NEW.keys()) if path != EN else list(NEW.keys())


def anchor_for(key: str, ordered: list[str]) -> str | None:
    """Insert after the last existing key sharing the longest prefix."""
    parts = key.split(".")
    for depth in range(len(parts) - 1, 0, -1):
        prefix = ".".join(parts[:depth])
        candidates = [k for k in ordered if k.startswith(prefix + ".")]
        if candidates:
            return candidates[-1]
    return None


def main() -> int:
    apply = "--apply" in sys.argv
    argv = sys.argv[1:]
    if "--from" in argv:
        path = pathlib.Path(argv[argv.index("--from") + 1])
        loaded = json.loads(path.read_text())
        NEW.clear()
        NEW.update(loaded)

    en_src = EN.read_text()
    ordered = re.findall(r"^\s{2}'([^']+)':", en_src, re.M)
    existing = set(ordered)
    todo = {k: v for k, v in NEW.items() if k not in existing}
    if len(todo) != len(NEW):
        for k in NEW:
            if k in existing:
                print(f"skip, already present: {k}")
    NEW.clear()
    NEW.update(todo)
    if not todo:
        print("nothing to add")
        return 0

    # Group new keys by their insertion anchor so each file gets one splice.
    groups: dict[str | None, list[str]] = {}
    for key in todo:
        groups.setdefault(anchor_for(key, ordered), []).append(key)

    if apply:
        for anchor, keys in groups.items():
            index = len(ordered)
            if anchor:
                index = ordered.index(anchor) + 1
                ordered[index:index] = keys
            en_lines = en_src.splitlines()
            # Recompute the file line for the anchor each time.
            src_now = EN.read_text()
            lines = src_now.splitlines()
            at = None
            if anchor:
                for i, l in enumerate(lines):
                    m = KEY_LINE.match(l)
                    if m and m.group(1) == anchor:
                        j = i
                        while j + 1 < len(lines) and not lines[j].rstrip().endswith(("',", "\",")):
                            j += 1
                        at = j + 1
                        break
            if at is None:
                at = next((i for i, l in enumerate(lines) if l.startswith("};") or l.startswith("} as")), len(lines) - 1)
            lines[at:at] = [f"  {quote(k)}: {quote(todo[k]['en'])}," for k in keys]
            EN.write_text("\n".join(lines) + "\n")

        for code in LOCALES:
            path = ROOT / "src" / "i18n" / "locales" / f"{code}.ts"
            src = path.read_text()
            lines = src.splitlines()
            order = [KEY_LINE.match(l).group(1) for l in lines if KEY_LINE.match(l)]
            inserted = 0
            for anchor, keys in groups.items():
                at = None
                if anchor and anchor in order:
                    idx = order.index(anchor)
                    # find that line in the file
                    seen = -1
                    for i, l in enumerate(lines):
                        m = KEY_LINE.match(l)
                        if m:
                            seen += 1
                            if seen == idx:
                                j = i
                                while j + 1 < len(lines) and not lines[j].rstrip().endswith(("',", "\",")):
                                    j += 1
                                at = j + 1
                                break
                if at is None:
                    at = next((i for i, l in enumerate(lines) if l.startswith("};") or l.startswith("} as") or l.strip() == "}"), len(lines) - 1)
                lines[at:at] = [f"  {quote(k)}: {quote(todo[k][code])}," for k in keys]
                inserted += len(keys)
            path.write_text("\n".join(lines) + "\n")
            print(f"{code}: +{inserted} keys")
        print(f"added {len(todo)} keys to en.ts and {len(LOCALES)} locales")
        return 0

    print("dry run, would add:")
    for k, v in todo.items():
        print(f"  {k}: {v['en']}")
    return 0


main()
