# ReVive - Remote EC2 Virtual Instance and Volume Engine

`ReVive` is your all-in-one cloud management tool for AWS EC2 instances, making it effortless to manage, monitor, and restore virtual machines from snapshots. 

Whether you're spinning up instances, performing maintenance, or bringing a VM back to life from a snapshot, ReVive gives you full control of your cloud infrastructure in a snap. 

It’s like CPR for your cloud—resurrecting instances and keeping your operations smooth, without the heavy lifting. With ReVive, your cloud is always just a few clicks away from peak performance! ☁️🚀

## Features

 - Start, stop, and reboot AWS EC2 instances.
 - View instance details such as status, instance ID, and region.
 - Restore instances from AWS snapshots quickly.
 - Manage EC2 volumes and perform backups with ease.
 - Intuitive, user-friendly interface for cloud control.

## Tech Stack

 - **Next.js** - React framework for server-side rendering.
 - **AWS SDK** - Interact with AWS services like EC2 and S3.
 - **Tailwind CSS** - Utility-first CSS framework for styling.
 - **Typescript** - Strongly typed language for Next.js.
 - **Node.js** - Backend API routes for database interactions.
 - **PostgreSQL** - Database for tracking usage or auditing.

## Prerequisites

Before you begin, make sure you have the following installed:

 - Node.js (v14 or higher)
 - AWS account with access to EC2 and snapshot features
 - AWS credentials configured (use the AWS CLI or environment variables)

## Getting Started

1. Clone the Repository
```sh
git clone https://github.com/yourusername/revive.git
cd revive
```
2. Install Dependencies
```sh
npm install
```
3. Environment Variables

Create a `.env.local` file in the root directory of your project and add the following variables:
```sh
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_preferred_aws_region
```
4. Running the Development Server
```sh
npm run dev
```
Open http://localhost:3000 to view the app in your browser.

5. Building for Production
```sh
npm run build
npm run start
```

## Project Structure

```sh
├── components/          # Reusable UI components
├── pages/               # Next.js page components (routes)
│   └── api/             # API routes (for AWS SDK interaction)
├── public/              # Static files (images, etc.)
├── styles/              # Global and component-level styles
├── utils/               # Helper functions (e.g., for AWS SDK)
├── .env.local           # Environment variables
├── next.config.js       # Next.js configuration
├── package.json         # NPM dependencies and scripts
└── README.md            # Project documentation
```
