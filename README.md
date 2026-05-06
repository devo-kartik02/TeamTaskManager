# TaskMaster 🚀

TaskMaster is a modern, high-fidelity Team Task Management application built to streamline workflows, enhance collaboration, and visualize progress. It features a fully interactive Kanban board with an immersive glassmorphic design.

![TaskMaster Kanban Board Preview](https://via.placeholder.com/1200x600.png?text=TaskMaster+Preview) <!-- Replace with a real screenshot later -->

## ✨ Key Features

- **Modern Glassmorphic UI:** A visually stunning, fully responsive interface built with Tailwind CSS.
- **Advanced State Management:** Drag-and-drop Kanban board using `@hello-pangea/dnd`.
- **Project Organization:** Group tasks into separate projects with completion percentage tracking (Recharts).
- **Real-Time Data Visualizations:** Dynamic Bar & Area charts for weekly productivity using `recharts`.
- **Global Search & Filtering:** Powerful multi-select filters for Priority, Assignees, and search queries.
- **Activity Logging:** Comprehensive task tracking and "Recent Activity" feeds.
- **Email Notifications:** Automated NodeMailer triggers for task assignment.
- **Smart Task Cards:** Badges for "Days Remaining" and "Overdue" status.
- **Advanced Toasts:** Sonner notifications with "Undo" capabilities.
- **Role-Based Access Control:** Admin vs. Member permissions.
- **Secure Authentication:** JWT-based authentication with bcrypt password hashing.

## 🛠️ Technology Stack

**Frontend:**
- React (Vite)
- TypeScript
- Tailwind CSS (Styling)
- @hello-pangea/dnd (Drag and drop)
- Lucide React (Icons)
- Framer Motion (Animations)

**Backend:**
- Node.js & Express
- MongoDB & Mongoose (Database)
- JSON Web Tokens (JWT Auth)

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed. You will also need a MongoDB database (local or Atlas).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TaskMaster.git
   cd TaskMaster
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Setup the Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```

4. **Open the App**
   Navigate to `http://localhost:5173` in your browser.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the MIT License.
