# Smart Park Stock Inventory Management System (SIMS)

A comprehensive stock inventory management system built for Smart Park in Rubavu District, Rwanda. This system helps manage spare parts inventory, track stock movements, and generate reports.

## Features

- User Authentication with JWT
- Spare Parts Management
- Stock In/Out Operations
- Daily Reports Generation
- Responsive Design with Tailwind CSS

## Tech Stack

- Frontend: React.js with Tailwind CSS
- Backend: Node.js with Express
- Database: MySQL
- Authentication: JWT with bcrypt

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/TelieChris/SIMS_2025.git
cd SIMS_2025
```

2. Install dependencies:

For Backend:
```bash
cd backend-project
npm install
```

For Frontend:
```bash
cd frontend-project
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following variables:
```
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=sims
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Initialize the database:
- The database will be automatically initialized when you start the backend server
- Default admin credentials: 
  - Username: admin
  - Password: Admin@123

## Running the Application

1. Start the backend server:
```bash
cd backend-project
npm start
```

2. Start the frontend application:
```bash
cd frontend-project
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/login - User login
- POST /api/register - User registration

### Spare Parts
- GET /api/spare-parts - Get all spare parts
- POST /api/spare-parts - Add new spare part

### Stock Operations
- POST /api/stock-in - Record stock in
- POST /api/stock-out - Record stock out

### Reports
- GET /api/reports/daily-stock-out - Get daily stock out report
- GET /api/reports/stock-status - Get stock status report

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Chris Telie - [GitHub](https://github.com/TelieChris) 