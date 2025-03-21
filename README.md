# JobBoard - Full-Stack Job Board Platform

A comprehensive job board platform built with React, Express, and TailwindCSS that allows companies to post jobs and job seekers to apply for them.

## Features

- User authentication with multiple roles (Job Seeker, Company, Admin)
- Company profiles and job postings
- Job search and filtering
- Job applications with resume uploads
- Responsive design with dark/light mode
- Interactive dashboards for companies and job seekers

## Tech Stack

- *Frontend*: React, TailwindCSS, Shadcn UI, React Query
- *Backend*: Express.js, Drizzle ORM
- *Authentication*: Passport.js, express-session
- *Database*: PostgreSQL (in-memory for development)

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)

## Installation

1. Unzip the downloaded file
2. Navigate to the project directory

bash
cd jobboard


3. Install the dependencies

bash
npm install


## Running the Application

1. Start the development server

bash
npm run dev


2. Open your browser and visit [http://localhost:5000](http://localhost:5000)

## User Roles

The application supports three types of users:

- *Job Seekers*: Can browse jobs, apply for positions, and track their applications
- *Companies*: Can create company profiles, post job listings, and review applications
- *Admins*: Can manage the entire platform, users, and content

## Usage Guide

### For Job Seekers

1. Register with the "Find a job" option
2. Browse available jobs from the home page or job listings
3. Apply for jobs by clicking "Apply" on the job details page
4. Track your applications from the "Applications" section

### For Companies

1. Register with the "Hire talent" option
2. Complete your company profile
3. Post new jobs by clicking "Post a Job" from the dashboard
4. Review applications to your jobs from the "Applications" section

## Project Structure

- /client: React frontend code
  - /src/components: Reusable UI components
  - /src/pages: Application pages
  - /src/hooks: Custom React hooks
  - /src/lib: Utility functions
  - /src/store: State management

- /server: Express backend code
  - /routes.ts: API route definitions
  - /storage.ts: Data storage and access layer
  - /auth.ts: Authentication logic

- /shared: Shared code between frontend and backend
  - /schema.ts: Database schemas and types

## API Endpoints

### Authentication
- POST /api/register: Register a new user
- POST /api/login: Login with username and password
- POST /api/logout: Logout current user
- GET /api/user: Get current user info

### Jobs
- GET /api/jobs: Get all jobs with optional filtering
- GET /api/jobs/:id: Get job by ID
- POST /api/jobs: Create a new job (company role required)
- PATCH /api/jobs/:id: Update a job (company role required)
- DELETE /api/jobs/:id: Delete a job (company role required)

### Companies
- GET /api/companies: Get all companies
- GET /api/companies/:id: Get company by ID
- GET /api/companies/user/:userId: Get company by user ID
- POST /api/companies: Create a company (company role required)
- PATCH /api/companies/:id: Update a company (company role required)

### Applications
- GET /api/applications: Get all applications
- GET /api/applications/user/:userId: Get applications by user
- GET /api/applications/company/:companyId: Get applications by company
- POST /api/applications: Submit a job application (job seeker role required)
