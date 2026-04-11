import argparse
import httpx

API_BASE = "http://localhost:8000/api"

SEED_CVS = [
    {
        "filename": "ana_martinez_frontend.txt",
        "content": """Ana Martinez
Senior Frontend Developer
Email: ana.martinez@email.com | Location: Madrid, Spain

PROFESSIONAL SUMMARY
Passionate frontend developer with 6+ years of experience building responsive, high-performance web applications. Expert in React ecosystem with strong UI/UX sensibilities. Led frontend architecture for three SaaS products serving 100K+ users.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), HTML5, CSS3, GraphQL
- Frameworks: React, Next.js, Vue.js, Angular, Remix
- Styling: TailwindCSS, Styled Components, CSS Modules, Figma
- Testing: Jest, React Testing Library, Cypress, Playwright
- Tools: Git, Webpack, Vite, CI/CD pipelines, Docker

EXPERIENCE
Senior Frontend Developer — TechFlow Labs (2021-Present)
- Architected micro-frontend system serving 50K daily users
- Reduced bundle size by 40% through code splitting and lazy loading
- Implemented design system used across 8 product teams
- Mentored 4 junior developers

Frontend Developer — DigitalWave Agency (2018-2021)
- Built 20+ responsive web applications for enterprise clients
- Led migration from AngularJS to React

EDUCATION
B.Sc. Computer Science — Universidad Politecnica de Madrid (2018)""",
    },
    {
        "filename": "carlos_ruiz_datascience.txt",
        "content": """Carlos Ruiz
Data Scientist & ML Engineer
Email: carlos.ruiz@email.com | Location: Barcelona, Spain

PROFESSIONAL SUMMARY
Data scientist with 5 years of experience transforming complex datasets into actionable business insights. Specialized in machine learning, NLP, and predictive analytics. Published 3 papers on transformer architectures.

TECHNICAL SKILLS
- Languages: Python, R, SQL, Scala
- ML Frameworks: TensorFlow, PyTorch, scikit-learn, XGBoost, LightGBM
- Data Tools: Pandas, NumPy, Apache Spark, Databricks, dbt
- Visualization: Matplotlib, Seaborn, Plotly, Tableau, Looker
- Cloud: AWS SageMaker, Google Vertex AI, Azure ML
- NLP: Hugging Face Transformers, spaCy, NLTK, LangChain

EXPERIENCE
Senior Data Scientist — DataMinds Analytics (2022-Present)
- Built recommendation engine increasing user engagement by 35%
- Developed NLP pipeline processing 1M+ documents daily
- Created A/B testing framework adopted by 5 product teams

Data Scientist — FinTech Solutions (2020-2022)
- Built credit risk models with 92% accuracy
- Developed real-time fraud detection system

EDUCATION
M.Sc. Data Science — Universitat de Barcelona (2019)
B.Sc. Mathematics — Universidad Complutense de Madrid (2017)""",
    },
    {
        "filename": "sofia_chen_uxdesigner.txt",
        "content": """Sofia Chen
UX/UI Designer & Researcher
Email: sofia.chen@email.com | Location: Berlin, Germany

PROFESSIONAL SUMMARY
Human-centered designer with 7 years of experience crafting intuitive digital experiences. Expert in user research, interaction design, and design systems.

SKILLS
- Design Tools: Figma, Sketch, Adobe Creative Suite, Framer, Principle
- Research: User Interviews, Usability Testing, A/B Testing, Card Sorting
- Methods: Design Thinking, Jobs-to-be-Done, Lean UX
- Frontend: HTML, CSS, Basic React
- Accessibility: WCAG 2.1, WAI-ARIA, Screen reader testing

EXPERIENCE
Lead UX Designer — ProductCraft (2021-Present)
- Led redesign of B2B SaaS platform, improving task completion by 45%
- Built design system with 200+ components
- Conducted 100+ user interviews across 12 countries

UX Designer — CreativeFlow Studio (2018-2021)
- Designed mobile banking app reaching 500K users
- Reduced onboarding drop-off by 30%

EDUCATION
M.A. Interaction Design — Universitat der Kunste Berlin (2018)""",
    },
    {
        "filename": "marcus_johnson_devops.txt",
        "content": """Marcus Johnson
Senior DevOps & Platform Engineer
Email: marcus.johnson@email.com | Location: Austin, TX

PROFESSIONAL SUMMARY
DevOps engineer with 8 years of experience building and scaling cloud infrastructure. Expert in Kubernetes, CI/CD automation, and infrastructure as code.

TECHNICAL SKILLS
- Containers: Docker, Kubernetes, Helm, Istio
- CI/CD: GitHub Actions, GitLab CI, Jenkins, ArgoCD
- IaC: Terraform, Pulumi, AWS CloudFormation, Ansible
- Cloud: AWS (EKS, ECS, Lambda, S3), GCP (GKE, Cloud Run), Azure (AKS)
- Monitoring: Prometheus, Grafana, Datadog, ELK Stack
- Security: HashiCorp Vault, OWASP, SAST/DAST pipelines
- Languages: Python, Go, Bash

EXPERIENCE
Senior Platform Engineer — CloudScale Inc. (2021-Present)
- Architected multi-region Kubernetes platform serving 10M+ requests/day
- Built GitOps deployment pipeline
- Achieved 99.99% uptime SLA

DevOps Engineer — TechVenture Corp (2018-2021)
- Migrated monolithic application to microservices on EKS
- Automated infrastructure with Terraform
- Saved $50K/month through cost optimization

CERTIFICATIONS
- AWS Solutions Architect Professional
- Certified Kubernetes Administrator (CKA)""",
    },
    {
        "filename": "elena_petrova_product.txt",
        "content": """Elena Petrova
Senior Product Manager
Email: elena.petrova@email.com | Location: London, UK

PROFESSIONAL SUMMARY
Strategic product manager with 9 years of experience driving product vision, strategy, and execution for B2B and B2C products. Track record of launching products generating $10M+ in revenue.

SKILLS
- Product Strategy: Roadmap planning, Market analysis, Competitive intelligence, OKRs
- Methodologies: Agile (Scrum, Kanban), Lean Startup, Design Thinking
- Analytics: Mixpanel, Amplitude, Google Analytics, SQL, A/B Testing
- Tools: Jira, Confluence, Notion, Miro, Productboard, Linear
- Leadership: Cross-functional team leadership, Stakeholder management

EXPERIENCE
Senior Product Manager — ScaleUp Technologies (2020-Present)
- Led product strategy for enterprise SaaS, growing ARR from $2M to $15M
- Managed team of 12 engineers, 3 designers, 2 data analysts
- Launched 3 major features increasing retention by 28%

Product Manager — InnovateTech (2017-2020)
- Owned product lifecycle for mobile payment product (500K users)
- Delivered 50+ features across 4 product launches
- Conducted 200+ customer interviews

EDUCATION
MBA — London Business School (2017)""",
    },
    {
        "filename": "diego_santos_backend.txt",
        "content": """Diego Santos
Backend Developer & API Architect
Email: diego.santos@email.com | Location: Lisbon, Portugal

PROFESSIONAL SUMMARY
Backend developer with 6 years of experience designing scalable APIs and distributed systems. Expert in Python ecosystem with deep knowledge of database optimization.

TECHNICAL SKILLS
- Languages: Python, Go, Rust (learning), SQL
- Frameworks: FastAPI, Django, Flask, SQLAlchemy, Pydantic
- Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
- Messaging: RabbitMQ, Apache Kafka, Celery
- Architecture: Microservices, Event-driven, CQRS, DDD
- Testing: pytest, Locust, Contract testing

EXPERIENCE
Senior Backend Developer — APIForge (2021-Present)
- Designed APIs serving 5M+ daily requests
- Built event-driven microservices with Kafka
- Optimized queries reducing response times by 70%

Backend Developer — DataPipe Systems (2019-2021)
- Built data pipeline handling 1TB/day
- Migrated Django monolith to FastAPI microservices

EDUCATION
M.Eng. Computer Science — Instituto Superior Tecnico (2017)

OPEN SOURCE
- Contributor to FastAPI (10+ merged PRs)""",
    },
    {
        "filename": "priya_sharma_mobile.txt",
        "content": """Priya Sharma
Mobile Developer (iOS & Cross-Platform)
Email: priya.sharma@email.com | Location: Bangalore, India

PROFESSIONAL SUMMARY
Mobile developer with 5 years of experience building native and cross-platform applications. Published 8 apps on App Store with 1M+ combined downloads.

TECHNICAL SKILLS
- Cross-Platform: React Native, Expo, Flutter (intermediate)
- iOS Native: Swift, SwiftUI, UIKit, CoreData, Combine
- Android (basic): Kotlin, Jetpack Compose
- Languages: TypeScript, Swift, Kotlin, Dart
- Testing: XCTest, Detox, React Native Testing Library
- Backend Integration: REST APIs, GraphQL, Firebase, WebSocket

EXPERIENCE
Senior Mobile Developer — AppWorks Studio (2021-Present)
- Led React Native app serving 300K+ monthly users
- Implemented offline-first architecture
- Built custom native modules for camera and BLE
- Reduced crash rate from 2.1% to 0.3%

iOS Developer — MobileFirst (2019-2021)
- Built native iOS app using Swift and SwiftUI
- Implemented push notifications for 500K+ users

EDUCATION
B.Tech Computer Science — IIT Bangalore (2018)""",
    },
    {
        "filename": "james_wilson_security.txt",
        "content": """James Wilson
Security Engineer & Penetration Tester
Email: james.wilson@email.com | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Security engineer with 7 years of experience in application security, penetration testing, and security architecture. Found 50+ critical vulnerabilities.

TECHNICAL SKILLS
- Penetration Testing: Burp Suite, OWASP ZAP, Metasploit, Nmap
- Application Security: SAST, DAST, SCA, Code review, Threat modeling
- Cloud Security: AWS Security Hub, IAM, KMS, GuardDuty
- Compliance: SOC 2, ISO 27001, GDPR, HIPAA, PCI-DSS
- Languages: Python, Bash, Go (basic)
- Cryptography: TLS/SSL, PKI, HSM

EXPERIENCE
Senior Security Engineer — SecureNet Corp (2021-Present)
- Built application security program covering 30+ microservices
- Conducted 100+ penetration tests
- Led SOC 2 Type II certification

Security Engineer — CyberDefend (2018-2021)
- Performed red team exercises
- Built WAF rules blocking 10K+ malicious requests/day
- Led incident response for 5 critical incidents

CERTIFICATIONS
- OSCP, CISSP, AWS Security Specialty""",
    },
    {
        "filename": "maria_gonzalez_finance.txt",
        "content": """Maria Gonzalez
Financial Analyst & FP&A Specialist
Email: maria.gonzalez@email.com | Location: Mexico City, Mexico

PROFESSIONAL SUMMARY
Financial analyst with 6 years of experience in corporate finance, FP&A, and financial modeling. Expert at building forecasting models and driving data-informed business decisions.

SKILLS
- Financial Modeling: DCF, LBO, M&A models, Budgeting & Forecasting
- Analysis: Variance analysis, Scenario planning, Sensitivity analysis
- Tools: Excel (advanced), Google Sheets, Python (pandas for finance)
- Platforms: SAP, Oracle Financials, NetSuite, QuickBooks
- Reporting: Power BI, Tableau, Financial dashboards
- Knowledge: US GAAP, IFRS, Tax planning, Cash flow management
- Languages: Spanish (native), English (fluent)

EXPERIENCE
Senior Financial Analyst — GlobalTech Corp (2021-Present)
- Built financial models supporting $50M+ investment decisions
- Led annual budgeting process for 5 departments ($200M budget)
- Created automated reporting saving 15 hours/week
- Presented quarterly analysis to C-suite

Financial Analyst — Bank Nacional (2019-2021)
- Performed credit analysis on corporate clients ($100M+ portfolio)
- Built risk assessment models improving default prediction by 25%
- Managed monthly close process

Junior Analyst — Consultoria Financiera (2017-2019)
- Prepared financial statements and audit reports
- Supported due diligence for 3 M&A transactions

EDUCATION
M.Sc. Finance — ITAM (2017)
B.Sc. Accounting — UNAM (2015)

CERTIFICATIONS
- CFA Level II Candidate
- Certified Public Accountant (Mexico)""",
    },
    {
        "filename": "thomas_brown_marketing.txt",
        "content": """Thomas Brown
Digital Marketing & Growth Lead
Email: thomas.brown@email.com | Location: New York, NY

PROFESSIONAL SUMMARY
Growth marketer with 7 years of experience scaling B2B and B2C products. Expert in performance marketing, content strategy, and marketing automation. Managed $5M+ in ad spend.

SKILLS
- Performance Marketing: Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads
- SEO/SEM: Technical SEO, Content strategy, Keyword research, Link building
- Analytics: Google Analytics 4, Mixpanel, Amplitude, Attribution modeling
- Automation: HubSpot, Marketo, Mailchimp, Zapier, Customer.io
- Content: Copywriting, Blog strategy, Video marketing, Social media
- Tools: Ahrefs, SEMrush, Canva, Figma (basic), WordPress
- Strategy: GTM planning, Brand positioning, Customer journey mapping

EXPERIENCE
Head of Growth — SaaS Ventures (2021-Present)
- Scaled user base from 10K to 150K in 18 months
- Managed $2M annual marketing budget with 4x ROAS
- Built marketing automation generating 1000+ MQLs/month
- Led team of 4 marketers

Marketing Manager — ECommerce Plus (2018-2021)
- Managed $1.5M annual ad spend across 5 platforms
- Grew organic traffic by 300% through SEO strategy
- Launched email marketing program with 45% open rate
- A/B tested 50+ landing pages

Digital Marketing Specialist — AdAgency (2016-2018)
- Ran Facebook and Google campaigns for 20+ clients
- Achieved average 3.5x ROAS across client portfolio

EDUCATION
B.Sc. Marketing — NYU Stern (2016)

CERTIFICATIONS
- Google Analytics Certified
- HubSpot Inbound Marketing Certified
- Meta Blueprint Certified""",
    },
    {
        "filename": "luciana_ferreira_sales.txt",
        "content": """Luciana Ferreira
Enterprise Sales Executive
Email: luciana.ferreira@email.com | Location: Sao Paulo, Brazil

PROFESSIONAL SUMMARY
Enterprise sales executive with 8 years of experience closing complex B2B deals. Consistent quota achiever (120%+ average). Expert at building C-level relationships and navigating multi-stakeholder sales cycles.

SKILLS
- Sales: Enterprise sales, Solution selling, Consultative selling, Account-based selling
- Process: Lead qualification, Pipeline management, Forecasting, Negotiation
- CRM: Salesforce (expert), HubSpot CRM, Pipedrive, Outreach
- Methodology: MEDDPICC, Challenger Sale, SPIN Selling, BANT
- Knowledge: SaaS metrics (ARR, NRR, CAC, LTV), Contract negotiation, RFP/RFI
- Languages: Portuguese (native), English (fluent), Spanish (conversational)
- Leadership: Sales coaching, Team building, Revenue planning

EXPERIENCE
Senior Enterprise Account Executive — CloudTech Solutions (2020-Present)
- Closed $8M+ in ARR across 35 enterprise accounts
- Average deal size $250K, largest single deal $1.2M
- Built and maintained relationships with 15 Fortune 500 CIOs
- Mentored 3 account executives (all achieved quota)
- Navigated 6-12 month complex sales cycles

Account Executive — DataSoft Inc (2017-2020)
- Exceeded quota 10 out of 12 quarters
- Closed 40+ mid-market deals ($50K-$200K)
- Built territory from zero to $2M ARR
- Won "Rookie of the Year" in first year

Sales Development Rep — TechStart (2015-2017)
- Generated 200+ qualified leads per quarter
- Top SDR globally for 2 consecutive quarters
- Promoted to AE after 18 months

EDUCATION
B.Sc. Business Administration — FGV Sao Paulo (2015)""",
    },
    {
        "filename": "robert_taylor_hr.txt",
        "content": """Robert Taylor
HR Business Partner & Talent Strategy
Email: robert.taylor@email.com | Location: Chicago, IL

PROFESSIONAL SUMMARY
HR professional with 10 years of experience in talent acquisition, organizational development, and people strategy. Built recruiting programs that hired 500+ employees across 3 hypergrowth startups.

SKILLS
- Talent Acquisition: Full-cycle recruiting, Employer branding, ATS management
- HR Strategy: Workforce planning, Compensation & benefits, Performance management
- Organizational Development: Change management, Culture building, Team design
- Tools: Greenhouse, Lever, Workday, BambooHR, Lattice, Culture Amp
- Compliance: Employment law, DEI programs, HR analytics
- Training: Onboarding design, Leadership development, Coaching
- Knowledge: Agile HR, People analytics, Succession planning

EXPERIENCE
VP of People — StartupHR (2021-Present)
- Scaled company from 50 to 300 employees in 2 years
- Built entire People function from scratch (recruiting, L&D, comp, culture)
- Reduced time-to-hire from 45 to 18 days
- Designed compensation framework used across all departments
- Managed $2M annual HR budget

HR Director — GrowthCo (2018-2021)
- Led team of 5 recruiters hiring 150+ people/year
- Implemented performance review cycle increasing engagement by 25%
- Built DEI program improving diversity metrics by 40%
- Managed employee relations for 400-person organization

HR Manager — ConsultHR (2014-2018)
- Conducted 500+ interviews across technical and business roles
- Built onboarding program reducing new-hire turnover by 35%
- Managed benefits administration for 200 employees

EDUCATION
M.A. Industrial/Organizational Psychology — University of Chicago (2014)
B.A. Psychology — University of Michigan (2012)

CERTIFICATIONS
- SHRM-SCP (Senior Certified Professional)
- Certified Compensation Professional (CCP)""",
    },
    {
        "filename": "akiko_yamamoto_legal.txt",
        "content": """Akiko Yamamoto
Corporate Counsel & Compliance Officer
Email: akiko.yamamoto@email.com | Location: Tokyo, Japan

PROFESSIONAL SUMMARY
Corporate lawyer with 8 years of experience in tech law, intellectual property, and regulatory compliance. Expert in data privacy (GDPR, CCPA) and commercial contracts for SaaS companies.

SKILLS
- Legal: Corporate law, IP law, Commercial contracts, M&A due diligence
- Privacy & Compliance: GDPR, CCPA, LGPD, Data protection programs
- Contracts: SaaS agreements, NDAs, Licensing, Vendor agreements, SLAs
- IP Strategy: Patent filing, Trademark registration, Trade secrets
- Regulatory: SOC 2 compliance, ISO 27001, Industry-specific regulations
- Tools: Contract lifecycle management, Legal research databases
- Languages: Japanese (native), English (fluent)

EXPERIENCE
General Counsel — TechLegal Inc (2020-Present)
- Built legal function for Series B startup (200 employees)
- Drafted and negotiated 500+ commercial contracts ($50M+ total value)
- Implemented GDPR compliance program avoiding potential $10M fines
- Managed IP portfolio (30 patents, 15 trademarks)
- Advised board on M&A strategy (2 successful acquisitions)

Associate General Counsel — Global SaaS Corp (2017-2020)
- Managed commercial contract negotiations for enterprise clients
- Led data privacy program across 20 countries
- Reduced contract cycle time by 60% through templates and playbooks
- Handled 3 regulatory audits (all passed)

Corporate Associate — Morrison & Partners (2014-2017)
- Conducted due diligence for 10+ M&A transactions
- Drafted corporate governance documents
- Advised startups on incorporation and funding structures

EDUCATION
J.D. — University of Tokyo Faculty of Law (2014)
LL.M. in International Business Law — NYU Law (2016)

BAR ADMISSIONS
- New York State Bar
- Japan Bar (Bengoshi)""",
    },
    {
        "filename": "omar_hassan_operations.txt",
        "content": """Omar Hassan
Operations Manager & Supply Chain Expert
Email: omar.hassan@email.com | Location: Dubai, UAE

PROFESSIONAL SUMMARY
Operations leader with 9 years of experience optimizing supply chains, logistics, and business processes. Expert in lean methodology and Six Sigma. Saved companies $5M+ through process improvements.

SKILLS
- Operations: Supply chain management, Logistics, Inventory optimization, Procurement
- Process Improvement: Lean Six Sigma (Black Belt), Kaizen, Value stream mapping
- Project Management: PMP certified, Agile, Waterfall, Risk management
- Tools: SAP, Oracle SCM, Jira, Asana, Monday.com, Power BI
- Analytics: Demand forecasting, Cost analysis, Capacity planning
- Knowledge: Contract manufacturing, Vendor management, Quality assurance
- Languages: Arabic (native), English (fluent), French (intermediate)

EXPERIENCE
Director of Operations — LogiTech Middle East (2020-Present)
- Managed operations across 5 warehouses (500K sq ft total)
- Reduced logistics costs by 22% ($2M annual savings)
- Implemented WMS reducing order errors by 90%
- Led team of 40 operations staff
- Achieved 99.5% on-time delivery rate

Operations Manager — RetailChain (2017-2020)
- Optimized supply chain for 50 retail locations
- Reduced inventory carrying costs by 30%
- Implemented demand forecasting improving accuracy to 92%
- Managed $15M annual procurement budget

Supply Chain Analyst — PetroChem (2014-2017)
- Built supplier evaluation framework
- Negotiated contracts saving $800K annually
- Implemented JIT inventory system

EDUCATION
MBA — INSEAD (2014)
B.Sc. Industrial Engineering — Cairo University (2012)

CERTIFICATIONS
- PMP (Project Management Professional)
- Lean Six Sigma Black Belt
- APICS CSCP (Certified Supply Chain Professional)""",
    },
    {
        "filename": "valerie_dupont_content.txt",
        "content": """Valerie Dupont
Content Strategist & Technical Writer
Email: valerie.dupont@email.com | Location: Paris, France

PROFESSIONAL SUMMARY
Content strategist with 6 years of experience creating technical documentation, product content, and editorial strategies for tech companies. Expert at translating complex concepts into clear, engaging content.

SKILLS
- Content Strategy: Editorial calendars, Content audits, SEO content, Brand voice
- Technical Writing: API documentation, User guides, Knowledge bases, Release notes
- Tools: Notion, Confluence, GitBook, ReadMe, WordPress, Sanity CMS
- Multimedia: Basic video editing, Podcast production, Infographic design
- Analytics: Google Analytics, Content performance metrics, A/B testing
- Marketing: Email newsletters, Social media content, Blog management
- Languages: French (native), English (fluent), German (basic)

EXPERIENCE
Head of Content — DeveloperTools.io (2021-Present)
- Built content strategy driving 200K monthly organic visitors
- Created API documentation used by 10K+ developers
- Managed team of 3 writers and 2 designers
- Launched company blog growing from 0 to 50K subscribers
- Produced weekly podcast (5K downloads/episode)

Senior Content Strategist — SaaS Content Agency (2019-2021)
- Managed content for 15 B2B SaaS clients
- Wrote 200+ published articles averaging 3K reads
- Developed brand voice guidelines adopted by 8 companies
- Created content templates reducing production time by 50%

Technical Writer — CloudDocs (2017-2019)
- Documented REST APIs and SDKs for developer platform
- Wrote user guides reducing support tickets by 40%
- Built knowledge base with 500+ articles

EDUCATION
M.A. Communications — Sciences Po Paris (2017)
B.A. English Literature — Sorbonne (2015)""",
    },
    {
        "filename": "daniel_kim_qa.txt",
        "content": """Daniel Kim
QA Engineer & Test Automation Lead
Email: daniel.kim@email.com | Location: Seoul, South Korea

PROFESSIONAL SUMMARY
QA engineer with 6 years of experience in test automation, performance testing, and quality engineering. Built automation frameworks that reduced regression testing time by 80%.

TECHNICAL SKILLS
- Test Automation: Selenium, Playwright, Cypress, Appium, Robot Framework
- Performance: JMeter, k6, Gatling, Locust, LoadRunner
- Languages: Python, JavaScript/TypeScript, Java (basic)
- CI/CD: Jenkins, GitHub Actions, GitLab CI
- Tools: Postman, SoapUI, Charles Proxy, BrowserStack, Sauce Labs
- Methodologies: TDD, BDD, Shift-left testing, Risk-based testing
- Knowledge: API testing, E2E testing, Visual regression, Accessibility testing

EXPERIENCE
Senior QA Engineer — QualityFirst Labs (2021-Present)
- Built Playwright automation framework covering 90% of critical paths
- Reduced regression test suite from 8 hours to 1.5 hours
- Implemented visual regression testing catching 50+ UI bugs pre-release
- Mentored 3 junior QA engineers
- Achieved 95% automation coverage for API tests

QA Engineer — MobileApp Testing Co (2019-2021)
- Built Appium framework for iOS and Android testing
- Performed performance testing for apps with 1M+ users
- Reduced production bugs by 45% through shift-left testing
- Created BDD test suites with Cucumber

Junior QA Analyst — WebQA (2017-2019)
- Manual testing of web and mobile applications
- Wrote 1000+ test cases for e-commerce platform
- Performed cross-browser testing across 10+ browsers

EDUCATION
B.Sc. Computer Science — KAIST (2017)

CERTIFICATIONS
- ISTQB Advanced Level Test Automation Engineer""",
    },
]


def seed(url: str):
    for cv in SEED_CVS:
        content_bytes = cv["content"].encode("utf-8")
        files = {"file": (cv["filename"], content_bytes, "text/plain")}
        try:
            response = httpx.post(f"{url}/upload-cv/", files=files, timeout=120)
            if response.status_code == 200:
                profile = response.json()
                print(
                    f"  + Seeded: {profile['full_name']} ({profile['seniority_level']})"
                )
            else:
                print(f"  x Failed: {cv['filename']} - {response.text[:80]}")
        except Exception as e:
            print(f"  x Error: {cv['filename']} - {e}")


def main():
    parser = argparse.ArgumentParser(description="Seed SynergyX-AI with mock CV data")
    parser.add_argument(
        "--url", default="http://localhost:8000/api", help="API base URL"
    )
    args = parser.parse_args()

    print(f"Seeding CVs to {args.url}...")
    print(f"Preparing {len(SEED_CVS)} mock profiles...\n")
    seed(args.url)
    print(f"\nDone! {len(SEED_CVS)} profiles processed.")


if __name__ == "__main__":
    main()
