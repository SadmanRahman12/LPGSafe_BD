# LPGSafe Bangladesh — Architecture Overview

## Overview
LPGSafe Bangladesh is an integrated national LPG safety, verification, monitoring, and compliance platform.

### Core Modules Roadmap
1. **Part 1 (Current)**: Project Foundation, Public Website, Authentication & RBAC, Core Prisma Database Schema (19 foundational models), Seed Data across 8 divisions, Safety Education.
2. **Part 2**: Consumer Dashboard, Certified Dealer Directory & Details, Cylinder QR Verification, Price Monitoring, Complaint System, and Notifications.
3. **Part 3**: Inspector Workflows, Digital Checklists, Certification System, Admin Command Center, Supply Chain Mapping, IoT Leakage Telemetry.
4. **Part 4**: AI/ML Safety Risk Scoring, Price Anomaly Detection, Demand Forecasting, and Regulatory Decision-Support Dashboards.

### Roles & Access Control
- `CONSUMER`: Search certified dealers, verify cylinder authenticity, track market prices, submit complaints, view safety education.
- `DEALER`: Manage cylinder inventory, report local pricing, request inspections, view compliance status.
- `INSPECTOR`: Perform on-site multi-point inspections, submit pass/fail safety reports, recommend certification approval/suspension.
- `ADMIN`: Platform-wide oversight, user & dealer management, certification approvals, supply chain visibility, anomaly review.
