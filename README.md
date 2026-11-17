# Remix  iSchool Tutor Insights_Abdalla_Ahemd

Build a clean, modern static web app for iSchool Tutor KPI & Culture Fit Reports.

The app should use the uploaded CSV/Google Sheet data as its fixed dataset. Do NOT create a database, authentication system, or dynamic tutor assignment system.

Data

Use the existing sheet data containing:

Tutor ID

Tutor Name

Innovation / Team Collaboration

Adaptability

Growth Mindset

Dependability / Attendance

Professionalism

Total Score

Do NOT use or display the Quality column.

Main Function

Create a searchable Tutor selection field:

Search tutor by ID or name

After selecting a tutor, automatically display their existing data and scores.

Calculate/display the Total Score based on the KPI scores.

Report Preview

After selecting a tutor, generate a professional report preview containing:

iSchool branding

Tutor Name

Tutor ID

Mentor

Team Leader

Evaluation Month

KPI breakdown with score / maximum score

Total Score and percentage

Mentor Feedback text area

The Mentor should be able to add/edit feedback before generating the report.

Actions

Add:

Edit Report — allows editing the displayed report/feedback.

Save as PDF — generates and downloads the report as a professional A4 PDF.

The PDF must include:

Tutor Name

Tutor ID

Mentor

Team Leader

KPI scores

Total Score

Percentage

Mentor Feedback

Do NOT include Quality.

Design

Follow the iSchool brand palette:

Primary Blue: #043FAD

Orange: #C76316

Light Blue: #B1D1E6

Bright Blue: #05ACFF

Yellow: #FFBB1C

Background: #ECF8FF

Use #043FAD as the primary color.

Keep the UI clean, modern, professional, educational, and responsive.

The report should look like a polished official iSchool monthly evaluation report, not a basic form.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6fa4656e-a245-4af7-b3a8-a535734a4751).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
