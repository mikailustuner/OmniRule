# OmniRule System Logic: TS Tools & Plugins

Bu doküman, OmniRule ekosistemindeki TypeScript tabanlı araçların (tools) ve pluginlerin çalışma mantığını özetler.

## 1. Skill Sistemi (TS Tools Logic)

Sistemin kalbi, `packages/core/src/index.ts` içerisinde tanımlanan `DesignVault` sınıfıdır. Bu sınıf, dosya türlerine ve dizin yapılarına göre "Skill" (uzmanlık) ataması yapar.

### Çalışma Mantığı:
- **Detection (Tespit):** Bir dosya açıldığında veya düzenlendiğinde, dosya uzantısı (`.ts`, `.tsx`, `.prisma` vb.) ve bulunduğu dizin (`app/`, `api/`, `components/`) incelenir.
- **Mapping (Eşleştirme):**
    - `.ts` -> `typescript-expert`
    - `.tsx` -> `react-expert`
    - `app/` -> `nextjs-expert`
    - `tailwind.config.js` -> `tailwind-expert`
- **Confidence (Güven Skoru):** Her eşleşme için bir güven skoru hesaplanır. Birden fazla eşleşme durumunda en yüksek skorlu olan "Hot Focus" olarak seçilir.
- **Context Injection (Bağlam Enjeksiyonu):** Tespit edilen skill'lere ait talimatlar (`skills/<skill_name>/SKILL.md`), projenin `.designrules/AGENT_INSTRUCTIONS.md` dosyasına dinamik olarak enjekte edilir. Bu sayede yapay zeka, çalıştığı dosyaya uygun kuralları anlık olarak öğrenir.

---

## 2. Plugin Sistemi (OmniRule Hooks)

Plugin mantığı `plugins/omnirule-hooks.ts` dosyasında kurgulanmıştır. Bu sistem, sistem olaylarına (events) tepki veren bir "Hook" yapısıdır.

### Temel Hook'lar:
- **`file.edited` / `file.created`:** Dosya değişikliklerini izler. Tasarım (CSS), şema (Prisma) veya API değişikliklerini algılayarak ilgili agent'ları (StyleAgent, ContextAgent) tetikler veya log tutar.
- **`session.created`:** Yeni bir çalışma oturumu başladığında `.designrules` klasörünü ve log sistemini hazırlar.
- **`experimental.session.compacting` (Context Preservation):** Yapay zekanın hafızası dolduğunda, kritik bilgilerin (Design Tokens, DB Structure, Active Rules) kaybolmaması için "Omnirule Critical Context" bloğu oluşturur ve bu bilginin korunmasını sağlar.
- **`permission.ask`:** Güvenli işlemleri (okuma işlemleri ve `.designrules` klasörüne yazma) otomatik olarak onaylayarak iş akışını hızlandırır.

---

## 3. Core Tools (Özel Araçlar)

`packages/core/src/tools/` dizini altında toplanan araçlar, spesifik mühendislik görevlerini yerine getirir:
- **`dependency-sentinel.ts`:** Bağımlılıkları denetler.
- **`quality-gate.ts`:** Kod kalitesini kontrol eder.
- **`security-audit.ts`:** Güvenlik açıklarını tarar.
- **`skill-detector.ts`:** Skill tespit mantığının bağımsız çalışabilen versiyonudur.

## Özet Akış
1. **Olay:** Kullanıcı bir dosyayı düzenler.
2. **Hook:** Plugin `file.edited` olayını yakalar.
3. **Analiz:** `DesignVault` dosyanın hangi skill'e (örn: Next.js) ait olduğunu bulur.
4. **Güncelleme:** `.designrules/AGENT_INSTRUCTIONS.md` dosyası yeni kurallarla güncellenir.
5. **Sonuç:** Yapay zeka, bir sonraki adımda dosya tipine en uygun mühendislik disipliniyle cevap verir.
