# StockBridge — B2B Surplus Inventory Exchange

**Academic full-stack mini-project** built with HTML5, CSS3, vanilla JavaScript, Node.js, Express, MySQL and a small Solidity registry demonstration.

## Problem statement
Usable surplus inventory can remain idle at one business while another business needs similar materials. StockBridge demonstrates a small B2B marketplace where sellers list surplus stock and buyers search, compare and submit inquiries. The site also includes the academic department, timetable, registration and event-explorer sections needed to demonstrate the Web Technology laboratory syllabus.

## Technology stack
- Frontend: semantic HTML5, CSS Grid/Flexbox, vanilla JavaScript and DOM events
- Backend: Node.js + Express REST API
- Database: MySQL using `mysql2` parameterized queries
- Smart contract: Solidity `SurplusRegistry.sol`
- Development: VS Code, Node.js 18+, MySQL 8+ (or compatible MariaDB)

## Features mapped to the laboratory assignments
1. **Semantic webpage:** department overview, faculty/mentoring, vision and mission, project team, contact links, accessible labels, navigation, external link, and multimedia.
2. **Tables and layout:** timetable table with caption, `rowspan`, `colspan`, header/footer cells, campus infrastructure, and responsive div/span-based layout with CSS Grid/Flexbox.
3. **JavaScript:** student-interest registration form with client-side validation and server-side validation, theme switch, live countdown, hidden checklist, dynamic text formatting and event handlers.
4. **Dynamic event explorer:** event cards rendered from JSON/API data, keyword search, category filter, from-date filter, sorting, empty state and clear filters without page reload.
5. **Database connection:** registration, surplus listings and buyer inquiries stored in MySQL.
6. **Admin dashboard:** academic demo login gate, listing create/edit/close operations and event create/edit/delete operations.
7. **Solidity:** records a seller address, listing reference and timestamp in an educational contract. It does not verify physical inventory or handle payment.
8. **Deployment/documentation:** this README, setup steps, API list, test cases and deployment notes.

## Setup on Windows / VS Code
1. Install Node.js 18+ and MySQL. Open this folder in VS Code.
2. Open Terminal → New Terminal and run `npm install`.
3. Open MySQL Workbench, open `database/schema.sql`, and execute the complete script. It creates the `stockbridge` database and tables (`listings`, `inquiries`, `registrations`, `events`) and inserts illustrative sample rows.
4. Copy `.env.example` to `.env`. Update `DB_PASSWORD` with your local MySQL password. Do not share or commit `.env`.
5. Start the app with `npm start` (or `npm run dev` during development).
6. Open `http://localhost:3000`.
7. Check database connectivity at `http://localhost:3000/api/health`.
8. Open the admin page at `http://localhost:3000/admin`. Demo credentials: username `admin`, password `stockbridge2026`.

If the API/database is unavailable, the public inventory and event explorer can show illustrative sample data. A visible sample/demo state is **not** proof of database persistence. Confirm `api/health`, submit a form, and verify the matching row in MySQL before capturing Assignment 5 screenshots.

## Admin security note
The admin sign-in is a **client-side academic demonstration gate only**. It is not secure authentication and does not protect the API. Never deploy this prototype publicly with real or confidential data. A production version needs server-side authentication, hashed passwords, sessions, role-based authorization for all write endpoints, CSRF protection, rate limiting, HTTPS and audit logs.

## API endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Verify database connection |
| GET | `/api/listings?q=&category=&sort=` | Read/search/filter/sort listings |
| POST | `/api/listings` | Create a surplus listing |
| PATCH | `/api/listings/:id` | Update a listing |
| DELETE | `/api/listings/:id` | Soft-close a listing |
| POST | `/api/inquiries` | Save a buyer inquiry |
| POST | `/api/registrations` | Validate and save student-interest registration |
| GET | `/api/events?q=&category=&from=&sort=` | Read/filter/sort event records |
| POST | `/api/events` | Create an event |
| PATCH | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

## Assignment test cases
1. **A1:** use the main navigation links; confirm department overview, vision/mission, team and contact are present. Validate `public/index.html` using the W3C Nu HTML Checker and fix any reported errors.
2. **A2:** verify timetable caption and `rowspan`/`colspan`; resize the browser to test responsive layout. Try native audio/video controls with internet access.
3. **A3:** submit the registration form empty and with malformed email; confirm browser validation blocks it. Submit valid details after database setup and check the success message. Toggle theme and show/hide checklist.
4. **A4:** search `blockchain`; select `Workshop`; choose a date; change sort order; search a nonexistent keyword and confirm the empty state. No page refresh should be needed.
5. **A5:** register an interest, publish a surplus listing and send a buyer inquiry. Verify with `SELECT * FROM registrations;`, `SELECT * FROM listings;` and `SELECT * FROM inquiries;` in MySQL Workbench.
6. **A6:** sign in with the demo credentials; create, edit and close a listing. Create, edit and delete an event. Verify changes in MySQL.
7. **A7:** open `contracts/SurplusRegistry.sol` in Remix, compile with Solidity 0.8.20+, deploy to Remix VM, call `recordListing` with a non-zero bytes32 reference, then read it with `getListing`.
8. **A8:** capture the app running locally and include this README, `.env.example`, schema and deployment instructions. Only call it cloud-deployed if you actually deploy and verify the public URL.

## Screenshot checklist
Create a `screenshots/` folder and save genuine application captures:
- `A1-homepage-department.png`
- `A2-timetable-responsive-layout.png`
- `A3-validation-dom-theme.png`
- `A4-event-search-filter-sort.png`
- `A5-mysql-registration-listing.png`
- `A6-admin-login-crud.png`
- `A7-solidity-remix-test.png`
- `A8-running-app-documentation.png`

## Deployment notes
For an optional cloud demo, use a Node-compatible host such as Render and a managed MySQL provider that permits the host to connect. Set `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD` and `DB_NAME` as environment variables in the host dashboard. Do not upload `.env`. Configure HTTPS, server-side admin authorization and secure database access before public use. GitHub Pages alone cannot host the Express API or MySQL backend.

## Limitations and future work
Listings and event entries are academic demo data until tested with the database. Seller identities and inventory are not verified. The Solidity contract records a reference only; the website does not invoke it. Future work could include secure seller accounts, verification, images, quote negotiation, stock validation, ratings and payments.
