# Feature Specification: Performance (KPI) System

**Feature Branch**: `009-performance-kpi`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Membangun sistem Performance (KPI) untuk menilai kinerja karyawan. Harus ada penentuan indikator (KPI), sistem penilaian (scoring) oleh atasan, dan dashboard analitik untuk melihat perkembangan kinerja."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - KPI Configuration (Priority: P1)

As an Admin/HR, I want to define specific KPI metrics (e.g., Technical Skill, Communication) and assign them weights, so that evaluations are standardized.

**Why this priority**: Foundation for scoring.

**Independent Test**: Admin can create a "Technical Skill" metric with a weight of 40% and see it in the metric configuration list.

---

### User Story 2 - Performance Review Workflow (Priority: P1)

As a Manager, I want to submit a performance score (1-5) for my subordinates across defined KPIs, so that I can provide formal feedback.

**Why this priority**: Primary data collection process.

**Independent Test**: Manager selects an employee, enters scores for each KPI, and clicks "Submit Review". The total weighted score is calculated automatically.

---

### User Story 3 - Performance Analytics Dashboard (Priority: P2)

As an Executive/HR, I want to see a visual ranking and historical trend of employee performance scores, so that I can identify top performers and areas for improvement.

**Why this priority**: Strategic decision support.

**Independent Test**: Dashboard displays a "Top Performers" list and a radar/line chart showing average scores over the last 6 months.

## Functional Requirements

1. **KPI Weights**: Total weights per review period must sum to 100%.
2. **Review Periods**: Support for Monthly, Quarterly, or Annual reviews.
3. **Scoring Logic**: Total Score = SUM(Score_i * Weight_i).
4. **Comments**: Qualitative feedback alongside quantitative scores.

## Technical Feasibility

- **Database**: New tables `kpi_metrics` and `performance_reviews`.
- **UI**: Radar charts for multi-dimensional performance and Bento Grid for rankings.
- **Backend**: Logic for calculating weighted averages and historical trends.
