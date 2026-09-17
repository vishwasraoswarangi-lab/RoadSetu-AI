# 🚧 RoadSetu AI

### AI-powered road safety and pothole accountability platform

**RoadSetu AI** is a civic-tech platform that helps citizens report potholes and road hazards, uses AI to analyze and prioritize reports, routes them to the appropriate authority, and creates a transparent repair-verification workflow.

> **Report the problem. Track the action. Verify the repair.**

---

## 🌐 Live Demo

**Website:** https://roadsetuai.netlify.app/

**GitHub:** https://github.com/yashaswisingh024-design/RoadSetu-AI

---

## 🎯 The Problem

Potholes and damaged roads are common road-safety issues, but reporting them is often inconvenient and difficult to track.

Traditional complaint systems can suffer from:

* ❌ Complicated reporting processes
* ❌ Lack of accurate location information
* ❌ Poor prioritization of road hazards
* ❌ Limited visibility after a complaint is submitted
* ❌ No simple way for citizens to verify completed repairs
* ❌ Difficulty identifying repeated or suspicious repair claims

RoadSetu AI aims to create a **single transparent workflow from road-hazard reporting to repair verification.**

---

## 💡 Our Solution

RoadSetu AI allows citizens to submit a road issue using:

* 📸 **Photo evidence**
* 📍 **Location**
* 📝 **Natural-language description**
* 👤 **Verified user account**

The platform then processes the report through an AI-assisted workflow:

```text
Citizen Report
      ↓
Photo + Description + Location
      ↓
AI Road Analysis
      ↓
Severity & Category
      ↓
Authority Routing
      ↓
Complaint Tracking
      ↓
Repair Claimed
      ↓
Suspicious Repair Detection
      ↓
Citizen / Evidence Verification
      ↓
Verified Repair
```

---

# ✨ Key Features

## 📝 1. Smart Road Reporting

Citizens can report potholes and road hazards without navigating complicated government-style forms.

A report can contain:

* Road issue description
* Photo evidence
* Current location
* Additional details

The goal is to make reporting possible in just a few steps.

---

## 🤖 2. AI-Powered Road Analysis

RoadSetu AI uses AI to analyze submitted road reports and extract useful information such as:

* Road-hazard type
* Estimated severity
* Description summary
* Safety relevance
* Supporting evidence from uploaded images

This helps transform unstructured citizen reports into actionable information.

---

## 🚨 3. Severity & Priority

Reports can be categorized based on factors such as:

* Hazard severity
* Road conditions
* Potential safety impact
* Location
* Available evidence

Higher-risk reports can therefore receive greater attention within the workflow.

---

## 🏛️ 4. Intelligent Authority Routing

Once a report is analyzed, RoadSetu AI can determine the appropriate authority or department responsible for handling the issue.

This reduces the need for citizens to figure out:

> **“Whom should I actually report this to?”**

---

## 📍 5. Location-Based Reporting

RoadSetu AI captures meaningful location information associated with a report.

Instead of forcing users to understand coordinates such as:

```text
19.2183, 72.9781
```

the application is designed around **human-readable location information** wherever possible.

---

## 🗺️ 6. Live City Map

The map provides a visual overview of reported road issues.

Users can explore road problems based on their locations and understand where reported hazards are concentrated.

The system is designed to use **real location/report data rather than a pre-filled hackathon-only map.**

---

## 🔐 7. Verified User Authentication

RoadSetu AI supports authenticated users so that reports can be associated with real accounts.

Authentication helps provide:

* Secure sign-in
* User-specific reports
* Complaint history
* Account-based tracking
* Greater accountability

---

## 📊 8. Complaint Tracking

After submitting a complaint, users can follow its progress instead of losing visibility after submission.

Example lifecycle:

```text
Submitted
   ↓
AI Analyzed
   ↓
Routed
   ↓
Under Review
   ↓
Repair Claimed
   ↓
Verification
   ↓
Resolved
```

---

## 🔍 9. Repair Accountability

RoadSetu AI doesn't stop when an authority claims that a road issue has been repaired.

The workflow introduces an additional verification layer.

```text
Repair Claimed
      ↓
Evidence Checked
      ↓
Repair Verified
```

If available evidence appears inconsistent, the repair can be flagged for further review.

---

## ⚠️ 10. Suspicious Repair Detection

A reported repair can be flagged when the available evidence raises questions about whether the issue was actually resolved.

Potential signals can include:

* Missing evidence
* Inconsistent repair information
* Before/after evidence mismatch
* Repeated reports
* Location inconsistencies

This creates an additional accountability layer between **“repair claimed”** and **“repair verified.”**

---

# 🧠 AI Workflow

RoadSetu AI is designed around an AI-assisted processing pipeline:

```text
                    ┌──────────────────┐
                    │   Citizen Report │
                    └────────┬─────────┘
                             ↓
                ┌────────────────────────┐
                │ Photo + Text + Location│
                └────────────┬───────────┘
                             ↓
                    ┌────────────────┐
                    │   AI Analysis  │
                    └───────┬────────┘
                            ↓
              ┌──────────────────────────┐
              │ Type / Severity / Context│
              └────────────┬─────────────┘
                           ↓
                   ┌───────────────┐
                   │ Smart Routing │
                   └───────┬───────┘
                           ↓
                 ┌──────────────────┐
                 │ Complaint Status │
                 └────────┬─────────┘
                          ↓
                  ┌──────────────┐
                  │ Repair Claim │
                  └──────┬───────┘
                         ↓
                  ┌──────────────┐
                  │ Verification │
                  └──────┬───────┘
                         ↓
                  ┌──────────────┐
                  │    Resolved  │
                  └──────────────┘
```

---

# 🛠️ Technology Stack

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Frontend        | React                        |
| Language        | TypeScript                   |
| Build Tool      | Vite                         |
| Styling         | CSS                          |
| AI              | Google Gemini                |
| Authentication  | Firebase                     |
| Maps            | OpenStreetMap / Mapping APIs |
| Deployment      | Netlify                      |
| Version Control | Git & GitHub                 |

> The exact services and configuration may evolve as the platform is developed.

---

# 🏗️ Project Architecture

```text
RoadSetu AI
│
├── Frontend
│   ├── Authentication
│   ├── Report Submission
│   ├── Dashboard
│   ├── Complaint Tracking
│   ├── Live Map
│   └── Accountability
│
├── AI Layer
│   ├── Image Analysis
│   ├── Text Analysis
│   ├── Severity Classification
│   └── Report Processing
│
├── Data Layer
│   ├── User Profiles
│   ├── Road Reports
│   ├── Locations
│   ├── Status Updates
│   └── Verification Evidence
│
└── Deployment
    └── Netlify
```

---

# 👥 User Flow

### 1. Sign Up / Login

Users create an account and securely access the platform.

### 2. Report a Road Issue

The citizen provides:

* Description
* Photo
* Location

### 3. AI Processes the Report

The system analyzes the submitted information and generates structured road-issue data.

### 4. Complaint Is Routed

The report is associated with the appropriate authority/workflow.

### 5. Track Progress

The citizen can monitor the complaint status.

### 6. Repair Is Claimed

Once the issue is addressed, repair evidence can be submitted.

### 7. Verification

The repair goes through a verification stage before the complaint reaches its final resolved state.

---

# 🔐 Security & Data Principles

RoadSetu AI is designed with account-based access and responsible data handling in mind.

Important principles include:

* Authenticated user access
* User-specific complaint history
* Secure API key handling
* Environment variables for sensitive credentials
* Validation of submitted data
* No hard-coded production secrets

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

---

## Clone the Repository

```bash
git clone https://github.com/yashaswisingh024-design/RoadSetu-AI.git
```

```bash
cd RoadSetu-AI
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

> Never commit real API keys or credentials to GitHub.

---

## Run Locally

```bash
npm run dev
```

Then open the local development URL shown in your terminal.

---

## 📦 Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

# 🌍 Real-World Impact

RoadSetu AI is designed around a simple idea:

> **A road complaint should not disappear after the “Submit” button.**

The platform connects multiple stages of the civic process:

**Citizen → AI → Authority → Repair → Verification**

This can help create a more transparent feedback loop for road infrastructure issues.

---

# 🔮 Future Scope

Potential future improvements include:

* 🛰️ Larger-scale geospatial analytics
* 📱 Native mobile application
* 🗣️ Multilingual voice reporting
* 📷 Improved computer-vision-based pothole detection
* 🧭 Route-based road safety alerts
* 🏙️ Municipal authority dashboards
* 📈 City-level road-condition analytics
* 🔔 Real-time complaint notifications
* 🧑‍🤝‍🧑 Community verification
* 📊 Infrastructure maintenance analytics
* 🔗 Integration with municipal complaint systems

---

# 🏆 Hackathon Vision

RoadSetu AI was built with the goal of demonstrating how **AI, geospatial technology, authentication, and civic workflows** can work together to address a practical urban problem.

Rather than treating pothole reporting as a simple form submission, RoadSetu AI explores the complete lifecycle:

```text
REPORT
  ↓
ANALYZE
  ↓
ROUTE
  ↓
TRACK
  ↓
REPAIR
  ↓
VERIFY
```

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📄 License

This project is currently intended for educational, experimental, and hackathon development purposes.

---

## 👨‍💻 Built With Purpose

**RoadSetu AI**
*Making road complaints easier to report, easier to track, and harder to ignore.*

⭐ If you find the project interesting, consider starring the repository.
