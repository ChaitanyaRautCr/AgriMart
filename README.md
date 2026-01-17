# AgriMart – Full Stack E-Commerce Web Application 🌾

AgriMart is a **full-stack e-commerce web application** designed to support agriculture-related buying and selling.
The platform allows **customers and retailers** to interact through a secure system with product management, cart functionality, and order processing.

This project is built as part of an **academic full-stack development project** using modern web technologies.

---

## 🚀 Features

### 👤 User Management

* User registration and login
* Role-based access (Customer / Retailer)
* JWT-based authentication

### 🛒 Product Management

* Add, update, delete products (Retailer)
* View products (Customer)
* Product image upload

### 🧺 Cart & Orders

* Add products to cart
* Place orders
* View order history

### 🔐 Security

* Authentication middleware
* Role authorization
* Environment variable protection

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Other Tools & Libraries

* JWT (Authentication)
* Multer (Image Upload)
* dotenv (Environment Variables)
* Git & GitHub (Version Control)

---

## 📁 Project Structure

```
AgriMart/
│
├── controller/
│   ├── userController.js
│   ├── productController.js
│   └── orderController.js
│
├── middleware/
│   ├── isAuthenticated.js
│   ├── isCustomer.js
│   ├── isRetailer.js
│   └── uploadImage.js
│
├── model/
│   ├── userModel.js
│   ├── productModel.js
│   ├── orderModel.js
│   └── imageModel.js
│
├── public/ (Frontend files)
│
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ChaitanyaRautCr/AgriMart.git
```

### 2️⃣ Navigate to Project Folder

```bash
cd AgriMart
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 5️⃣ Run the Application

```bash
npm start
```

---

## 📌 Important Notes

* `node_modules` and `.env` are ignored using `.gitignore`
* Do not upload sensitive information to GitHub
* This project is intended for **learning and academic purposes**

---

## 👨‍💻 Author

**Chaitanya Raut**
Full Stack Web Developer
BBA (Computer Applications)
AgriMart Project

---

## 📄 License

This project is developed for educational use only.
