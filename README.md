# SmartCommute

### Smarter journeys. Shared rides. Better commutes.

SmartCommute is a web application concept designed to make daily commuting more convenient and affordable by helping people explore carpooling opportunities and share travel expenses.

The project combines a modern web interface with a backend and database to support the development of a smarter commuting experience.

## Key Features

- **Home Page** — A central place to discover the application and its purpose.
- **User Registration** — An interface for users to register.
- **Login Interface** — A dedicated page for user login.
- **Passenger Dashboard** — A dedicated interface for passengers.
- **Carpooling Concept** — Designed around shared journeys and more efficient commuting.
- **Cost Sharing** — Aims to help commuters reduce individual travel expenses.

*Note: Features described as planned or conceptual may require further implementation.*

## Technology Stack

| Technology | Purpose |
|---|---|
| React.js | Building the user interface |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Styling and responsive layouts |
| Node.js | Backend JavaScript runtime |
| MongoDB | Database |
| Git & GitHub | Version control and source code hosting |

## Project Structure

```text
SmartCommute/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
├── client/
│   ├── public/
│   ├── src/
│   │   └── pages/
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       └── PassengerDashboard.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- MongoDB, if required by the backend

### 1. Clone the repository

```bash
git clone https://github.com/priyanshiprisha/SmartCommute.git
cd SmartCommute
```

### 2. Install and run the frontend

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed in your terminal.

### 3. Configure and run the backend

Open a second terminal from the project root:

```bash
cd backend
npm install
```

Configure the environment variables required by your backend in a local `.env` file. Then run the start or development script defined in `backend/package.json`.

## Environment Variables

Keep database credentials, passwords, API keys, and other secrets out of version control.

Never publish real `.env` values in your GitHub repository.

## Future Enhancements

- Route-based carpool matching
- Map integration and route visualization
- Travel cost and fare-splitting calculations
- Trip booking and ride management
- Enhanced authentication and user profiles
- Improved mobile responsiveness

## Project Goal

The goal of SmartCommute is to explore how web technologies can help make everyday transportation more accessible, efficient, and cost-effective.

## Author

**Priyanshi Prisha**

[GitHub Profile](https://github.com/priyanshiprisha)

---

*SmartCommute — Making every journey a little smarter.*
