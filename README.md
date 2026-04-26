# Revive — Remote EC2 Virtual Instance and Volume Engine

Revive is a self-hosted web application for managing AWS EC2 infrastructure. It provides a unified interface for controlling instances, managing volumes and snapshots, and restoring instances from snapshots using a live SSE-streamed workflow.

Whether you're spinning up instances, performing maintenance, or bringing a VM back to life from a snapshot, Revive gives you full control of your cloud infrastructure in a snap.

It’s like CPR for your cloud—resurrecting instances and keeping your operations smooth, without the heavy lifting. With Revive, your cloud is always just a few clicks away from peak performance!

## Features

- Start, stop, reboot, and monitor AWS EC2 instances
- Restore instances from EBS snapshots with real-time progress streaming
- Pre-flight IAM permission check (DryRun) before attempting a restore
- Manage EBS volumes and view EC2 snapshots
- Playbooks — saved sequences of restore steps across multiple instances
- Audit log with per-session correlation tracking
- Auto-sync: configurable background polling of AWS resource state
- User authentication with role-based access

## Tech Stack

- **Next.js 14** (App Router) — React framework with server and client components
- **AWS SDK v3** — EC2, IAM, and STS clients
- **Prisma ORM + PostgreSQL** — schema-managed relational database
- **React Query v5** — client-side data fetching and caching
- **Tailwind CSS** — utility-first styling
- **TypeScript** — end-to-end type safety
- **Docker Compose** — containerized app and database

## Prerequisites

- Docker and Docker Compose
- An AWS account with EC2 access
- AWS credentials (access key ID + secret) with the permissions described in [docs/aws/AWS_Configuration.md](docs/aws/AWS_Configuration.md)

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/revive.git
cd revive
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```sh
cp example.env .env
```

Required variables:

```sh
# Database
POSTGRES_USER=revive
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=revive
POSTGRES_PORT=5432
POSTGRES_HOST=postgres
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public

# AWS
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Auth
JWT_SECRET=your_jwt_secret_change_me
```

### 3. Start the application

```sh
make up
```

This starts both the Next.js app and PostgreSQL containers in detached mode. Open [http://localhost:3000](http://localhost:3000).

To rebuild images before starting (e.g. after dependency changes):

```sh
make up-build
```

### 4. Run database migrations

On first run (and after pulling schema changes):

```sh
make db-migrate
```

To seed initial data:

```sh
make db-seed
```

## Common Commands

| Command | Description |
|---|---|
| `make up` | Start all services (detached) |
| `make up-build` | Rebuild images and start |
| `make down` | Stop all services |
| `make down-v` | Stop and remove volumes (destructive) |
| `make restart` | Restart all services |
| `make logs` | Tail logs for all services |
| `make logs SERVICE=nextjs_app` | Tail logs for the app only |
| `make shell` | Open a shell in the app container |
| `make db-migrate` | Run Prisma migrations |
| `make db-seed` | Seed the database |
| `make db-reset` | Reset and re-migrate (destructive) |
| `make db-shell` | Open an interactive psql shell |
| `make db-users` | List all registered users |
| `make help` | Show all available commands |

## Project Structure

```
app/
  (routes)/          # Page components (instances, snapshots, volumes, playbooks, logs, restoration, settings)
  api/               # API route handlers
lib/
  services/          # Server-side business logic (AWS, auth, audit, playbooks, etc.)
  hooks/             # React Query data-fetching hooks
  ui/                # Reusable UI components
  validation/        # Zod schemas and validation helpers
prisma/
  schema.prisma      # Database schema
  migrations/        # Applied migrations
docs/
  aws/               # IAM policy and AWS configuration guide
```

## AWS Configuration

See [docs/aws/AWS_Configuration.md](docs/aws/AWS_Configuration.md) for the required IAM permissions, a minimal policy document, snapshot requirements, and volume device name guidance.
