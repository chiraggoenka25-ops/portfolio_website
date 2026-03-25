# Personal Portfolio Website

A complete, modern, and responsive personal portfolio website with a fully functional contact form. 
The frontend is built using standard HTML, vanilla CSS (Dark Navy & Teal aesthetic), and vanilla JavaScript. 
The backend is powered by Node.js, Express, and a PostgreSQL database (e.g., Supabase) using `pg`.

## Features
- **About Me**: Short bio and profile section.
- **Skills**: Badge/tag-based layout for technical skills.
- **Achievements**: Card-based grid layout.
- **Contact Me**: Working form that saves submissions to a PostgreSQL database.
- **Design**: Fully responsive, dark mode aesthetic, smooth scrolling, and subtle reveal animations on scroll.

---

## Prerequisites
- **Node.js**: Ensure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

## Quick Start Guide

Follow these step-by-step instructions to run the website locally:

### 1. Open the project folder
Open your terminal or command prompt and navigate to the folder containing this project:
```bash
cd path/to/portfolio_website
```

### 2. Configure Environment and Install Dependencies
Create a `.env` file in the root of the project and add your database URL:
```env
DATABASE_URL=postgres://user:password@host:port/database
```
Then run the following command to install the required packages:
```bash
npm install
```

### 3. Start the server
Start up the Node.js backend server:
```bash
npm start
```
You should see output similar to this:
```
Database initialized.
Server is running at http://localhost:3000
```

### 4. View the website
Open your favorite web browser and navigate to:
[http://localhost:3000](http://localhost:3000)

---

## File Structure
- `public/`: Contains all frontend files serving the website.
  - `index.html`: The markup structure of the website.
  - `style.css`: The styling, color variables, layouts, and animations.
  - `script.js`: Features intersection observers for scrolling animations and logic for the contact form fetching API.
- `server.js`: The backend application. Configures the Express server to serve static files from `public/` and defines the `POST /contact` endpoint.
- `package.json`: Contains project metadata and lists required node modules.

## Stopping the server
To stop the server from running, go to your terminal and press `Ctrl + C`. This will safely close the database connection and exit the script.
