# Build index.html from the captured server-rendered markup (_src/*.html).
# Static structure is kept byte-for-byte; text/images get data-t / data-img bindings
# and dynamic lists are emptied (rendered by js/app.js from content.json).
import re, os, html as H
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, '_src')
rd = lambda p: open(os.path.join(S, p), encoding='utf8').read()

b = rd('open_body.html')
start = b.find('<div class="demo-page">')
end = b.find('</main></div></div></div>') + len('</main></div></div></div>')
b = b[start:end] + '</div>'          # close demo-page
b = re.sub(r'<audio[^>]*></audio>', '<audio id="bgm" style="display:none" data-video-audio="true"></audio>', b, 1)

def cut(s, a, z, repl, incl_end=False):
    i = s.index(a)
    j = s.index(z, i + len(a)) + (len(z) if incl_end else 0)
    return s[:i] + repl + s[j:]

# ---------- dynamic regions (emptied; rendered from JS) ----------
# album slides
b = cut(b, '<div class="relative w-full h-full flex items-center justify-center" style="perspective:1000px">',
        '</div></div><div class="flex justify-center gap-1.5 mt-3">',
        '<div class="relative w-full h-full flex items-center justify-center" style="perspective:1000px" data-render="slides">')
# fix: the cut above removed the slides + its closing div; the following text starts with "</div></div>" of carousel wrappers
# dots
b = cut(b, '<div class="flex justify-center gap-1.5 mt-3">', '</div></div></div></div><section',
        '<div class="flex justify-center gap-1.5 mt-3" data-render="dots">')
# timeline
b = cut(b, '<ol class="relative mx-auto grid', '</ol>',
        '<ol class="relative mx-auto grid w-full max-w-[460px] grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-x-6 md:gap-x-8 gap-y-8 md:gap-y-10" style="font-family:&quot;Times New Roman&quot;, ChungDoiIndic, serif" data-render="timeline">')
# calendar header text + grid
b = cut(b, '<div class="text-center py-2.5 text-[13px] md:text-[14px] font-semibold tracking-wide border-b !font-normal"',
        '</div><div class="grid grid-cols-7 border-b-2"',
        '<div class="text-center py-2.5 text-[13px] md:text-[14px] font-semibold tracking-wide border-b !font-normal" style="border-color:color-mix(in srgb, #511419 27%, transparent);font-family:&quot;The Nautigal&quot;, ChungDoiIndic, cursive;color:#511419;font-size:25px" data-render="cal-title">')
b = cut(b, '<div class="grid grid-cols-7 gap-y-0.5 px-1 py-2">', '</div></div></div><a href="https://www.google.com/calendar',
        '<div class="grid grid-cols-7 gap-y-0.5 px-1 py-2" data-render="cal-grid">')
# calendar link
b = re.sub(r'<a href="https://www\.google\.com/calendar/render[^"]*"', '<a data-render="cal-link" href="#"', b, 1)
# map
b = re.sub(r'<iframe class="mt-3 h-\[268px\]([^>]*?) src="[^"]*"', r'<iframe data-render="map" class="mt-3 h-[268px]\1 src="about:blank"', b, 1)
b = re.sub(r'<a href="https://www\.google\.com/maps/dir/[^"]*"', '<a data-render="dir-link" href="#"', b, 1)
# dress code colors
b = cut(b, '<div class="flex flex-wrap justify-center gap-4 md:gap-6">', '</div></div><section class="relative z-10 mx-auto my-4',
        '<div class="flex flex-wrap justify-center gap-4 md:gap-6" data-render="dress">')
# guestbook list
b = cut(b, '<div class="mt-8 w-full space-y-3 overflow-y-auto pr-2 mx-auto max-w-full md:max-w-[600px] ">', '</div></section></div><div class="relative z-10 overflow-x-clip"><img src="/images/themes/minimalism-dark-red/castle-background.webp" alt="" aria-hidden="true" class="pointer-events-none absolute max-w-none object-contain opacity-[0.1] left-1/2 top-[6%]',
        '<div class="mt-8 w-full space-y-3 overflow-y-auto pr-2 mx-auto max-w-full md:max-w-[600px] " data-render="guestbook">')
# gift QR cards
b = cut(b, '<div class="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center" style="color:#511419">',
        '</div></div></div><form class="modal-backdrop" method="dialog">',
        '<div class="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center" style="color:#511419" data-render="gifts">')
# lightbox: thumbs + counter + image
b = re.sub(r'(<div class="absolute top-2 sm:top-4 left-2 sm:left-4 text-white[^>]*>)1<!-- --> / <!-- -->7</div>', r'\1<span data-lb="idx">1</span> / <span data-lb="total">7</span></div>', b, 1)
b = re.sub(r'<img src="https://assets\.chungdoi\.com/[^"]*" alt="Ảnh cưới 1"', '<img data-lb="img" src="" alt="Ảnh cưới 1"', b, 1)
b = cut(b, '<div class="flex-shrink-0 flex gap-2 sm:gap-3 overflow-x-auto', '</div></div></div><form class="modal-backdrop bg-black/85"',
        '<div class="flex-shrink-0 flex gap-2 sm:gap-3 overflow-x-auto px-2 sm:px-4 py-2 sm:py-3 mt-3 sm:mt-4 bg-black/30 rounded-lg backdrop-blur-sm max-w-[90vw] sm:max-w-[80vw] cursor-default [&::-webkit-scrollbar]:hidden" style="scrollbar-width:none;-ms-overflow-style:none" data-lb="thumbs">')
# countdown text
b = b.replace('<p>Đang tính toán...</p>', '<p data-render="countdown">Đang tính toán...</p>', 1)
# hero polaroid photo
b = b.replace('<img src="https://assets.chungdoi.com/photo-library/design/cdecf6cfe2eeb3cfd63829abde62f1066f10a364ec27d4c997c0f51012c8803e.webp" alt="" class="h-full w-full object-cover"/>',
              '<img data-img="heroPhoto" src="" alt="" class="h-full w-full object-cover"/>', 1)

# ---------- text bindings ----------
DEF = {}
def bind(text, key, nth=None, fmt=None):
    global b
    rx = '>(' + ''.join('[  ]' if c == ' ' else re.escape(H.escape(c, quote=False)) for c in text) + ')<'
    ms = list(re.finditer(rx, b))
    assert ms, 'text not found: ' + text
    sel = ms if nth is None else [ms[nth]]
    DEF[key] = H.unescape(sel[0].group(1))
    for m in reversed(sel):
        i = m.start()
        ts = b.rfind('<', 0, i)
        assert b[ts+1] != '/', (text, b[ts:i])
        b = b[:i] + ' data-t="%s"' % key + b[i:]

T = [
 ('Save The Date','saveTheDate',None),
 ('Hoàng Long','groomShort',None), ('Bảo Ngọc','brideShort',None),
 ('THÔNG TIN LỄ CƯỚI','ceremonyTitle',None),
 ('Ông Bà','groomParentTitle',0), ('Ông Bà','brideParentTitle',1),
 ('Đặng Văn Thắng','groomFather',None), ('Bùi Thị Mai','groomMother',None),
 ('Quận 1, TP. Hồ Chí Minh','groomAddress',None),
 ('Vũ Đức Trung','brideFather',None), ('Ngô Thị Hạnh','brideMother',None),
 ('Quận 3, TP. Hồ Chí Minh','brideAddress',None),
 ('TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI','announcement',None),
 ('Đặng Hoàng Long','groomFull',None), ('Trưởng Nam','groomOrder',None),
 ('Vũ Bảo Ngọc','brideFull',None), ('Út Nữ','brideOrder',None),
 ('LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA','ceremonyPlace',None),
 ('Album Ảnh','albumTitle',None),
 ('THÔNG TIN TIỆC CƯỚI','partyTitle',None),
 ('Tiệc cưới sẽ diễn ra vào lúc:','partyIntro',None),
 ('Đón khách','receptionLabel',None), ('Khai tiệc','partyStartLabel',None),
 ('17:30','receptionTime',None),
 ('Cùng đếm ngược','countdownTitle',None),
 ('Thêm vào lịch','addToCalendar',None),
 ('XÁC NHẬN THAM DỰ','rsvpButton',None),
 ('Tiệc cưới sẽ tổ chức tại','venueTitle',None),
 ('Trung Tâm Hội Nghị White Palace, 194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh','venueAddress',None),
 ('Chỉ đường','directionsLabel',None),
 ('DRESS CODE','dressTitle',None), ('Trang phục dự tiệc','dressDesc',None),
 ('LỊCH TRÌNH NGÀY CƯỚI','timelineTitle',None),
 ('Sổ lưu bút','guestbookTitle',None), ('GỬI LỜI CHÚC','guestbookSubmit',None),
 ('Hộp Quà Mừng','giftTitle',None), ('Nhấn để mở','giftHint',None),
 ('Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!','thankYou',None),
]
for t,k,n in T: bind(t,k,n)

# ceremony/party date blocks (derived values)
# ceremony: "VÀO LÚC 09:00" + weekday + dd + THÁNG mm + yyyy + lunar ; party: 18:00 + weekday + ...
def sub1(old, new):
    global b
    assert old in b, old
    b = b.replace(old, new, 1)

sub1('<span>VÀO LÚC 09:00</span>', '<span data-t="ceremonyAtTime"></span>')
sub1('<span>18:00</span>', '<span data-t="partyTime"></span>')
# weekday spans (ceremony first, party second)
wk = '<span><span dir="auto">THỨ BẢY</span></span>'
sub1(wk, '<span><span dir="auto" data-t="ceremonyWeekday"></span></span>')
sub1(wk, '<span><span dir="auto" data-t="partyWeekday"></span></span>')
# day numbers 03 (ceremony, party)
d03 = '>03</span>'
sub1(d03, ' data-t="ceremonyDay">03</span>')
sub1(d03, ' data-t="partyDay">03</span>')
# months
sub1('<span dir="auto">THÁNG 01</span>', '<span dir="auto" data-t="ceremonyMonth"></span>')
sub1('<span dir="auto">THÁNG 01</span>', '<span dir="auto" data-t="partyMonth"></span>')
# years: spans whose entire text is 2026 (ceremony, party)
sub1('uppercase" style="font-family:&quot;Times New Roman&quot;, ChungDoiIndic, serif;color:#ece4d8">2026</span>',
     'uppercase" style="font-family:&quot;Times New Roman&quot;, ChungDoiIndic, serif;color:#ece4d8" data-t="ceremonyYear">2026</span>')
sub1('text-[18px] md:text-[24px]" style="color:#ece4d8;font-family:&quot;Times New Roman&quot;, ChungDoiIndic, serif">2026</span>',
     'text-[18px] md:text-[24px]" style="color:#ece4d8;font-family:&quot;Times New Roman&quot;, ChungDoiIndic, serif" data-t="partyYear">2026</span>')
# lunar
lun = '>(<!-- -->Tức ngày 15 tháng 11 năm Ất Tỵ<!-- -->)</div>'
sub1(lun, ' data-t="ceremonyLunar" data-fmt="({v})">(Tức ngày 15 tháng 11 năm Ất Tỵ)</div>')
sub1(lun, ' data-t="partyLunar" data-fmt="({v})">(Tức ngày 15 tháng 11 năm Ất Tỵ)</div>')
# party: khai tiệc value "18:00" (text-lg ... mt-1)
sub1('mt-1" style="color:#ece4d8;font-family:&quot;Baskerville&quot;, &quot;Times New Roman&quot;, ChungDoiIndic, serif">18:00</span>',
     'mt-1" style="color:#ece4d8;font-family:&quot;Baskerville&quot;, &quot;Times New Roman&quot;, ChungDoiIndic, serif" data-t="partyTime">18:00</span>')
b = b.replace('mt-1" style="color:#ece4d8;font-family:&quot;Baskerville&quot;, &quot;Times New Roman&quot;, ChungDoiIndic, serif">17:30</span>',
              'mt-1" style="color:#ece4d8;font-family:&quot;Baskerville&quot;, &quot;Times New Roman&quot;, ChungDoiIndic, serif" data-t="receptionTime">17:30</span>')
# credit link
sub1('♡ <!-- -->chungdoi.com</a>', '♡ <span data-t="credit">chungdoi.com</span></a>')
sub1('<a href="https://chungdoi.com" target="_blank"', '<a data-render="credit-link" href="https://chungdoi.com" target="_blank"')
# gift modal title & dialogs: give ids
sub1('<dialog class="modal modal-bottom sm:modal-middle">', '<dialog class="modal modal-bottom sm:modal-middle" id="giftDialog">')
sub1('<dialog class="modal">', '<dialog class="modal" id="lightbox">')
# wiring hooks
sub1('<div class="relative h-[340px] md:h-[520px] touch-pan-y">', '<div class="relative h-[340px] md:h-[520px] touch-pan-y" data-album="stage">')
sub1('aria-label="Previous photo"', 'aria-label="Previous photo" data-album="prev"')
sub1('aria-label="Next photo"', 'aria-label="Next photo" data-album="next"')
sub1('<form class="mt-6 mx-auto w-full max-w-full md:max-w-[600px]">', '<form class="mt-6 mx-auto w-full max-w-full md:max-w-[600px]" id="gbForm">')
sub1('aria-label="Mở hộp mừng cưới"', 'aria-label="Mở hộp mừng cưới" id="giftBtn"')
sub1('data-landing-screenshot-id="invite-rsvp"><button type="button"', 'data-landing-screenshot-id="invite-rsvp"><button type="button" id="rsvpBtn"')
# lightbox controls
sub1('aria-label="Previous image"', 'aria-label="Previous image" data-lb="prev"')
sub1('aria-label="Next image"', 'aria-label="Next image" data-lb="next"')
# gift modal close button (first btn-circle inside giftDialog header)
sub1('<button type="button" class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-white/80', '<button type="button" data-close="gift" class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-white/80')

# ---------- envelope (closed state, from /demo) ----------
d = rd('demo.html')
es = d.index('<div dir="ltr" lang="vi" style="display:contents">')
env = d[es:d.index('<!--$?--><template id="B:1">', es)]
env = re.sub(r'<div style="left:[^"]*animation:ambient-fall.*?</svg></div>', '', env, flags=re.S)
env = env.replace('<div style="z-index:1" class="jsx-353cb38c53e4a74a absolute inset-0 pointer-events-none overflow-hidden"></div>',
                  '<div style="z-index:1" class="jsx-353cb38c53e4a74a absolute inset-0 pointer-events-none overflow-hidden" id="envHearts"></div>')
env = env.replace('class="jsx-353cb38c53e4a74a fixed inset-0 z-50', 'id="envelope" class="jsx-353cb38c53e4a74a fixed inset-0 z-50')
env = env.replace('class="jsx-353cb38c53e4a74a relative" style', 'class="jsx-353cb38c53e4a74a relative" style')  # no-op
env = re.sub(r' jsx-[0-9a-f]{16}', '', env)
env = re.sub(r'class="jsx-[0-9a-f]{16} ', 'class="', env)
env = env.replace('class="jsx-353cb38c53e4a74a"', '')
# bind envelope texts
def ebind(text, key):
    global env
    pat = '>' + H.escape(text, quote=False) + '<'
    i = env.index(pat); env = env[:i] + ' data-t="%s"' % key + env[i:]
ebind('Hoàng Long', 'groomShort'); ebind('Bảo Ngọc', 'brideShort')
ebind('3 tháng 1, 2026', 'envelopeDate'); ebind('Thân Mời', 'envelopeGreeting'); ebind('Mở thiệp', 'openButton')
env = env.replace('<a href="?open=1" rel="nofollow"', '<a href="?open=1" id="openBtn" rel="nofollow"', 1)
env = env.replace('style="top:50px;width:56px;height:56px', 'id="envSeal" style="top:50px;width:56px;height:56px', 1)
env = env.replace('<div style="z-index:10" class="relative">', '<div style="z-index:10" class="relative" id="envBox">', 1)
env = env.replace('</div></div></div></div>', '</div></div></div></div>')  # keep
# the extracted env ends before B:1; ensure closing of provider div
env_html = env + '</div>'

app = b
page = f'''<!DOCTYPE html>
<html lang="vi" dir="ltr" data-theme="halloween">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title data-title>Mẫu Thiệp Minimalism Đỏ Đậm - Thiệp Cưới Tối Giản Sang Trọng</title>
<meta name="description" content="Mẫu thiệp cưới Minimalism tối giản với nền kem, tông đỏ đô, hoa mẫu đơn và dấu triện chữ Hỷ mạ vàng sang trọng. Xem demo thiệp cưới online miễn phí."/>
<link rel="stylesheet" href="/_next/static/css/d037ca79ab5530a8.css"/>
<link rel="stylesheet" href="/_next/static/css/08fc569d88870472.css"/>
<link rel="stylesheet" href="/css/extra.css"/>
<link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="48x48"/>
<link rel="icon" href="/icon-v2.png"/>
<link rel="apple-touch-icon" href="/apple-touch-icon-v2.png"/>
<style>html.env-lock,html.env-lock body{{overflow:hidden}}</style>
</head>
<body class="font-sans">
{app}
{env_html}
<script src="/js/app.js"></script>
</body>
</html>
'''
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf8').write(page)
import json; json.dump(DEF, open(os.path.join(ROOT,'tools','defaults_static.json'),'w',encoding='utf8'), ensure_ascii=False, indent=1)
print('index.html', len(page))
