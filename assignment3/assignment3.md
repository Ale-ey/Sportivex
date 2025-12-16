Assignment 3
User Interaction, Forms & Basic Backend Integration
CS344 - Web Engineering
Group Assignment
CLO 3 – Analyze the interaction between front-end and back-end technologies in designing and developing complex web applications.
CLO 5 - Perform effectively both individually and as a member of a team
Objective
This assignment evaluates your ability to convert your interface designs into functional, interactive components while introducing basic backend concepts. Students will build interactive forms, apply validation, and connect their form to a simple backend or mock backend service to simulate data handling.
Assignment Description
Each group must complete the following tasks:
1. Identify and Restate the User Interaction & Backend Goals:
•	Briefly restate the form-related user interactions needed in your project.
•	Mention any updates or changes since your prototypes.
•	Identify what data your backend will store or process (e.g., login info, bookings, messages, feedback, etc.).
2. Form Design & Structure:
Implement at least one complete, functional form relevant to your project such as:
•	Registration / Login
•	Booking / Reservation
•	Feedback / Contact
•	Search with filters
•	Product/Service submission
Each form must include:
•	Proper labels, placeholders, and field naming
•	Dropdowns, radio buttons, checkboxes (at least one)
•	Organized layout consistent with your design theme
•	Responsive design (recommended)
3. Validation:
Apply client-side validation for fields such as:
•	Required inputs
•	Email/phone format
•	Password rules
•	Character limits
•	Numeric ranges (if applicable)
Validation must display clear error and success messages.
4. User Interaction Features (Minimum Two):
Integrate at least two interactive components, such as:
•	Modal pop-up
•	Show/hide password toggle
•	Tooltip or hover interaction
•	Character counter
•	Loading animation
•	Toast/notification messages
•	Multi-step form
•	Live preview (e.g., profile image preview)
•	Dynamic search filter
•	Auto-suggestions (array-based)
5. Backend Integration (Basic):
Implement any one of the following backend options:
Option A — Node.js + Express Server (recommended)
•	Create a small backend route (e.g., /submit, /register, /contact).
•	Form data should be sent from the front-end to the backend using POST.
•	Print the received data on the server console OR save to a JSON file.
Option B — Mock Backend using JSON Server
•	Configure a JSON Server API endpoint.
•	Submit form data to db.json.
•	Confirm data insertion by showing updated JSON file or console log.
Option C — LocalStorage-based Data Handling (simplest)
•	Store form data in browser localStorage.
•	Retrieve and display submitted data on another page or admin view.
Option D — Any Framework Backend (Optional)
Students using frameworks like Next.js, Laravel, Django, Flask, Firebase, or Supabase may use their preferred stack—but the backend task must remain simple.
Backend must handle at least one form submission.
6. Documentation:
Submit a short report (2–3 pages) containing:
•	Summary of form goals + backend plan
•	Explanation of form fields & validation choices
•	Screenshots showing:
o	the form
o	validation
o	interaction features
o	backend output (console log, JSON file, DB entry, or localStorage screenshot)
•	Tools and technologies used
•	Contribution of each group member
Deliverables
A single compressed folder containing:
•	PDF report
•	Source code (front-end + backend folder)
•	Demo video (2–3 minutes) demonstrating:
o	Filling the form
o	Validation
o	User interactions
o	Backend submission working
•	Any assets or reference files
Evaluation Criteria
Criteria	Marks	Description
Interaction goals & backend overview	3	Clarity of user actions, relevance, connection to backend
Form design & structure	4	Layout, usability, consistency with project theme
Validation quality	4	Accuracy, clarity of messages, coverage of edge cases
Interaction features (min. 2)	4	Functionality, smoothness, relevance to the user flow
Backend integration	3	Correct handling of form submission (API, JSON Server, or localStorage)
Documentation	2	Organization, explanation, screenshots, group contribution
Total	20	
Submission Guidelines
•	Submit on LMS by the due date.
•	Late submissions: 10% deduction per day.
•	All backend code must be runnable and tested.
•	Demo video must clearly show backend receiving the form data.

