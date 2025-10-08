# SLUGGER (Formerly ALPB Analytics)

The first centralized data analytics platform for the Atlantic League of Professional Baseball, built to make cutting-edge baseball insights accessible across the league. Powered by Trackman radar data and developed in collaboration with the [Johns Hopkins University's Sports Analytics Research Group](https://sports-analytics.cs.jhu.edu/), SLUGGER enables analysts, players, coaches, and more to tap into a growing library of interactive "widgets" — analytical tools that use our API to drive game-changing insights.

## Accessing the Platform

Visit [ALPB Analytics](https://alpb-analytics.com/) to get started.
**Players, coaches, and front office members** should look out for an invite from a team administrator after signing up.

## Deploying Locally

### Option 1: Traditional Setup (Without Docker)

1. Clone this repository and navigate to the project directory.

2. To run the backend server:

   i. Navigate to the `backend` directory.
   ii. Install packages using `npm install`.
   iii. Copy `.env.example` to `.env` in the project root and configure all environment variables.
   iv. Run `npm start`. This will start the server at `http://localhost:3001`

3. To run the frontend:

   i. Navigate to `frontend` directory.
   ii. Install packages using `npm install`.
   iii. Configure environment variables in `.env` file.
   iv. Run `npm dev`. This will run the application at `http://localhost:3000`.

### Option 2: Docker Setup

#### Prerequisites
- Docker and Docker Compose installed on your system
- Latest `.env` file with all required environment variables in the project root

#### Quick Start

1. Clone the repository and navigate to the project directory
2. Ensure you have the latest `.env` file with all required variables (see `.env.example` for reference)
3. Run the application:

   ```bash
   # Build and start all services
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)

#### Development Workflow

- **Starting services**: `docker-compose up`
- **Rebuild images**: `docker-compose up --build`
- **View logs**: `docker-compose logs -f`
- **Stop services**: `docker-compose down`
- **Run tests**: `docker-compose run backend npm test`

#### Important Notes

- The root `.env` file is required and will be used by both frontend and backend services
- Database data is persisted in a Docker volume
- Frontend hot-reload works in development mode
- For production builds, use the included Dockerfile with appropriate build arguments

#### Environment Variables

Make sure your `.env` file includes all required variables (see `.env.example` for reference). Key variables include:

- Database credentials
- AWS credentials
- Cognito configuration
- API endpoints
- Session secrets
