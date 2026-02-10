# 📍 Your Places - Backend API
Backend service for **Your Places**, it is a full-stack web application that allows users to create an account and share their favorite places. 
Users can post places with images, view places created by other users, and manage (create, update, delete) their own places securely.


## 📌 Features
- User authentication (signup & login)
- JWT-based authorization
- Create, update, and delete places (authenticated users only)
- Public access to view places
- Image upload for places and user profiles
- Places filtered by user
- Input validation and error handling


## 🛠️ Tech Stack

### Backend
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (Mongoose)
- Authentication: JWT (jsonwebtoken)
- Password Hashing: bcryptjs
- Validation: express-validator
- File Upload: Multer
- Template Engine: EJS
- Environment Config: dotenv
- UUID Generator: uuid

### Cloud & External Services
- Firebase – Image storage & hosting
- Firebase Admin & Functions – Backend integration


## 📚 API Endpoints

### 🔐 Auth
- `GET /users` – Get all users
- `POST /users/signup` – Register new user (with profile image)
- `POST /users/login` – User login (JWT-based)

### 📍 Places
- `GET /places` – Get all places
- `GET /places/:pid` - Get place by place ID
- `GET /places/user/:uid` - Get all places created by a specific user
- `POST /places` - Create a new place (with image)
- `PATCH /places/:pid` - Update place detail
- `DELETE /places/:pid` - Delete a place

### 🍾 Product
- `GET /products` – Get all products
- `GET /products/recommendation` – Get recommended products
- `GET /products/:productId` – Get product by ID
- `POST /products` – Create new product
- `PATCH /products/:productId` – Update product
- `DELETE /products/:productId` – Delete product


## 🚀 How to Run

### Requirements
- Node.js (v20+ recommended)
- MongoDB (local or cloud)
- Firebase project (for image storage)

### Steps
```bash
https://github.com/FahmiEfendy/yourplaces--back.git # clone repository

cd yourplaces--back # access project directory

npm install # install dependencies

npm run devStart # start with development environment

npm run start # start with production environment
```

After running the command, the application will be available at: http://localhost:5313/api


## 🧠 Project Notes
- This project focuses on backend architecture, authentication, and access control
- Image uploads are handled using Multer + Firebase
- MongoDB schema validation ensures data consistency
- Designed with separation of concerns (routes, controllers, middleware)


## 📬 Contact
- Email: itsfahmiefendy@gmail.com
- LinkedIn: https://www.linkedin.com/in/fahmi-efendy
