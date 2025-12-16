# Assignment 3: User Interaction, Forms & Basic Backend Integration

## 1. Identify and Restate the User Interaction & Backend Goals

**User Interaction Goals:**
The primary goal of our project, **Sportivex**, is to provide a seamless platform for students and faculty to register for sports activities. For this assignment, we focused on the **User Registration** flow. The form allows users to create an account by providing their personal details. We aimed to make this process intuitive, error-free, and visually appealing.

**Backend Goals:**
The backend is designed to securely store user data. Specifically, for the registration form, the backend needs to:
- Receive user data (Name, Email, CMS ID, Role, Password).
- Validate the data (e.g., check if the email is valid, ensure the CMS ID is unique).
- Hash the password for security.
- Store the user record in our database (Supabase).
- Return a success message or error details to the frontend.

---

## 2. Form Design & Structure

We implemented a **Registration (Sign Up)** form. This form is the gateway for new users to join the platform.

**Key Features:**
- **Labels & Placeholders:** Every field has a clear label and a helpful placeholder text to guide the user.
- **Input Types:** We used various input types:
    - `text` for Full Name and CMS ID.
    - `email` for Email Address.
    - `password` for Password fields.
    - **Dropdown (`<select>`)** for the "Role" field (Student, Admin, Instructor), ensuring users select a valid role.
- **Layout:** The form is centered on the screen using a Card layout, making it the focal point. It is fully responsive, adjusting its width for mobile and desktop screens.

**Code Example (Form Structure):**
```tsx
<div className="space-y-2">
  <Label htmlFor="role">Role</Label>
  <select
    id="role"
    {...register("role")}
    className="flex h-10 w-full rounded-md border..."
  >
    <option value="">Select your role</option>
    <option value="Student">Student</option>
    <option value="Admin">Admin</option>
    <option value="Instructor">Instructor</option>
  </select>
</div>
```

---

## 3. Validation

We applied robust **Client-Side Validation** to ensure data integrity before it even reaches the server.

**Validation Rules:**
- **Required Fields:** All fields (Name, Email, CMS ID, Role, Password) are mandatory.
- **Email Format:** Must be a valid email address.
- **Password Rules:** Must be at least 6 characters long.
- **CMS ID:** Must be a valid ID format.
- **Password Match:** The "Confirm Password" field must match the "Password" field.

**User Feedback:**
If a user makes a mistake, clear red error messages appear immediately below the specific field.

**Code Example (Validation Display):**
```tsx
{errors.email && (
  <p className="text-sm text-red-600">{errors.email.message}</p>
)}
```

---

## 4. User Interaction Features

To enhance the user experience, we integrated the following interactive features:

### A. Show/Hide Password Toggle
Users can click an "Eye" icon to toggle the visibility of their password. This helps prevent typing errors.

**Code Example:**
```tsx
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

### B. Tooltip for Password Requirements
We added a helpful **Tooltip** next to the "Password" label. When a user hovers over the info icon, a small popup appears explaining the password requirements (e.g., "Password must be at least 6 characters long"). This proactively helps users create valid passwords.

**Code Example:**
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Password must be at least 6 characters long</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### C. Loading State
When the user clicks "Create Account", the button text changes to "Creating Account..." and becomes disabled. This prevents double submissions and gives visual feedback that the system is processing.

---

## 5. Backend Integration

We chose **Option A/D (Node.js + Express + Supabase)** for a robust and scalable backend.

**How it Works:**
1.  **Route:** The frontend sends a `POST` request to `/api/auth/register`.
2.  **Controller:** The `authController.register` function handles the request.
3.  **Processing:**
    - It validates the inputs again (server-side validation).
    - It checks if the user already exists.
    - It hashes the password using `bcrypt` for security.
    - It saves the new user to the Supabase database.
4.  **Response:** It sends back a JSON response with the user data and an access token.

**Code Example (Backend Controller):**
```javascript
// backend/src/controllers/authController.js
const register = async (req, res) => {
  try {
    const { name, cmsId, role, email, password } = req.body;

    // Validate required fields
    if (!name || !cmsId || !role || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // ... (Validation logic) ...

    // Insert user into database
    const { data: newUser, error } = await supabaseAdmin
      .from('users_metadata')
      .insert([userData])
      .select()
      .single();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: newUser }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
```

---

## 6. Screenshots

### Sign Up Form
*[Insert Screenshot of the Sign Up form here]*

### Validation Errors
*[Insert Screenshot showing error messages when fields are empty]*

### Interaction Feature (Tooltip & Password Toggle)
*[Insert Screenshot showing the Tooltip and Password visibility toggle]*

### Backend Output (Postman/Console)
*[Insert Screenshot of the server console or Postman response showing successful registration]*

---

## 7. Tools and Technologies Used

-   **Frontend:** React, TypeScript, Tailwind CSS, Lucide React (Icons), React Hook Form, Zod (Validation).
-   **Backend:** Node.js, Express.js.
-   **Database:** Supabase (PostgreSQL).
-   **Tools:** VS Code, Postman (for API testing).

## 8. Group Contribution

-   **[Member Name 1]:** Designed the form layout and implemented the frontend components.
-   **[Member Name 2]:** Implemented the backend API routes and database integration.
-   **[Member Name 3]:** Added validation logic and interactive features (Tooltip, Password Toggle).
