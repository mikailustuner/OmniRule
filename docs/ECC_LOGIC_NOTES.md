# ECC (Everything Claude Code) Mantık Notları

Bu doküman, `örnek` (ECC) klasöründen öğrenilen ve OmniRule projesine entegre edilecek olan ileri düzey mühendislik mantığını özetler.

## 1. Skill (Beceri) Mantığı
- **Skill-First Yaklaşımı:** Her şey bir "Skill"dir. Skill'ler, "nasıl yapılacağını" (workflow) içeren kanonik doğrulardır.
- **Format:** Markdown + YAML frontmatter.
- **Özellikler:** 
    - Adım adım iş akışları (Örn: TDD'de Red-Green-Refactor adımları).
    - Somut kod örnekleri ve desenler (Patterns).
    - Hangi durumlarda aktive edileceğine dair net kriterler.
- **Avantaj:** Bilgiyi ajandan bağımsız kılar; herhangi bir ajan ilgili skill'i yükleyerek o konuda uzmanlaşabilir.

## 2. Agent (Ajan) Mantığı
- **Uzmanlaşmış Personalar:** Architect, Planner, Reviewer gibi roller net sınırlarla ayrılmıştır.
- **Araç Kısıtlaması:** Her ajanın frontmatter'ında kullanabileceği tool'lar (`tools: ["Read", "Grep"]`) kısıtlanmıştır. Bu, ajanın odaklanmasını sağlar ve hata payını düşürür.
- **Delegasyon:** Büyük görevler `planner` tarafından parçalanır ve ilgili alt ajanlara delege edilir.

## 3. Command (Komut) Mantığı
- **Kullanıcı Arayüzü:** `/plan`, `/tdd`, `/code-review` gibi slash komutları kullanıcı için ana giriş noktasıdır.
- **Skill Entegrasyonu:** Komutlar genellikle bir Skill'i tetikleyen ince "shim" katmanlarıdır.
- **Inline Çalışma:** Komutlar varsayılan olarak "inline" (ajan dosyalarına bağımlı olmadan) çalışacak şekilde tasarlanmıştır, bu da taşınabilirliği artırır.

## 4. Hook (Otomasyon) Mantığı
- **Olay Tabanlı Tetikleyiciler:** `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop` gibi olaylara bağlanır.
- **İleri Düzey Kontroller:**
    - **GateGuard:** Dosyaya ilk yazma işleminden önce ajanın araştırma yapmasını zorunlu kılar (Fact-forcing).
    - **Config Protection:** Linter ve formatter konfigürasyonlarının ajan tarafından değiştirilmesini engeller.
    - **Batching (Toplu İşlem):** `tsc` (tip kontrolü) veya `format` (lint) gibi ağır işlemler her düzenlemede değil, cevabın sonunda (`Stop` event) toplu yapılır. Bu, performansı %80 artırır.
    - **Continuous Learning:** Oturum sonunda başarılı desenler (`evaluate-session`) ayıklanır ve kaydedilir.

## 5. Context ve Rules Mantığı
- **Modes (Modlar):** `dev`, `research`, `review` gibi modlar, ajanın davranış önceliklerini ve kullanacağı araç setini dinamik olarak değiştirir.
- **Always-Follow Rules:** Güvenlik, kod stili ve test gereksinimleri gibi kurallar "her zaman uyulması gereken" temel prensiplerdir.

## OmniRule İçin Çıkarılan Dersler
1. **Skill ve Command Ayrımı:** OmniRule'daki araçları (tools) ECC tarzı Skill'lere dönüştürmeliyiz.
2. **Hook Geliştirme:** Şu anki basit hook yapısını, ECC'deki gibi `Stop` event'ini ve `GateGuard` mantığını içerecek şekilde güçlendirmeliyiz.
3. **Agent Tanımları:** Ajanlarımızı frontmatter üzerinden tool kısıtlamalı hale getirmeliyiz.
