# Featured Projects — Adesh Mehla

This document outlines key technical projects engineered by Adesh Mehla, categorized into personal engineering systems, professional client solutions delivered at WebToday, and technical assessment assignments.

---

## 1. Reflow — Frontend-Specialist LLM Developer Assistant
- **Project Type:** Active Personal Engineering Project (Not a commercial employer role)
- **Role:** Solo Architect & Full-Stack Developer
- **Technology Stack:**
  - *Frontend:* React.js (Vite), CSS3 design system, responsive UI components
  - *Backend Runtime:* Node.js (Express), ES modules, streaming HTTP handlers
  - *LLM Providers & Models:* Groq API (`openai/gpt-oss-20b`, `qwen/qwen3.8-27b`, `allam-2-7b`)
  - *Algorithms & Protocols:* Custom BM25 ranking algorithm, Server-Sent Events (SSE) streaming, JSON REST APIs
- **Problem Solved:** General-purpose LLMs are costly, prone to hallucinating out-of-domain answers, and slow when answering focused frontend engineering or developer profile questions.
- **Architecture & Implementation Details:**
  - **Versioned System Prompt (`v1`):** Restricts assistant domain strictly to modern frontend engineering (HTML/CSS, JS/TS, React, performance, web vitals, a11y, tooling).
  - **Lightweight Intent Router:** A compact model (`allam-2-7b` / `qwen/qwen3.8-27b`) classifies user queries in under 400ms into `learn`, `developer`, or `off_topic`. Out-of-domain requests and prompt injections are refused immediately with zero main-model token spend.
  - **BM25 Retrieval-Augmented Generation (RAG):** Custom mathematical BM25 ranking ($k_1=1.5, b=0.75$) indexes 30 curated frontend markdown modules and 6 profile documents, injecting strictly the top 3 chunks into LLM context with source citations.
  - **Developer Profile Guardrails:** Dedicated `developer` mode answers only from verified profile documents in the third person. If information is absent, it responds with the exact string: *"That information is not in the profile."*
  - **Token & Latency Optimizations:**
    - *In-memory response caching:* Replays exact query matches in 0 tokens and sub-5ms latency.
    - *Rolling turn summaries:* Condenses older conversational history to keep context windows compact.
    - *Mode-specific completion caps:* Limits max output tokens by route (`learn`: 700–900, `developer`: 450–600, `router`: 5).
    - *Prompt trimming:* Guards against bloated user inputs.
    - *Per-session token budgeting:* Enforces session limits to prevent runaway API spend.
  - **Evaluation & Observability:** 35 automated test cases across 6 distinct categories, complete with a live web dashboard at `/eval` and real measured token metrics documented in `RESULTS.md`.
- **Outcome & Verification:** Demonstrates practical LLM systems engineering, prompt guardrails, and cost-controlled AI architecture.
- **Repository:** `https://github.com/adeshmehla/reflow` (Verified repository)

---

## 2. Plumbline — Delivery Fee Calculation Engine
- **Project Type:** Professional Client Project (WebToday)
- **Context:** An established e-commerce business providing plants, nursery supplies, fertilizers, and landscaping products delivered directly to customer locations.
- **Role:** Web Developer / Logic Implementer
- **Technology Stack:** JavaScript, Wix Velo, Google Routes API, Geolocation / Coordinate Data
- **Problem Solved:** Flat delivery fees failed to account for variable transit distances and heavy bulk nursery items, resulting in inaccurate cart charges.
- **Implementation Details:**
  - Integrated the Google Routes API to compute road transit distances dynamically between the nursery dispatch location and customer destination coordinates.
  - Engineered delivery-tier calculation logic evaluating total cart product weights alongside calculated route mileage.
  - Injected dynamic freight fees directly into the Wix checkout and cart flows.
- **Outcome:** Automated accurate shipping calculations at cart checkout without requiring manual quote intervention.

---

## 3. Zoho Inventory Product Synchronization
- **Project Type:** Professional Client Integration (WebToday)
- **Context:** An e-commerce business managing product stock, pricing, and catalog details within Zoho Inventory.
- **Role:** Web Developer / API Integration Specialist
- **Technology Stack:** JavaScript, Wix Velo, Zoho Inventory REST API, Asynchronous Batching
- **Problem Solved:** Catalog items and stock levels required programmatic synchronization with the web storefront.
- **Implementation Details:**
  - Built asynchronous pagination routines to retrieve approximately 4,000 product records from the Zoho Inventory API.
  - Designed an optimized, scheduled fetching process to pull newly added or updated inventory records while minimizing rate-limit bottlenecks.
  - Structured catalog records into Wix database collections for storefront display.
- **Outcome:** Reliable multi-thousand product catalog retrieval with support for incremental catalog updates.

---

## 4. Role-Based Dashboard & Multi-Tier Website
- **Project Type:** Professional Client Project (WebToday)
- **Context:** A web portal serving distinct user constituencies: business owners, operational managers, and end customers.
- **Role:** Web Developer / Frontend Logic Engineer
- **Technology Stack:** JavaScript, Wix Velo, Conditional UI Rendering, Access Control Logic
- **Problem Solved:** Presenting sensitive business management controls to customers or operational tools to unauthorized users.
- **Implementation Details:**
  - Implemented role-dependent user interface views based on authenticated user member roles.
  - Built conditional rendering logic ensuring managers, owners, and customers saw appropriate navigation bars, data tables, and action triggers.
  - Restricted page routing and data queries according to verified user tier.
- **Outcome:** Clean separation of concerns between operational staff and customer-facing interfaces within a unified web application.

---

## 5. AI Blog Content Generator
- **Project Type:** Professional Client Feature (WebToday)
- **Context:** Client content marketing feature requiring automated blog post drafting from customizable prompts.
- **Role:** Web Developer / LLM Feature Integrator
- **Technology Stack:** JavaScript, Wix Velo, OpenAI ChatGPT API
- **Problem Solved:** Content managers needed a streamlined method to generate structured draft articles within their web management portal.
- **Implementation Details:**
  - Integrated the OpenAI / ChatGPT API via secure backend Velo web modules (`.jsw`).
  - Constructed configurable prompt templates accepting user inputs for article topic, target length, tone, and image inclusion guidelines.
  - Formatted generated AI completions into structured HTML/markdown ready for editorial review and publishing.
- **Outcome:** Functional in-app AI writing assistant tailored to the client's editorial guidelines.

---

## 6. Shopify Storefront Clone Assignment
- **Project Type:** Personal Learning / Technical Assessment Project
- **Context:** An exploratory e-commerce storefront assessment designed to practice modern e-commerce UI patterns.
- **Role:** Solo Developer
- **Technology Stack:** JavaScript, React.js, GraphQL, CSS
- **Implementation Details:**
  - Built interactive storefront product listing, detail pages, and shopping cart interactions.
  - Explored GraphQL queries for fetching structured product and variant data.
- **Important Distinction:** This project provided foundational exposure to GraphQL query mechanics. Adesh does **not** claim extensive commercial production experience with GraphQL.
