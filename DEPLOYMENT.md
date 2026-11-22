# USHSS Master Control — Deployment Guide

An independent, private administrative portal for the Dean of the University School of Humanities & Social Sciences (USHSS), GGSIPU, to manage classroom attendance, review student records, and apply authorized administrative reliefs directly to the shared Supabase PostgreSQL database.

---

## 1. Architecture & Privacy Guarantees

- **Completely Independent App:** Built as a standalone Next.js 16 application with its own repository and Vercel project deployment.
- **Strict Privacy & Isolation:** Zero navigation links, references, or API hooks are exposed on the student-facing portal.
- **Server-Only Security:** Because database table access was revoked from public anonymous clients, all database calls occur strictly server-side using `SUPABASE_SERVICE_ROLE_KEY`.
- **Zero Browser Credential Exposure:** Neither service keys nor direct database credentials are bundled into client-side JavaScript.
- **Instant Synchronization:** Updates apply directly to the shared `attendance_records` table, meaning student and faculty views automatically reflect recalculated totals without requiring manual sync.

---

## 2. Environment Variables for Vercel

When deploying to [Vercel](https://vercel.com), configure the following environment variables in **Project Settings > Environment Variables**:

| Variable | Description | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (`https://nbxlcguwdojtdydkqrsq.supabase.co`) | Public / Browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon key for the Supabase project | Public / Browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Supabase Service Role Key | **Server Only (Never check 'Expose to browser')** |
| `DEAN_ADMIN_KEY` | Administrative passphrase for direct Dean access | **Server Only** |
| `JWT_SECRET` | Secret key used to sign encrypted HTTP-only session cookies | **Server Only** |

---

## 3. Local Development

```bash
# Navigate to project
cd /Users/aarav/.gemini/antigravity/scratch/ushss-dean-control

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 4. Key Navigation Modules

1. **Overview (`/`):** Key metrics (enrolled students, faculty count, sessions held, total attendance records), quick actions, and recent lecture sessions.
2. **Student Directory (`/students`):** Search students across programmes (M.A. English, B.A., Ph.D.) and semesters.
3. **Individual Attendance (`/individual-attendance`):** Lookup any student, view attended vs. missed classes per subject, and click **Correct Record** to apply authorized reliefs with justification notes.
4. **Subject Attendance Matrix (`/subject-attendance`):** Select any course subject to view all enrolled students, classes attended, and current percentages.
5. **Class & Session Attendance (`/class-attendance`):** Historical log of all classroom sessions conducted by faculty.
6. **Overall Attendance & Defalcation Register (`/overall-attendance`):** Cohort-level defalcation monitoring for students below the 75% threshold, with one-click CSV export.
7. **Activity History (`/activity-history`):** Complete audit trail of administrative modifications and relief grants.
8. **Security Settings (`/settings`):** Session inspection and security policy details.
