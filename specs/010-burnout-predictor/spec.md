# Feature Specification: AI Burnout Predictor

**Feature Branch**: `010-burnout-predictor`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User recommendation: "AI Burnout Predictor (Performance) - Use attendance and performance data to predict employee burnout risk."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Burnout Risk Visualization (Priority: P1)

As an HR Manager, I want to see a "Burnout Risk" indicator (Low, Medium, High) on each employee's performance profile, so that I can proactively offer support or leave.

**Why this priority**: Core value of the feature.

**Independent Test**: Dashboard displays a "Burnout Risk" badge based on data analysis (e.g., if an employee has >5 lates in a month and a performance score < 3.0, risk is HIGH).

---

### User Story 2 - Predictive Insights & Recommendations (Priority: P2)

As a Leader, I want to see *why* the system predicts a risk (e.g., "Frequent late patterns detected," "Consecutive high-intensity performance reviews"), so that I can have an informed conversation.

**Why this priority**: Explains the "AI" logic to the user.

**Independent Test**: Selecting an employee with "High Risk" shows a detailed tooltip/card listing the contributing factors (Metrics).

## Functional Requirements

1. **Risk Scoring Algorithm**:
   - **Late Count**: +10 points per late arrival in current month.
   - **Perf Drop**: +20 points if latest score is >0.5 lower than previous.
   - **Leave Absence**: +15 points if no leave taken in >3 months.
2. **Risk Levels**:
   - 0-30: Low (Green)
   - 31-60: Medium (Amber)
   - 61+: High (Red)
3. **Dashboard Integration**: Add a "Wellness & Risk" tab to the Performance Hub.

## Technical Feasibility

- **Backend**: Python script in `utils/burnout_engine.py` to aggregate attendance and performance data.
- **Frontend**: Radar charts and "Intensity" gauges.
- **Data Source**: Joins between `attendance`, `performance_reviews`, and `employees`.
