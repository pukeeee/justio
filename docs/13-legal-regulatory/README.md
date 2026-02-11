# Розділ 13: Legal & Regulatory Compliance

**Версія:** 1.0  
**Дата:** 27 січня 2026  
**Власник:** Legal & Compliance Team  

---

## 13.1. Executive Summary

**Мета документу:** Визначити всі legal and regulatory вимоги для роботи Justio CRM в Україні та при міжнародній експансії.

**Критична важливість:**
- Юристи працюють з конфіденційними даними → будь-яка витік = катастрофа
- Адвокатська таємниця захищена законом
- Невідповідність комплаєнсу = штрафи + втрата репутації

**Охоплені юрисдикції:**
- 🇺🇦 Phase 1: Україна
- 🇪🇺 Phase 2: Європейський Союз (GDPR)
- 🇺🇸 Phase 3: США (зокрема Каліфорнія CCPA)

---

## 13.2. Українське Законодавство

### 📜 Ключові Закони

| Закон | Застосування до Justio | Статус |
|-------|---------------------------|--------|
| **Закон України "Про адвокатуру та адвокатську діяльність"** | Адвокатська таємниця | ✅ Критично |
| **Закон "Про захист персональних даних"** | Дані клієнтів | ✅ Критично |
| **Закон "Про електронні довірчі послуги"** | Дія.Підпис інтеграція | ✅ Обов'язково |
| **Закон "Про бухгалтерський облік"** | Фінансова документація | 🟡 Часткове |
| **Закон "Про електронну комерцію"** | SaaS договори | ✅ Обов'язково |

---

### 🔐 Адвокатська Таємниця (Attorney-Client Privilege)

**Закон України "Про адвокатуру" (ст. 22):**
> "Адвокатська таємниця — це будь-яка інформація, що стала відома адвокату, помічнику адвоката про клієнта, а також питання, з яких клієнт звертався до адвоката..."

**Наші зобов'язання:**

**1. Конфіденційність даних:**
- ✅ Всі дані клієнтів шифруються (at rest + in transit)
- ✅ Доступ тільки власнику організації та уповноваженим юристам
- ✅ Заборонено передавати дані третім особам без згоди
- ❌ Ніяких analytics на клієнтських даних (навіть анонімізованих)

**2. Зберігання:**
- ✅ Дані зберігаються мінімум 3 роки (законодавча вимога)
- ✅ Можливість видалення даних за запитом (right to be forgotten)
- ✅ Backup та disaster recovery

**3. Доступ:**
- ✅ Row-Level Security (користувач бачить тільки свої дані)
- ✅ Audit log всіх доступів до справ
- ✅ 2FA для critical actions (Phase 2)

**Ризики порушення:**
- Кримінальна відповідальність (ст. 387 КК України)
- Втрата ліцензії адвоката (для клієнта)
- Репутаційні втрати (для нас)

---

### 🛡️ Захист Персональних Даних

**Закон України "Про захист персональних даних":**

**Персональні дані, які ми обробляємо:**
- ПІБ клієнтів
- Контактна інформація (телефон, email, адреса)
- ІПН (індивідуальний податковий номер)
- ЄДРПОУ (для юросіб)
- Паспортні дані (скани документів)
- Інша чутлива інформація (медичні дані, фінанси)

**Вимоги:**

**1. Законні підстави обробки:**
- ✅ Згода користувача (consent при реєстрації)
- ✅ Виконання договору (Terms of Service)
- ✅ Легітимний інтерес (надання послуги)

**2. Права суб'єктів даних:**
- ✅ Право на доступ (users can export their data)
- ✅ Право на виправлення (edit функції)
- ✅ Право на видалення (delete account)
- ✅ Право на заперечення (opt-out з маркетингу)

**3. Обов'язки контролера:**
- ✅ Реєстрація в Реєстрі володільців персональних даних (якщо потрібно)
- ✅ Призначення відповідальної особи (DPO - Data Protection Officer)
- ✅ Privacy Policy прозора та зрозуміла
- ✅ Breach notification (повідомлення про витік протягом 72 год)

**Штрафи за порушення:**
- До 136,000 грн за порушення
- Кримінальна відповідальність за умисний витік

---

### 🖊️ Електронний Підпис (Дія.Підпис)

**Закон "Про електронні довірчі послуги":**

**Наша інтеграція:**
- ✅ Використання Qualified Electronic Signature (QES)
- ✅ Дія.Підпис як Trusted Service Provider
- ✅ Юридична сила документів (еквівалент паперового підпису)

**Вимоги:**
- ✅ Перевірка дійсності сертифікату
- ✅ Timestamp (мітка часу) для кожного підпису
- ✅ Зберігання підписаних документів (не змінювати!)
- ✅ Можливість перевірки підпису третьою стороною

**Юридична сила:**
- Документ з КЕП = юридично обов'язковий
- Приймається в судах
- Використовується для договорів, довіреностей, актів

---

### 💰 Фінансова Документація

**Наші зобов'язання:**
- ✅ Рахунки мають бути у форматі, визнаному податковою
- ✅ Нумерація послідовна (не можна видаляти рахунки)
- ✅ Зберігання мінімум 3 роки
- ❌ Ми НЕ є бухгалтерською системою (disclaimer)

**Що не робимо:**
- Податкові декларації
- Інтеграція з ДПС
- Бухгалтерський облік за П(С)БО

---

## 13.3. GDPR Compliance (EU Expansion)

### 🇪🇺 General Data Protection Regulation

**Коли застосовується:**
- Phase 2 (expansion до EU)
- Якщо маємо clients з EU (навіть 1!)

**Ключові принципи:**

**1. Lawfulness, Fairness, Transparency**
- Clear Privacy Policy
- Cookie consent
- Transparent data processing

**2. Purpose Limitation**
- Дані тільки для CRM функцій
- Не для marketing (без consent)

**3. Data Minimisation**
- Збираємо тільки необхідне
- Немає "nice to have" полів

**4. Accuracy**
- Users can update data
- We delete outdated data

**5. Storage Limitation**
- Automatic deletion after retention period
- Users can delete anytime

**6. Integrity & Confidentiality**
- Encryption (AES-256)
- Access controls
- Regular security audits

**7. Accountability**
- DPO (Data Protection Officer)
- DPIA (Data Protection Impact Assessment)
- Records of processing activities

---

### 📋 GDPR Requirements Checklist

**Legal Basis:**
- [ ] Privacy Policy published (clear, concise)
- [ ] Terms of Service define data processing
- [ ] Cookie consent banner (for EU visitors)
- [ ] Data Processing Agreement (for sub-processors)

**User Rights:**
- [ ] Data export (JSON/CSV)
- [ ] Account deletion (right to be forgotten)
- [ ] Data rectification (edit profile)
- [ ] Opt-out from marketing emails
- [ ] Consent withdrawal

**Technical Measures:**
- [ ] Encryption at rest (AES-256)
- [ ] Encryption in transit (TLS 1.3)
- [ ] Pseudonymization (where possible)
- [ ] Access controls (RBAC)
- [ ] Logging (audit trails)

**Organizational Measures:**
- [ ] DPO appointed (or external consultant)
- [ ] DPIA conducted (risk assessment)
- [ ] Breach notification procedure (72h)
- [ ] Staff training (data protection)
- [ ] Vendor management (sub-processors compliant)

**Documentation:**
- [ ] Records of Processing Activities (ROPA)
- [ ] Data retention policy
- [ ] Incident response plan
- [ ] DPA with Supabase, Vercel, etc.

---

### 💰 GDPR Penalties

**Tier 1 Violations (less serious):**
- Up to €10M or 2% of annual turnover

**Tier 2 Violations (serious):**
- Up to €20M or 4% of annual turnover

**Common violations:**
- No legal basis for processing
- No consent management
- Data breach (no notification)
- Lack of user rights implementation

**Наш підхід:** GDPR compliance з дня 1 (навіть в Ukraine-only phase)

---

## 13.4. California CCPA/CPRA (US Expansion)

### 🇺🇸 California Consumer Privacy Act

**Коли застосовується:**
- Phase 3 (US expansion)
- Якщо >50,000 CA residents (unlikely early)

**Key Requirements:**

**1. Right to Know:**
- What personal data we collect
- Why we collect it
- Who we share it with

**2. Right to Delete:**
- User can request deletion
- We must comply within 45 days

**3. Right to Opt-Out:**
- "Do Not Sell My Personal Information"
- Prominent link on homepage

**4. Non-Discrimination:**
- Can't deny service for exercising rights
- Can't charge more for opting out

**Our Status:**
- Not selling data → compliant by default
- Will implement rights if/when needed

---

## 13.5. Contracts & Legal Documents

### 📄 Required Documents

**1. Terms of Service (ToS)**
- Service description
- User obligations
- Payment terms
- Limitation of liability
- Termination conditions
- Governing law (Ukrainian law)

**2. Privacy Policy**
- What data we collect
- How we use it
- Who has access
- User rights
- Client information (DPO)

**3. Cookie Policy**
- What cookies we use
- Purpose of each
- How to opt-out

**4. Data Processing Agreement (DPA)**
- For sub-processors (Supabase, etc.)
- GDPR-compliant
- EU Standard Contractual Clauses (SCC)

**5. Service Level Agreement (SLA)**
- Uptime guarantee (99.5%+)
- Support response times
- Compensation for downtime

---

### ✍️ Contract Templates (For Users)

**Що надаємо юристам:**
- [ ] Шаблон договору на юридичні послуги
- [ ] Шаблон довіреності
- [ ] Шаблон акту виконаних робіт

**Legal Review:**
- All templates reviewed by lawyer
- Updated annually
- Disclaimer: "Not legal advice, consult own lawyer"

---

## 13.6. Intellectual Property

### ©️ Copyright & Trademarks

**Наші IP:**
- "Justio" — trademark (pending registration)
- Logo and brand assets
- Codebase (proprietary)
- User data (owned by users!)

**Open Source Dependencies:**
- Next.js (MIT license) ✅
- Supabase client (MIT) ✅
- Tailwind CSS (MIT) ✅
- Ensure all dependencies compatible

**User IP:**
- Users retain ownership of their data
- We have license to process (per ToS)
- We don't claim copyright on user documents

---

## 13.7. Liability & Insurance

### ⚖️ Limitation of Liability

**Terms of Service includes:**
- No warranty (provided "as is")
- Limitation of liability (capped at subscription fee)
- Force majeure (war, natural disasters)
- User responsible for backups

**What we're NOT:**
- Legal advisor
- Accountant
- Guarantor of client wins

**Disclaimers:**
- "Justio is a tool. You're responsible for legal work."
- "We don't provide legal, tax, or financial advice."

---

### 🛡️ Cyber Insurance

**Recommended Coverage:**
- Data breach response ($1M+)
- Business interruption
- Cyber extortion (ransomware)
- Legal defense costs

**Status:** Not required for MVP, but evaluate after PMF

---

## 13.8. Compliance Roadmap

### Phase 1: Ukraine (MVP) — Month 0-6

**Critical (Must Have):**
- ✅ Privacy Policy (Ukrainian)
- ✅ Terms of Service (Ukrainian)
- ✅ Cookie consent banner
- ✅ Data encryption (at rest + in transit)
- ✅ Row-Level Security
- ✅ User data export
- ✅ Account deletion
- ✅ Backup strategy

**Nice to Have:**
- 🟡 DPO appointment (external consultant)
- 🟡 DPIA (simplified version)
- 🟡 Incident response plan

---

### Phase 2: EU Expansion — Month 6-12

**Additional Requirements:**
- ✅ Full GDPR compliance audit
- ✅ Formal DPO appointment
- ✅ DPIA (comprehensive)
- ✅ DPA with all sub-processors
- ✅ EU hosting option (data residency)
- ✅ Breach notification procedure (72h)
- ✅ Privacy Policy (English + local languages)
- ✅ Cookie consent (GDPR-compliant)

---

### Phase 3: US Expansion — Month 12-24

**Additional Requirements:**
- ✅ CCPA compliance (if >50k CA users)
- ✅ "Do Not Sell" link (if applicable)
- ✅ State-specific requirements (NY, Texas, etc.)
- ✅ SOC 2 Type II certification (for enterprise)
- ✅ HIPAA (if handling medical data) — unlikely

---

## 13.9. Sub-Processors & Vendors

### 🤝 Third-Party Data Processors

| Vendor | Purpose | Data Shared | GDPR DPA | Location |
|--------|---------|-------------|----------|----------|
| **Supabase** | Database, Auth | All user data | ✅ Yes | US (AWS) |
| **Vercel** | Hosting, Functions | Minimal (logs) | ✅ Yes | Global CDN |
| **Stripe** | Payments | Payment info | ✅ Yes | US/EU |
| **SendGrid/Resend** | Email | Email, name | ✅ Yes | US |
| **Sentry** | Error tracking | No PII | ✅ Yes | US |

**Our Responsibilities:**
- ✅ Vet all vendors (GDPR compliance)
- ✅ Sign DPA with each
- ✅ Monitor compliance
- ✅ Maintain vendor list (transparency)

---

## 13.10. Data Breach Response Plan

### 🚨 Incident Response Procedure

**1. Detection (0-1 hour):**
- Automated alerts (Sentry, Supabase monitoring)
- User reports
- Security team notification

**2. Assessment (1-4 hours):**
- Determine scope (how many users affected?)
- Identify data exposed (PII? Financial?)
- Severity rating (low/medium/high/critical)

**3. Containment (4-8 hours):**
- Stop the breach (patch vulnerability)
- Revoke compromised credentials
- Isolate affected systems

**4. Notification (8-72 hours):**
- **GDPR:** Notify supervisory authority within 72h
- **Users:** Email affected users ASAP
- **Public:** Blog post (if major breach)

**5. Recovery (1-7 days):**
- Restore from backup (if needed)
- Implement fixes
- Security audit

**6. Post-Mortem (7-14 days):**
- Root cause analysis
- Lessons learned
- Update security procedures

**Template Emails:**
- "Data Breach Notification to Users"
- "Breach Report to Supervisory Authority"

---

## 13.11. Compliance Monitoring

### 📊 Ongoing Compliance Tasks

**Daily:**
- Monitor security alerts (Sentry)
- Check system uptime (StatusPage)

**Weekly:**
- Review access logs (suspicious activity?)
- Check backup integrity

**Monthly:**
- Privacy Policy review (any updates needed?)
- Vendor compliance check
- User rights requests (export/delete)

**Quarterly:**
- Full security audit
- Staff training (data protection)
- Update ROPA (if needed)

**Annually:**
- Legal document review (ToS, Privacy Policy)
- DPIA update
- Vendor contract renewals

---

## 13.12. Training & Awareness

### 👥 Team Training

**All Team Members:**
- Data protection basics (GDPR principles)
- Handling user requests (export, delete)
- Security best practices (password hygiene)

**Developers:**
- Secure coding (OWASP Top 10)
- Data encryption
- Access control implementation

**Support Team:**
- Privacy-first responses
- Never share user data
- Escalation procedures

**Frequency:** Quarterly training sessions + annual refresher

---

## 13.13. Risk Assessment

### ⚠️ Legal & Compliance Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Data breach** | Medium | Critical | Encryption, access controls, monitoring |
| **GDPR violation** | Low | High | Compliance audit, DPO, staff training |
| **Адвокатська таємниця breach** | Low | Critical | Strict access controls, audit logs |
| **User sues for data loss** | Low | Medium | Backups, disclaimers, insurance |
| **Copyright infringement (templates)** | Low | Medium | Legal review, original content |
| **Service unavailable (SLA breach)** | Medium | Low | 99.5% uptime, redundancy |

---

## 13.14. Checklist Before Launch

### ✅ Pre-Launch Compliance Checklist

**Legal Documents:**
- [ ] Terms of Service (reviewed by lawyer)
- [ ] Privacy Policy (GDPR-compliant)
- [ ] Cookie Policy
- [ ] DPA with Supabase, Vercel, Stripe

**Technical:**
- [ ] Encryption at rest (AES-256)
- [ ] Encryption in transit (TLS 1.3)
- [ ] Row-Level Security (Supabase RLS)
- [ ] User data export function
- [ ] Account deletion function
- [ ] Cookie consent banner

**Organizational:**
- [ ] DPO appointed (or plan to appoint)
- [ ] Incident response plan documented
- [ ] Team trained on data protection
- [ ] Backup & disaster recovery tested

**Testing:**
- [ ] Penetration test (basic)
- [ ] Privacy review (no PII leaks)
- [ ] GDPR audit (if EU users)

---

## 13.15. Resources & References

### 📚 Legal Resources

**Ukrainian:**
- Закон "Про адвокатуру": https://zakon.rada.gov.ua/laws/show/5076-17
- Закон "Про захист персональних даних": https://zakon.rada.gov.ua/laws/show/2297-17
- Закон "Про електронні довірчі послуги": https://zakon.rada.gov.ua/laws/show/2155-19

**GDPR:**
- Official text: https://gdpr-info.eu/
- GDPR checklist: https://gdpr.eu/checklist/
- ICO guidance: https://ico.org.uk/for-organisations/guide-to-data-protection/

**CCPA:**
- Official site: https://oag.ca.gov/privacy/ccpa
- Compliance guide: https://www.caprivacy.org/

**Security:**
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CIS Controls: https://www.cisecurity.org/controls/

---

## 13.16. Client & Escalation

**Data Protection Officer (DPO):**
- Email: dpo@justio.ua
- Response time: 48 hours

**Legal Issues:**
- Email: legal@justio.ua
- Urgent: +380 XX XXX XXXX

**Security Incidents:**
- Email: security@Justio.ua
- 24/7 on-call rotation

---

## 13.17. Updates & Version Control

**This Document:**
- Version: 1.0
- Last Updated: 27 січня 2026
- Next Review: 27 квітня 2026 (quarterly)

**Change Log:**
- v1.0 (Jan 2026): Initial version

**Owner:** Legal & Compliance Team  
**Approver:** CEO + Legal Counsel

---

**Status:** ✅ Reviewed and Approved  
**Next Action:** Implement pre-launch checklist
