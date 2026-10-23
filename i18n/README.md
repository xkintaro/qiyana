# Dil sistemi

- Varsayılan dil `en`; `/` adresi `/en` adresine yönlenir.
- `/en` ve `/tr` doğrudan açılabilir, paylaşılabilir ve sunucuda kendi dillerinde oluşturulur.
- Metinler `dictionaries/en.json` ve `dictionaries/tr.json` içinde tutulur. Sözlüklere HTML yerine düz metin yazın; satır sonları için `\n` kullanın.
- `Dictionary` tipi İngilizce sözlükten türetilir. Diğer sözlükler aynı alanları sağlamalıdır; eksik alanlar derleme sırasında yakalanır.
- `getDictionary()` sunucuda yalnızca seçilen sözlüğü yükler. `components/home.tsx` sözlüğü prop olarak alır.
- Menüdeki dil bağlantıları mevcut sorgu parametrelerini ve bölüm bağlantısını (`#spotlight` gibi) korur. Dilin kaynağı URL'dir.
- Sayfa başlığı, açıklaması, HTML `lang` niteliği, görsel açıklamaları ve galeri kontrolleri de dile göre değişir.
- Desteklenmeyen dil kodları 404 döndürür.

## Yeni dil eklemek

1. `dictionaries/en.json` dosyasını yeni dil koduyla kopyalayın ve metinleri çevirin; anahtarları koruyun.
2. `config.ts` içindeki `locales` listesine dil kodunu ekleyin.
3. `dictionaries.ts` içindeki yükleyiciye yeni JSON dosyasını ekleyin.
4. `config.ts` içindeki `languageNames` listesine dilin kendi dilindeki adını ekleyin.
5. `npm run build` çalıştırın. Dil menüsü ve statik rota listesi `locales` üzerinden oluşturulur.
