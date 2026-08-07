#!/usr/bin/env python3
"""README.md + docs/MIMARI.md -> docs/SIZMA-Dokumantasyon.pdf

Belge TÜRETİLMİŞ bir çıktıdır: kaynağı depodaki iki Markdown dosyasıdır.
Elle düzenlemeyin — döküman değişince bu betiği yeniden çalıştırın, yoksa PDF
sessizce eskir. (İlk sürüm 4f4b089'dan üretilmişti ve 16 commit geride kalıp
düzeltilmiş bir çelişkiyi taşımaya devam ediyordu; betiğin var olma sebebi bu.)

Oyunun kendisinin bağımlılığı yoktur; buradaki gereksinimler yalnızca bu
araca aittir ve oyunu çalıştırmak için gerekmez:

    pip install reportlab markdown matplotlib

matplotlib yalnızca DejaVu fontları için: Türkçe (ğ ş ı İ ç ö ü) ReportLab'in
gömülü Vera fontunda yok, DejaVu'da var. Sistemde DejaVu varsa o kullanılır.

Kullanım:  python tools/dokuman_uret.py
"""

import os
import re
import subprocess
import sys
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, KeepTogether, ListFlowable, ListItem, PageBreak,
    PageTemplate, Paragraph, Preformatted, Spacer, Table, TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKTI = os.path.join(KOK, "docs", "SIZMA-Dokumantasyon.pdf")

BOLUMLER = [
    ("Bölüm I — Kullanım Kılavuzu", os.path.join(KOK, "README.md")),
    ("Bölüm II — Mimari ve Geliştirici Notları", os.path.join(KOK, "docs", "MIMARI.md")),
]

# --- Renkler: oyunun kendi paletinden ---
YESIL = colors.HexColor("#1f6f3f")
KOYU = colors.HexColor("#0d1117")
GRI = colors.HexColor("#57606a")
CIZGI = colors.HexColor("#d0d7de")
KOD_ZEMIN = colors.HexColor("#f6f8fa")


# ---------------------------------------------------------------- fontlar
def fontlari_yukle():
    """DejaVu ailesini bul ve kaydet. Türkçe için şart."""
    adaylar = []
    try:
        import matplotlib
        adaylar.append(
            os.path.join(os.path.dirname(matplotlib.__file__), "mpl-data", "fonts", "ttf")
        )
    except ImportError:
        pass
    adaylar += [
        "/usr/share/fonts/truetype/dejavu",
        "/usr/local/share/fonts",
        r"C:\Windows\Fonts",
    ]
    gerekli = {
        "Govde": "DejaVuSans.ttf",
        "Govde-Bold": "DejaVuSans-Bold.ttf",
        "Govde-Italic": "DejaVuSans-Oblique.ttf",
        "Mono": "DejaVuSansMono.ttf",
        "Mono-Bold": "DejaVuSansMono-Bold.ttf",
    }
    for klasor in adaylar:
        if not os.path.isdir(klasor):
            continue
        if all(os.path.exists(os.path.join(klasor, d)) for d in gerekli.values()):
            for ad, dosya in gerekli.items():
                pdfmetrics.registerFont(TTFont(ad, os.path.join(klasor, dosya)))
            pdfmetrics.registerFontFamily(
                "Govde", normal="Govde", bold="Govde-Bold", italic="Govde-Italic"
            )
            pdfmetrics.registerFontFamily("Mono", normal="Mono", bold="Mono-Bold")
            return klasor
    sys.exit(
        "DejaVu fontları bulunamadı. `pip install matplotlib` ya da sisteme "
        "DejaVu kurun — Türkçe karakterler onsuz basılmıyor."
    )


# ---------------------------------------------------------------- metin
# DejaVu emoji taşımaz; bırakılırsa boş kutu olarak basılır. Anlam taşımadıkları
# için (başlıkta zaten adı yazıyor: "🎯 Pratik") temizleniyorlar.
EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\u2190-\u21FF\u2300-\u27BF\u2B00-\u2BFF"
    "\uFE0E\uFE0F\u200D\u2022\u2713\u2714\u2717\u26A0\u2B50]+"
)


_KAPSAM = set()


def kapsami_kur():
    """Fontun gerçekten taşıdığı kod noktaları — tahmin yerine cmap'e sormak.

    Kaba aralık temizliği ★ (U+2605) gibi DejaVu'da VAR OLAN ve anlam taşıyan
    simgeleri de siliyordu: "geçme ★, hedefin 1.2 katı ★★" satırı PDF'te
    "geçme, hedefin 1.2 katı" olup yıldız kademelerini anlamsızlaştırıyordu.
    """
    _KAPSAM.clear()
    _KAPSAM.update(pdfmetrics.getFont("Govde").face.charToGlyph.keys())


def emojisiz(s):
    if _KAPSAM:
        s = "".join(ch for ch in s if ch in "\n\t" or ord(ch) in _KAPSAM)
    else:
        s = EMOJI.sub("", s)
    # Silinen simgeden arta kalan boşluk: "Pratik ." -> "Pratik."
    s = re.sub(r"\s+([,.;:!?])", r"\1", s)
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    return re.sub(r"  +", " ", s).strip()


def kacir(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def satirici(s):
    """Markdown satır içi biçimlendirmesini ReportLab'in mini-HTML'ine çevirir."""
    s = emojisiz(s)
    kodlar = []

    def kod_sakla(m):
        kodlar.append(m.group(1))
        return "\x00%d\x00" % (len(kodlar) - 1)

    s = re.sub(r"`([^`]+)`", kod_sakla, s)   # kod parçaları önce ayrılır ki
    s = kacir(s)                              # içlerindeki * ** işlenmesin
    # Yalnızca gerçek URL'ler bağlantı olur. Markdown'daki iç çapalar (#oyna) ve
    # depo içi yollar (docs/MIMARI.md) PDF'te hedefsizdir; ReportLab bunları
    # çözemeyip hata veriyor. Metin olarak korunurlar, yol ise mono ile.
    def bag(m):
        metin, hedef = m.group(1), m.group(2)
        if re.match(r"^(https?://|mailto:)", hedef):
            return '<link href="%s" color="#0969da">%s</link>' % (hedef, metin)
        if hedef.startswith("#"):
            return metin
        return '%s (<font face="Mono" size="8.5">%s</font>)' % (metin, kacir(hedef))

    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", bag, s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<i>\1</i>", s)
    s = re.sub(r"~~([^~]+)~~", r"<strike>\1</strike>", s)

    def kod_geri(m):
        return (
            '<font face="Mono" size="8.5" backColor="#f0f2f4">'
            + kacir(kodlar[int(m.group(1))])
            + "</font>"
        )

    return re.sub(r"\x00(\d+)\x00", kod_geri, s)


# ---------------------------------------------------------------- stiller
def stiller_kur():
    s = getSampleStyleSheet()
    o = {}
    o["govde"] = ParagraphStyle(
        "govde", parent=s["Normal"], fontName="Govde", fontSize=9.5, leading=14,
        spaceAfter=6, textColor=KOYU,
    )
    o["h1"] = ParagraphStyle(
        "h1", parent=o["govde"], fontName="Govde-Bold", fontSize=17, leading=22,
        spaceBefore=16, spaceAfter=10, textColor=YESIL,
    )
    o["h2"] = ParagraphStyle(
        "h2", parent=o["govde"], fontName="Govde-Bold", fontSize=13, leading=17,
        spaceBefore=14, spaceAfter=7, textColor=YESIL,
    )
    o["h3"] = ParagraphStyle(
        "h3", parent=o["govde"], fontName="Govde-Bold", fontSize=11, leading=15,
        spaceBefore=10, spaceAfter=5, textColor=KOYU,
    )
    o["h4"] = ParagraphStyle(
        "h4", parent=o["govde"], fontName="Govde-Bold", fontSize=9.5, leading=13,
        spaceBefore=8, spaceAfter=4, textColor=GRI,
    )
    o["alinti"] = ParagraphStyle(
        "alinti", parent=o["govde"], leftIndent=10, borderPadding=(6, 6, 6, 8),
        backColor=colors.HexColor("#f6f8fa"), textColor=colors.HexColor("#39434d"),
        borderColor=YESIL, borderWidth=0, spaceBefore=4, spaceAfter=8,
    )
    o["kod"] = ParagraphStyle(
        "kod", parent=o["govde"], fontName="Mono", fontSize=8, leading=11,
        textColor=colors.HexColor("#24292f"), backColor=KOD_ZEMIN,
        borderPadding=(6, 6, 6, 6), spaceBefore=4, spaceAfter=8,
    )
    o["madde"] = ParagraphStyle("madde", parent=o["govde"], spaceAfter=3)
    o["tablo"] = ParagraphStyle(
        "tablo", parent=o["govde"], fontSize=8.5, leading=11.5, spaceAfter=0
    )
    o["tablo-bas"] = ParagraphStyle(
        "tablo-bas", parent=o["tablo"], fontName="Govde-Bold", textColor=colors.white
    )
    o["kapak-baslik"] = ParagraphStyle(
        "kapak-baslik", parent=o["govde"], fontName="Govde-Bold", fontSize=40,
        leading=46, alignment=TA_CENTER, textColor=YESIL, spaceAfter=6,
    )
    o["kapak-alt"] = ParagraphStyle(
        "kapak-alt", parent=o["govde"], fontSize=12, leading=18,
        alignment=TA_CENTER, textColor=GRI,
    )
    o["kapak-kunye"] = ParagraphStyle(
        "kapak-kunye", parent=o["govde"], fontSize=9.5, leading=16,
        alignment=TA_CENTER, textColor=GRI,
    )
    o["icindekiler1"] = ParagraphStyle(
        "ic1", parent=o["govde"], fontName="Govde-Bold", fontSize=10.5,
        leading=16, spaceBefore=6,
    )
    o["icindekiler2"] = ParagraphStyle("ic2", parent=o["govde"], fontSize=9.5, leftIndent=14)
    o["icindekiler3"] = ParagraphStyle("ic3", parent=o["govde"], fontSize=9, leftIndent=28,
                                       textColor=GRI)
    return o


# ---------------------------------------------------------------- markdown
def tablo_yap(satirlar, st, genislik):
    """| a | b | biçimindeki blok -> Table"""
    def hucreler(s):
        s = s.strip()
        if s.startswith("|"):
            s = s[1:]
        if s.endswith("|"):
            s = s[:-1]
        return [h.strip() for h in s.split("|")]

    basliklar = hucreler(satirlar[0])
    govde = [hucreler(x) for x in satirlar[2:]]
    sutun = len(basliklar)

    veri = [[Paragraph(satirici(h), st["tablo-bas"]) for h in basliklar]]
    for satir in govde:
        satir = (satir + [""] * sutun)[:sutun]
        veri.append([Paragraph(satirici(h), st["tablo"]) for h in satir])

    t = Table(veri, colWidths=[genislik / sutun] * sutun, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), YESIL),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f6f8fa")]),
        ("GRID", (0, 0), (-1, -1), 0.4, CIZGI),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def markdown_cevir(metin, st, genislik, seviye_kaydir=0):
    """Markdown metnini platypus akışına çevirir."""
    akis = []
    satirlar = metin.replace("\r\n", "\n").split("\n")
    i = 0
    paragraf = []
    maddeler = []

    def paragrafi_bosalt():
        if paragraf:
            akis.append(Paragraph(satirici(" ".join(paragraf)), st["govde"]))
            paragraf.clear()

    def maddeleri_bosalt():
        if maddeler:
            akis.append(ListFlowable(
                [ListItem(Paragraph(satirici(m), st["madde"]), leftIndent=14)
                 for m in maddeler],
                bulletType="bullet", bulletFontName="Govde", bulletFontSize=7,
                start="•", leftIndent=12, spaceAfter=8,
            ))
            maddeler.clear()

    def hepsini_bosalt():
        paragrafi_bosalt()
        maddeleri_bosalt()

    while i < len(satirlar):
        ham = satirlar[i]
        s = ham.strip()

        if not s:
            hepsini_bosalt()
            i += 1
            continue

        # kod bloğu
        if s.startswith("```"):
            hepsini_bosalt()
            i += 1
            kod = []
            while i < len(satirlar) and not satirlar[i].strip().startswith("```"):
                kod.append(satirlar[i])
                i += 1
            i += 1
            if kod:
                akis.append(Preformatted("\n".join(kod), st["kod"]))
            continue

        # tablo
        if s.startswith("|") and i + 1 < len(satirlar) and re.match(
            r"^\|[\s:|-]+\|?$", satirlar[i + 1].strip()
        ):
            hepsini_bosalt()
            blok = []
            while i < len(satirlar) and satirlar[i].strip().startswith("|"):
                blok.append(satirlar[i])
                i += 1
            if len(blok) >= 2:
                akis.append(Spacer(1, 3))
                akis.append(tablo_yap(blok, st, genislik))
                akis.append(Spacer(1, 9))
            continue

        # başlık
        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            hepsini_bosalt()
            duzey = min(len(m.group(1)) + seviye_kaydir, 4)
            baslik = emojisiz(m.group(2)).rstrip("#").strip()
            p = Paragraph(satirici(baslik), st["h%d" % duzey])
            p._icindekiler = (duzey, baslik)
            akis.append(p)
            i += 1
            continue

        # yatay çizgi
        if re.match(r"^(-{3,}|\*{3,}|_{3,})$", s):
            hepsini_bosalt()
            akis.append(Spacer(1, 4))
            i += 1
            continue

        # alıntı
        if s.startswith(">"):
            hepsini_bosalt()
            blok = []
            while i < len(satirlar) and satirlar[i].strip().startswith(">"):
                blok.append(satirlar[i].strip().lstrip(">").strip())
                i += 1
            akis.append(Paragraph(satirici(" ".join(blok)), st["alinti"]))
            continue

        # madde
        m = re.match(r"^[-*+]\s+(.*)$", s)
        if m:
            paragrafi_bosalt()
            maddeler.append(m.group(1))
            i += 1
            # devam satırları (girintili)
            while i < len(satirlar):
                dev = satirlar[i]
                if dev.strip() and dev.startswith(("  ", "\t")) and not re.match(
                    r"^\s*[-*+]\s", dev
                ):
                    maddeler[-1] += " " + dev.strip()
                    i += 1
                else:
                    break
            continue

        # numaralı madde -> düz paragraf (girintiyle)
        m = re.match(r"^(\d+)\.\s+(.*)$", s)
        if m:
            hepsini_bosalt()
            govde_metin = m.group(2)
            i += 1
            # Girintili devam satırları maddeye aittir; ayrı paragraf yapılırsa
            # girintiden çıkıp tam genişlikte akıyor ve liste kopuk görünüyor.
            while i < len(satirlar):
                dev = satirlar[i]
                if dev.strip() and dev.startswith(("  ", "\t")) and not re.match(
                    r"^\s*(\d+\.|[-*+])\s", dev
                ):
                    govde_metin += " " + dev.strip()
                    i += 1
                else:
                    break
            akis.append(Paragraph(
                "<b>%s.</b> %s" % (m.group(1), satirici(govde_metin)),
                ParagraphStyle("num", parent=st["govde"], leftIndent=16,
                               firstLineIndent=-10, spaceAfter=3),
            ))
            continue

        maddeleri_bosalt()
        paragraf.append(s)
        i += 1

    hepsini_bosalt()
    return akis


# ---------------------------------------------------------------- belge
class Belge(BaseDocTemplate):
    def __init__(self, *a, **kw):
        BaseDocTemplate.__init__(self, *a, **kw)
        cerceve = Frame(
            self.leftMargin, self.bottomMargin, self.width, self.height, id="govde"
        )
        self.addPageTemplates([
            PageTemplate(id="kapak", frames=[cerceve]),
            PageTemplate(id="ic", frames=[cerceve], onPage=self.sayfa_susle),
        ])

    def sayfa_susle(self, kagit, belge):
        kagit.saveState()
        kagit.setFont("Govde", 7.5)
        kagit.setFillColor(GRI)
        kagit.drawString(self.leftMargin, A4[1] - 13 * mm, "SIZMA — Yazılım Dokümantasyonu")
        kagit.drawRightString(A4[0] - self.rightMargin, A4[1] - 13 * mm, str(belge.page))
        kagit.setStrokeColor(CIZGI)
        kagit.setLineWidth(0.4)
        kagit.line(self.leftMargin, A4[1] - 15 * mm, A4[0] - self.rightMargin, A4[1] - 15 * mm)
        kagit.restoreState()

    def afterFlowable(self, akisci):
        etiket = getattr(akisci, "_icindekiler", None)
        if etiket:
            duzey, baslik = etiket
            if duzey <= 3:
                self.notify("TOCEntry", (duzey - 1, baslik, self.page))


def surum():
    try:
        h = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"], cwd=KOK,
            capture_output=True, text=True, check=True,
        ).stdout.strip()
        # Belgenin KENDİSİ sayılmaz: üretmek ağacı zorunlu olarak kirletir,
        # yoksa temiz bir depoda bile hep "kaydedilmemiş değişikliklerle" yazardı.
        kirli = [
            s for s in subprocess.run(
                ["git", "status", "--porcelain"], cwd=KOK,
                capture_output=True, text=True, check=True,
            ).stdout.splitlines()
            if os.path.basename(CIKTI) not in s
        ]
        return h + (" (kaydedilmemiş değişikliklerle)" if kirli else "")
    except Exception:
        return "bilinmiyor"


def uret():
    klasor = fontlari_yukle()
    kapsami_kur()
    st = stiller_kur()

    belge = Belge(
        CIKTI, pagesize=A4,
        leftMargin=22 * mm, rightMargin=22 * mm,
        topMargin=22 * mm, bottomMargin=18 * mm,
        title="SIZMA — Yazılım Dokümantasyonu",
        author="Aslıhan Erturhan",
        subject="Hacker temalı, Türkçe 10 parmak yazma oyunu",
    )
    genislik = belge.width

    akis = [
        Spacer(1, 55 * mm),
        Paragraph("SIZMA", st["kapak-baslik"]),
        Paragraph("Yazılım Dokümantasyonu", st["kapak-alt"]),
        Spacer(1, 14 * mm),
        Paragraph(
            "Hacker temalı, Türkçe 10 parmak yazma oyunu<br/>"
            "Kurulum yok, derleme yok, backend yok — saf HTML / CSS / JS",
            st["kapak-kunye"],
        ),
        Spacer(1, 20 * mm),
        Paragraph(
            "Aslıhan Erturhan<br/>%s · sürüm %s<br/>MIT Lisansı"
            % (date.today().strftime("%d.%m.%Y"), surum()),
            st["kapak-kunye"],
        ),
        Spacer(1, 12 * mm),
        Paragraph(
            "Bu belge <b>türetilmiş</b> bir çıktıdır: kaynağı depodaki "
            "<font face=\"Mono\" size=\"8.5\">README.md</font> ve "
            "<font face=\"Mono\" size=\"8.5\">docs/MIMARI.md</font> dosyalarıdır. "
            "Elle düzenlemeyin — <font face=\"Mono\" size=\"8.5\">"
            "python tools/dokuman_uret.py</font> ile yeniden üretin.",
            st["kapak-kunye"],
        ),
        PageBreak(),
    ]

    icindekiler = TableOfContents()
    icindekiler.levelStyles = [
        st["icindekiler1"], st["icindekiler2"], st["icindekiler3"]
    ]
    baslik_ic = Paragraph("İçindekiler", st["h1"])
    akis += [baslik_ic, icindekiler, PageBreak()]

    for bolum_adi, yol in BOLUMLER:
        with open(yol, encoding="utf-8") as f:
            ham = f.read()
        p = Paragraph(emojisiz(bolum_adi), st["h1"])
        p._icindekiler = (1, emojisiz(bolum_adi))
        akis.append(p)
        # Kaynak dosyaların kendi H1'i bölüm başlığıyla çakışmasın diye bir
        # düzey aşağı kaydırılır: README'nin "# SIZMA"sı burada H2 olur.
        akis += markdown_cevir(ham, st, genislik, seviye_kaydir=1)
        akis.append(PageBreak())

    if akis and isinstance(akis[-1], PageBreak):
        akis.pop()

    belge.multiBuild(akis)
    return klasor


if __name__ == "__main__":
    kaynak = uret()
    print("üretildi:", os.path.relpath(CIKTI, KOK))
    print("fontlar :", kaynak)
    print("boyut   :", os.path.getsize(CIKTI), "bayt")
