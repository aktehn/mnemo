# Browser Extension Entegrasyonu ve Veri Yönetimi

## 1. Browser Extension ile Electron İletişimi

Web'de gezinirken sağ tık ile kelime eklemek için bir Chrome Extension geliştirmemiz gerekir. Bu extension, Electron uygulamasıyla konuşabilmelidir.

### Yöntem: Custom Protocol (Önerilen)
Electron uygulamanız `vocabulary-app://` gibi özel bir protokolü dinler. Chrome Extension bu linke istek atar.

**Adımlar:**
1.  **Electron (Main Process):** `main.cjs` içinde protokol tanımlanır (Zaten dosyanızda hazır yapıda, sadece kod eklenmeli).
2.  **Chrome Extension:** `manifest.json` ve `background.js` dosyaları hazırlanır.
3.  **Sağ Tık Menüsü:** Kullanıcı kelimeyi seçip sağ tıkladığında `vocabulary-app://add?word=SECILEN_KELIME` adresini açan bir script çalışır.

### Örnek Extension Yapısı (Kavramsal)

**manifest.json:**
```json
{
  "name": "Vocabulary Helper",
  "version": "1.0",
  "permissions": ["contextMenus"],
  "background": {
    "service_worker": "background.js"
  },
  "manifest_version": 3
}
```

**background.js:**
```javascript
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-vocab",
    title: "Add '%s' to Vocabulary Builder",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-vocab") {
    const word = encodeURIComponent(info.selectionText);
    // Deep Link ile Electron uygulamasını tetikle
    chrome.tabs.create({ url: `vocabulary-app://add?term=${word}` });
  }
});
```

---

## 2. SRS Algoritması (Spaced Repetition)

Sizin için `src/utils/srs.js` dosyasına gelişmiş bir SM-2 (SuperMemo-2) algoritması yazdım.

**Mantık:**
- **Easy (Kolay):** Kelimeyi çok iyi biliyorsunuz. Süre çarpanı artar (örn. 3 gün -> 10 gün).
- **Good (İyi):** Bildiniz ama rutin. Süre normal artar.
- **Hard (Zor):** Zorlandınız. Süre çok kısa artar veya aynı kalır.
- **Fail (Bilemedim):** Süre sıfırlanır, 1 gün sonra tekrar sorulur.

**Kullanımı:**
```javascript
import { calculateNextReview } from '../utils/srs';

// Kullanıcı butona bastığında:
const result = calculateNextReview(currentWordStats, 4); // 4 = Good
// result.dueDate -> Yeni tarih veritabanına kaydedilir.
```

---

## 3. A2 Kelime Listesi (JSON)

50 adet özenle seçilmiş A2 seviye kelimeyi `src/data/a2_vocab.json` dosyasına ekledim.
Bu dosya şunları içerir:
- **Term:** İngilizce kelime
- **Meaning:** Türkçe karşılığı
- **Example:** Örnek cümle
- **Type:** Kelime türü
- **Level:** Seviye

Tüm 1000 kelimelik listeyi tek seferde eklemek dosya boyutunu çok şişireceği için bu **"Starter Pack" (Başlangıç Paketi)** olarak eklendi. Uygulama içinde bu JSON dosyasını import edip kullanabilirsiniz.
