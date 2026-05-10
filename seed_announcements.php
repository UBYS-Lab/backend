<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Announcement;

Announcement::truncate();

$items = [
    ['days'=>0,  'priority'=>'high',   'title'=>'2024-2025 Bahar Dönemi Ders Kaydı Açıklandı',
     'content'=>'2024-2025 Bahar dönemi ders kayıtları 10-14 Şubat 2025 tarihleri arasında gerçekleştirilecektir. Öğrencilerin danışmanları ile görüşerek ders seçimlerini tamamlamaları gerekmektedir.', 'audience'=>'all'],
    ['days'=>7,  'priority'=>'high',   'title'=>'Vize Sınavı Programı Açıklandı',
     'content'=>'2024-2025 Bahar dönemi ara sınav programı ilan edilmiştir. Tüm öğrenciler sınav tarihlerini öğrenci bilgi sisteminden takip edebilir.', 'audience'=>'students'],
    ['days'=>14, 'priority'=>'normal', 'title'=>'Mezuniyet Töreni 2025',
     'content'=>'2024-2025 akademik yılı mezuniyet töreni 20 Haziran 2025 tarihinde Ana Amfitiyatroda saat 10:00da gerçekleştirilecektir. Tüm öğrenciler ve aileler davetlidir.', 'audience'=>'all'],
    ['days'=>21, 'priority'=>'normal', 'title'=>'Kütüphane Çalışma Saatleri Güncellendi',
     'content'=>'Merkez kütüphanesi sınav döneminde hafta içi 07:00-23:00, hafta sonu 09:00-21:00 saatleri arasında hizmet verecektir.', 'audience'=>'students'],
    ['days'=>28, 'priority'=>'high',   'title'=>'Burs Başvuruları Başladı',
     'content'=>'2025-2026 akademik yılı burs başvuruları 1 Mart 2025 tarihinden itibaren öğrenci işleri müdürlüğüne yapılabilir. Son başvuru tarihi 31 Mart 2025tir.', 'audience'=>'students'],
    ['days'=>35, 'priority'=>'normal', 'title'=>'Spor Tesisleri Yenileme Çalışması',
     'content'=>'Üniversite spor tesisleri 15-30 Mart 2025 tarihleri arasında bakım çalışmaları nedeniyle kapalı olacaktır.', 'audience'=>'all'],
    ['days'=>42, 'priority'=>'normal', 'title'=>'Akademik Danışmanlık Haftası',
     'content'=>'5-9 Mayıs 2025 tarihleri arasında Akademik Danışmanlık Haftası düzenlenecektir. Öğrenciler akademisyenlerle randevu alarak kariyer planlaması hakkında görüşebilir.', 'audience'=>'students'],
    ['days'=>49, 'priority'=>'normal', 'title'=>'Dijital Kütüphane Erişimi Genişletildi',
     'content'=>'Üniversitemiz dijital kütüphane abonelikleri genişletilmiş; 50den fazla yeni akademik veri tabanına erişim sağlanmıştır.', 'audience'=>'all'],
    ['days'=>56, 'priority'=>'normal', 'title'=>'Yaz Okulu Kayıt Tarihleri',
     'content'=>'2025 Yaz Okulu ders kayıtları 1-15 Temmuz 2025 tarihleri arasında gerçekleştirilecektir. Kontenjanlar sınırlıdır, erken kayıt yaptırmanız tavsiye edilir.', 'audience'=>'students'],
    ['days'=>63, 'priority'=>'normal', 'title'=>'Öğrenci Kulüpleri Fuarı',
     'content'=>'Bahar Dönemi Öğrenci Kulüpleri Fuarı 20 Mart 2025 tarihinde Ana Kampüs Meydanında düzenlenecektir. 45ten fazla öğrenci kulübü stant açacaktır.', 'audience'=>'students'],
    ['days'=>70, 'priority'=>'normal', 'title'=>'Engelli Öğrenciler İçin Yeni Destek Hizmetleri',
     'content'=>'Engelli Öğrenci Birimi, 2025 yılından itibaren not tutma yardımı, sınav uzatma süresi ve erişilebilirlik araçları gibi yeni destek hizmetleri sunmaya başlamıştır.', 'audience'=>'all'],
    ['days'=>77, 'priority'=>'high',   'title'=>'Kariyer Günleri Etkinliği',
     'content'=>'Yıllık Kariyer Günleri etkinliği 10-11 Nisan 2025 tarihlerinde düzenlenecektir. 80den fazla şirket stant açacak olup iş ve staj başvurularında bulunabilirsiniz.', 'audience'=>'students'],
    ['days'=>84, 'priority'=>'normal', 'title'=>'Araştırma Fonu Başvuruları Açıldı',
     'content'=>'Lisans ve lisansüstü öğrenciler için araştırma fonu başvuruları açılmıştır. Proje başvuruları 28 Şubat 2025 tarihine kadar Araştırma Ofisine teslim edilmelidir.', 'audience'=>'all'],
    ['days'=>91, 'priority'=>'normal', 'title'=>'Kampüs Güvenlik Bilgilendirmesi',
     'content'=>'Kampüsümüzde yeni güvenlik kameraları ve aydınlatma sistemleri kurulmuştur. Şüpheli durumlarda 7/24 güvenlik hattını arayabilirsiniz.', 'audience'=>'all'],
    ['days'=>98, 'priority'=>'high',   'title'=>'Final Sınav Programı Yayımlandı',
     'content'=>'2024-2025 Bahar dönemi final sınav programı öğrenci bilgi sisteminden duyurulmuştur. Sınav tarihinizi mutlaka kontrol ediniz; itirazlar için 3 gün süreniz bulunmaktadır.', 'audience'=>'students'],
];

use Illuminate\Support\Facades\DB;

DB::connection('mongodb')->table('announcements')->delete();

foreach ($items as $item) {
    $date = (new DateTime())->modify('-' . $item['days'] . ' days');
    $id = DB::connection('mongodb')->table('announcements')->insertGetId([
        'title'          => $item['title'],
        'content'        => $item['content'],
        'priority'       => $item['priority'],
        'target_audience'=> $item['audience'],
        'is_active'      => true,
        'published_by'   => 'Öğrenci İşleri Müdürlüğü',
        'publisher_type' => 'admin',
        'created_at'     => new MongoDB\BSON\UTCDateTime($date->getTimestamp() * 1000),
        'updated_at'     => new MongoDB\BSON\UTCDateTime($date->getTimestamp() * 1000),
    ]);
}

echo Announcement::count() . " duyuru eklendi.\n";
