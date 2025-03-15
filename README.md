# Schemer - Visual Database Schema Designer

[![Schemer Demo Video](https://img.youtube.com/vi/rt8h5SGPhx8/0.jpg)](https://www.youtube.com/watch?v=rt8h5SGPhx8)
*Click the image above to watch the demo video*

![Project Screenshot](path/to/your/screenshot.png)

## 🌟 Overview

Schemer is a powerful, interactive database schema design tool that helps developers and database architects visualize and create database schemas with ease. Built with Next.js and React Flow, it provides a modern, intuitive interface for designing database structures, relationships, and constraints while leveraging LLM capabilities to enhance productivity.

[View Schemer on DevPost](https://devpost.com/software/schemer-the-final-db)

## 🧠 Inspiration

Schemer was born from observing the "Cursor Shift" - the paradigm change in how developers interact with code through LLM integration. Tools like GitHub Copilot and Cursor have demonstrated that LLMs are most effective not as standalone agents, but as collaborative partners that enhance human productivity.

The key insight was applying this collaborative approach to database schema design. While numerous schema designers exist, they typically lack meaningful AI integration or offer only basic chatbot functionality without true context awareness. Schemer bridges this gap by providing an intelligent assistant that understands your database schema and can help modify it through natural language.

## ✨ Key Features

- **Visual Schema Design**: Drag-and-drop interface for creating and organizing database tables
- **AI-Assisted Design**: Chat with an AI assistant that has full context of your schema
- **Natural Language Commands**: Modify your schema through conversation
- **Image Recognition**: Draw schemas by hand and import them into the tool
- **Real-time Collaboration**: Work with team members on database design
- **Relationship Management**: 
  - Create one-to-one, one-to-many, and many-to-many relationships
  - Visual connection lines between related tables
  - Automatic relationship type detection
- **Rich Data Type Support**:
  - String types (varchar, text, char)
  - Numeric types (int, float, decimal, etc.)
  - Date/Time types (datetime, timestamp)
  - Special types (UUID, JSON, JSONB)
  - Custom enum types
- **Column Properties**:
  - Primary key constraints
  - Unique constraints
  - Not null constraints
  - Default values
  - Check expressions
- **Version Control**: Track schema changes with versioning system
- **Dark/Light Mode**: Comfortable viewing experience in any environment
- **Auto-Layout**: Automatically organize tables for optimal visualization
- **Export Capabilities**: Save schemas as images for documentation
- **Web Search Integration**: Verify schema design decisions with up-to-date information

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: Tailwind CSS, shadcn/ui
- **Visualization**: React Flow (@xyflow/react)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **AI Integration**: Azure OpenAI Service with multimodal capabilities
- **Deployment**: Azure Static Web Apps
- **Analytics**: PostHog

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/schemer.git
   ```

2. Install dependencies:
   ```bash
   cd schemer
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Configure the environment variables in `.env.local` following the example file.

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to start designing!

## 🎯 Usage

[Add a GIF showing the basic workflow]

1. **Create Tables**: 
   - Click the "+ Table" button in the sidebar
   - Double-click table name to edit
   - Add columns with types and constraints

2. **Define Relationships**:
   - Drag from one column to another to create relationships
   - Configure relationship types (one-to-one, one-to-many, many-to-many)

3. **AI Assistance**:
   - Use Cmd+L to open the chat interface
   - Point to specific tables/columns to modify them
   - Request schema changes through natural language
   - Upload hand-drawn schema diagrams for automated creation

4. **Manage Enums**:
   - Create custom enum types
   - Add and edit enum values
   - Use enums in column definitions

5. **Collaborate**:
   - Share projects with team members
   - Assign different access roles (admin, editor, viewer)
   - Work simultaneously on the same schema

## 📱 Screenshots

[Add 2-3 screenshots showing different aspects of the schema designer]

## 💪 Development Challenges

Several key challenges were overcome during development:

- **Efficient Schema Storage**: Designing a database structure to efficiently store and retrieve table structures
- **Local-First Architecture**: Implementing background saving with local storage for reliability
- **Tool Calling Integration**: Building an effective interface between natural language and schema modification commands
- **Auto-Layout Algorithms**: Implementing complex algorithms for automatic arrangement of schema entities
- **Multimodal AI Integration**: Connecting image recognition capabilities for hand-drawn schema import

## 🔮 Future Roadmap

- **Incremental Change Display**: Showing step-by-step modifications suggested by the AI
- **Enhanced Sync Engine**: Improving the local-first storage with a robust sync engine using Dexie
- **Multimodal Agent Enhancements**: Expanding the capabilities of the AI assistant
- **Custom API Key Support**: Allowing users to use their own AI service keys
- **Pro Plan**: Optional subscription for advanced AI models like Claude

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- React Flow (@xyflow/react) for the powerful visualization capabilities
- shadcn/ui for beautiful UI components
- Prisma team for the robust ORM
- Azure for cloud infrastructure and AI services
- Clerk for authentication
- The inspiration from tools like Cursor and GitHub Copilot

## 📞 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Links:
- GitHub: [https://github.com/yourusername/schemer](https://github.com/yourusername/schemer)
- DevPost: [https://devpost.com/software/schemer-the-final-db](https://devpost.com/software/schemer-the-final-db)
- Demo Video: [YouTube](https://www.youtube.com/watch?v=rt8h5SGPhx8)
