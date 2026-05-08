---
name: capacity-planner
description: "Kaynak planlama: Utilizasyon oranları, conflict resolution, staffing model ve kaynak optimizasyonu."
triggers:
  keywords: ["capacity planning", "resource allocation", "utilization", "staffing", "conflict resolution"]
  contexts: ["resource planning", "team capacity", "project staffing", "workload balancing"]
auto_load_when: "Kullanıcı kaynak planlama, utilizasyon hesaplama veya staffing model istediğinde"
agent: researcher
tools: ["Read", "Write", "Bash", "Grep", "Glob"]
---

# Capacity Planner — Kaynak Planlama Uzmanı

**Odak Alanı:** Kaynak planlama, utilizasyon oranları hesaplama, conflict resolution ve staffing model oluşturma.

---

## Pattern Bölümleri

### 1. Capacity Planning Döngüsü

```
Capacity Planning Süreci
├── Step 1: Demand Forecasting
│   ├── Project pipeline analysis
│   ├── Business forecasts
│   ├── Strategic initiatives
│   └── Headcount requirements
├── Step 2: Supply Analysis
│   ├── Current team capacity
│   ├── Available contractors
│   ├── Hiring pipeline
│   └── Skills inventory
├── Step 3: Gap Analysis
│   ├── Demand vs Supply
│   ├── Skills gap
│   └── Timeline gap
├── Step 4: Solution Design
│   ├── Hiring plan
│   ├── Reallocation
│   ├── Contractor engagement
│   └── Timeline adjustment
├── Step 5: Execution & Monitoring
│   ├── Weekly utilization tracking
│   ├── Monthly capacity review
│   └── Quarterly rebalancing
└── Step 6: Continuous Improvement
    ├── Forecasting accuracy
    ├── Model refinement
    └── Lessons learned
```

### 2. Utilizasyon Hesaplama

```
Utilization Calculation Methods
├── Billable Utilization
│   ├── Formula: Billable Hours / Available Hours
│   ├── Target: 70-80% (ayarlanabilir)
│   ├── Excludes: Admin, training, PTO
│   └── Direct revenue ilişkili
├── Overall Utilization
│   ├── Formula: Worked Hours / Available Hours
│   ├── Target: 85-95%
│   ├── Includes: All productive work
│   └── Capacity planning için
├── Capacity Utilization
│   ├── Formula: Used Capacity / Total Capacity
│   ├── Same as overall utilization
│   └── Planning threshold için
└── Example
    ├── Available hours/month: 160h
    ├── Billable: 120h → 75%
    ├── Non-billable: 20h → 12.5%
    ├── PTO/Admin: 20h → 12.5%
    └── Total: 160h → 100%
```

### 3. Conflict Resolution Strategies

```
Resource Conflict Types & Solutions
├── Type 1: Over-allocation
│   ├── Problem: Aynı kişi >100% atandı
│   ├── Solution A: Time-slicing
│   │   ├── Her projeye % payı ata
│   │   └── Weekly rotation
│   ├── Solution B: Reallocation
│   │   ├── Alternatif kaynak bul
│   │   └── Skills match kontrol
│   ├── Solution C: Scope adjustment
│   │   ├── Düşük öncelikli iş ertele
│   │   └── Deadline uzat
│   └── Solution D: Contractor
│       └── Dış kaynak desteği
├── Type 2: Skill Mismatch
│   ├── Problem: Doğru kişi yok
│   ├── Solution A: Upskilling
│   ├── Solution B: Hire/contract
│   └── Solution C: Workaround
├── Type 3: Timeline Conflict
│   ├── Problem: Aynı anda birden fazla proje
│   ├── Solution: Phase offset
│   └── Solution: Dependency management
└── Type 4: Availability Gap
    ├── Problem: Kişi mevcut değil (PTO, sick)
    ├── Solution: Backup resource
    └── Solution: Timeline adjustment
```

### 4. Staffing Model Türleri

```
Staffing Model Seçenekleri
├── Dedicated Team
│   ├── Proje için tam zamanlı ekip
│   ├── Stabilite yüksek
│   ├── Maliyet yüksek
│   └── Corporate/project teams
├── Matrix Organization
│   ├── Birden fazla projeye pay time
│   ├── Esneklik yüksek
│   ├── Coordination zor
│   └── Balanced portfolios
├── Hybrid Model
│   ├── Core team (dedicated) + shared resources
│   ├── Stability + flexibility
│   └── Most common pattern
├── Pool/Resource Pool
│   ├── Centralized team
│   ├── Project allocation as needed
│   ├── Optimal utilization
│   └── Service companies
└── Contractor Integration
    ├── Permanent + contractor mix
    ├── Scaling flexibility
    ├── Knowledge transfer needs
    └── Staff augmentation
```

### 5. Capacity Planning Matrisi

```
Capacity Planning Template
├── Resource Name: [Name]
├── Role: [Role]
├── Skills: [Skill set]
├── Availability
│   ├── Start date
│   ├── End date (if fixed-term)
│   ├── Hours per week
│   └── PTO schedule
├── Allocation Matrix
│   ├── Project A: X%
│   ├── Project B: Y%
│   ├── Project C: Z%
│   └── Buffer: W%
├── Utilization Target
│   ├── Target: 80%
│   ├── Current: 85%
│   └── Status: Over-allocated
├── Capacity Status
│   ├── 🟢 Available (<70%)
│   ├── 🟡 At capacity (70-90%)
│   └── 🔴 Over (>90%)
└── Notes
    ├── Upcoming PTO
    ├── Training
    └── Skills development
```

---

## Key Patterns

| Pattern | Açıklama | Uygulama |
|---------|----------|----------|
| **80/20 Rule** | %80 kapasite kullanım, %20 buffer | Sustainable workload |
| **Lead Time Hiring** | 2-3 ay önceden planlama | Hiring lag compensation |
| **Skills Matrix** | Yetkinlik haritası | Matching optimization |
| **Capacity Buffer** | Bilinmeyen için boşluk | Emergency cover |
| **Rolling Forecast** | 3-6 aylık görünürlük | Dynamic planning |
| **Dependency Mapping** | Projeler arası bağımlılık | Conflict prevention |
| **Utilization Review** | Haftalık/aylık izleme | Early warning |

---

## Anti-Patterns

### ❌ Yanlış Uygulamalar

```markdown
# REACTIVE CAPACITY
Bugün yeni proje başlayacak
- Kaynak belli değil
- Kimi çağıracağım bilinmiyor
- Planlama yok, panik var

Problem: Son dakika kararlar
- Yanlış eşleşmeler
- Overload
- Quality düşüşü

✅ Proaktif: 2-3 ay önceden planla
```

```markdown
# NO BUFFER
Tüm kapasite分配 edildi
- 100% atandı
- PTO yok, sick yok, buffer yok
- Herhangi bir aksaklik = kriz

✅ Her zaman %15-20 buffer
```

```markdown
# SKILL BLINDNESS
"Atama yap" dendi
- Kim yapabilir diye bakılmadı
- Sadece availability'e göre atandı
- Technical skill uyumsuzluğu

Problem: Proje gecikmeleri
- Learning curve
- Rework
- Quality issues

✅ Skills matrix kullan
```

```markdown
# SINGLE POINT OF FAILURE
Sadece Ahmet bu teknolojiyi biliyor
- Ahmet = Critical resource
- Ahmet yoksa proje durur
- Risk çok yüksek

✅ Knowledge sharing zorunlu
✅ Backup yetiştir
```

```markdown
# UTILIZATION OBSESSION
"Utilization %100 olmalı"
- Sürekli çalışma zorlanıyor
- Buffer yok
- Burnout kaçınılmaz
- Quality düşüyor
- Turnover artıyor

✅ Optimal: %75-85
```

```markdown
# STATIC PLAN
6 ay önceki plan hâlâ kullanılıyor
- Değişen durumlar yansımıyor
- Pipeline güncel değil
- Gerçekten kopuk

✅ Rolling planning
```

### ✅ Doğru Uygulamalar

```markdown
# CAPACITY MATRIX ÖRNEĞİ
Q2 2024 Capacity Plan:

| Resource | Role | Q2 Capacity | Allocated | Buffer |
|----------|------|-------------|-----------|--------|
| Ahmet | Tech Lead | 480h (60%) | 400h | 80h |
| Ayşe | Senior Dev | 480h (60%) | 440h | 40h |
| Mehmet | Dev | 480h (60%) | 360h | 120h |
| Burak | Dev | 480h (60%) | 480h | 0 🔴 |
| Cem | Dev | 480h (60%) | 320h | 160h |

Calculated at 60% (40% = admin/PTO/buffer)

Actions:
- Burak: New hire in 2 weeks
- Mehmet: Take Lead on Project X
- Buffer: 400h available for new work
```

```markdown
# UTILIZATION TRACKING
Weekly Utilization Report:

Name      | Avail | Allocated | Util | Status
----------|-------|-----------|------|-------
Ahmet     | 40h   | 38h       | 95%  | 🔴 Over
Ayşe      | 40h   | 32h       | 80%  | 🟢 Good
Mehmet    | 40h   | 36h       | 90%  | 🟡 At risk
Burak     | 40h   | 28h       | 70%  | 🟢 Good
Cem       | 40h   | 40h       | 100% | 🔴 Over

Actions:
- Ahmet: Reduce Project A to 60%
- Cem: Assign to Burak's project
- Mehmet: Monitor (close to limit)
```

```markdown
# HIRING FORECAST
Current Team: 5 Devs
Q2 Demand: 7 Devs equivalent
Gap: 2 Devs

Gap Analysis:
- Timeline: 6 weeks to hire
- Onboarding: 4 weeks
- Total lead time: 10 weeks

Hiring Plan:
- Post: 2 senior devs
- Target: Start by April 1
- Interview: Now → Feb 15
- Offer: Feb 20
- Start: April 1

Contractor Bridge:
- 2 contractors from [Vendor]
- Start: Feb 15
- Duration: 6 months
- Cost: $XX/hour

Risk: Contractor exit
Mitigation: Knowledge transfer plan
```

---

## Quick Reference

| Capacity Metric | Hesaplama | Optimal Aralık |
|-----------------|-----------|----------------|
| Billable Util | Billable / Total Time | 70-80% |
| Overall Util | Worked / Available | 80-90% |
| Capacity Fill | Allocated / Total | 75-85% |
| Buffer Rate | Unallocated / Total | 15-25% |

| Conflict Türü | Belirti | Çözüm |
|---------------|---------|-------|
| Over-allocation | >100% | Reallocate or contractor |
| Skill gap | Wrong match | Upskill or hire |
| Timeline overlap | Same dates | Phase shift |
| Availability gap | PTO/sick | Backup or adjust |
| Budget constraint | $ limit | Scope trade-off |

| Staffing Model | Avantajlar | Dezavantajlar |
|----------------|------------|---------------|
| Dedicated | Stabilite, ownership | Maliyet, esneklik düşük |
| Matrix | Esnek, balanced | Coordination zor |
| Hybrid | Best of both | Complexity |
| Pool | Optimal util | Stability düşük |
| Contractor | Scaling | Knowledge risk |

| Planning Horizon | Kullanım | Güncelleme |
|------------------|----------|------------|
| 1-3 months | Operational | Haftalık |
| 3-6 months | Tactical | Aylık |
| 6-12 months | Strategic | Quarterly |
| 12+ months | Long-range | Annual |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
