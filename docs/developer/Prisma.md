# Postgres Database

To start working with your PostgreSQL database inside Docker, you can follow these steps. These steps assume that your docker-compose.yml file has PostgreSQL set up and running in its own container. You’ll also be interacting with PostgreSQL from your Next.js application, likely via Prisma ORM or another database client.

1. Verify Your PostgreSQL Container is Running
   Make sure your PostgreSQL container is running correctly. You can check the status by running:

```shell
docker compose ps
```

This will show you the status of your containers. Your PostgreSQL container should be listed and in the "Up" state.

1. Access PostgreSQL from the Host Machine
   If you want to access your PostgreSQL database directly from your local machine to run queries, you can use psql or a GUI like pgAdmin. You can connect to the PostgreSQL container using the following:

## Using psql (PostgreSQL Command Line Interface):

Run the following command to connect to PostgreSQL within the container:

```sh
docker exec -it <postgres-container-name> psql -U <username> -d <dbname>
```

Replace <postgres-container-name> with the name of your PostgreSQL container, <username> with your database username (usually postgres), and <dbname> with the database name you want to connect to.

For example:

```sh
docker exec -it myproject_postgres_1 psql -U postgres -d mydb
```

This will open the PostgreSQL shell, and you can run SQL commands directly.

## Using pgAdmin:

Alternatively, you can connect to PostgreSQL using a GUI like pgAdmin. If you're using pgAdmin, just connect to the PostgreSQL instance using the following details:

Host: localhost (or the container name if not using localhost)
Port: 5432 (the default PostgreSQL port)
Username: postgres (or your custom username)
Password: The password you set for your PostgreSQL container (or postgres if not changed) 3. Set Up Prisma ORM (or Other Database Client) in Your Next.js Project

To connect your Next.js project to the PostgreSQL database, you will likely use an ORM like Prisma. If you don't have Prisma set up yet, here’s how to configure it:

## Install Prisma in Your Next.js Project:

Run the following commands inside your project directory:

```sh
npm install @prisma/client
npm install prisma --save-dev
```

Then, initialize Prisma:

```sh
npx prisma init
```

This will create a prisma directory with a schema.prisma file and .env file. The schema.prisma file is where you define your data model.

## Update `.env` for Database Connection:

In your .env file, configure the database URL for Prisma:

```conf
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/yourdbname?schema=public"
```

Replace `yourpassword` with the password for your PostgreSQL database.
Replace `yourdbname` with the name of your database.

Make sure the host (localhost) and port (5432) match the settings in your docker-compose.yml file.

## Update schema.prisma:

In your prisma/schema.prisma file, define your data model. For example:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model EC2Instance {
  id        Int      @id @default(autoincrement())
  name      String
  type      String
  status    String
  createdAt DateTime @default(now())
}
```

This defines an EC2Instance table in your database with an auto-incrementing id, a name, type, status, and a createdAt timestamp.

## Run Prisma Migrate:

After defining your model, run the migration command to create the database table:

```sh
npx prisma migrate dev --name init
```

This will apply the schema changes to your PostgreSQL database.

## Generate Prisma Client:

After the migration, generate the Prisma client:

```sh
npx prisma generate
```

This will create a Prisma client that you can use to interact with your database.

## Use Prisma in Your Next.js Code:

Now you can start interacting with the database from your Next.js project. For example, to fetch all EC2 instances, you can use the Prisma client like this:

```tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getServerSideProps() {
  const instances = await prisma.eC2Instance.findMany();

  return {
    props: {
      instances,
    },
  };
}

export default function InstancesPage({ instances }) {
  return (
    <div>
      <h1>EC2 Instances</h1>
      <ul>
        {instances.map((instance) => (
          <li key={instance.id}>
            {instance.name} - {instance.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```
