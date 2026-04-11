# Secure Blockchain Payment System

A full-stack secure blockchain payment solution with a React frontend, Node.js/Express backend, and Ethereum smart contracts managed by Hardhat.

## Project Structure

- `Backend/` - Node.js/Express API and authentication services
- `Blockchain/` - Solidity smart contract, Hardhat setup, and deployment scripts
- `Frontend/` - React + Vite client application

## Features

- Blockchain-based payment and token management
- User authentication and profile management
- Two-factor authentication (2FA) support
- Crypto wallet integration with MetaMask
- Payment tracking and activity analytics
- Smart contract deployment using Hardhat

## Prerequisites

- Node.js 20+ / npm
- Git
- MetaMask (for frontend wallet interactions)
- Local Ethereum node or Hardhat network for contract deployment

## Setup

### 1. Clone repository

```bash
git clone https://github.com/sujal7005/Secure-Blockchain-payment-system.git
cd Secure-Blockchain-payment-system
```

### 2. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install

cd ../Blockchain
npm install
```

## Run the Backend

1. Create a `.env` file in `Backend/` with your environment variables.
2. Start the server:

```bash
cd Backend
npm run dev
```

The backend runs on `http://localhost:3000` by default.

## Run the Frontend

```bash
cd Frontend
npm run dev
```

Open the displayed Vite URL (usually `http://localhost:5173`).

## Compile and Deploy Smart Contracts

```bash
cd Blockchain
npm run compile
npm run node
npm run deploy
```

- `npm run compile` compiles Solidity contracts
- `npm run node` starts a local Hardhat node
- `npm run deploy` deploys contracts to the local network

## Directory Summary

### Backend

- `server.js` - Express server entry point
- `app.js` - Express application configuration
- `config/db.js` - Database connection setup
- `src/controllers/` - Route controllers
- `src/routes/` - API route definitions
- `src/services/` - Business logic and authentication utilities
- `src/models/` - User and transaction data models

### Blockchain

- `contracts/` - Solidity smart contracts
- `scripts/deploy.js` - Deployment script for contracts
- `hardhat.config.cjs` - Hardhat configuration

### Frontend

- `src/App.jsx` - Main React application
- `src/components/` - UI components
- `src/pages/` - Login and signup views
- `src/context/AuthContext.jsx` - Authentication context
- `src/services/twoFactorService.js` - 2FA helpers

## Notes

- Update `Backend/.env` with database credentials and JWT secrets.
- Ensure MetaMask is connected to the local Hardhat network when testing blockchain flows.

## License

This project is provided as-is. Customize the license according to your needs.
