# Data Model: AI-Native Book Platform

This document defines the core data entities for the platform.

---

### 1. User

Represents a user account in the system.

- **`id`**: `UUID` (Primary Key) - Unique identifier for the user.
- **`email`**: `String` (Unique, Not Null) - User's email address, used for login.
- **`hashed_password`**: `String` (Not Null) - The user's password, hashed for security.
- **`created_at`**: `DateTime` - Timestamp of when the account was created.
- **`updated_at`**: `DateTime` - Timestamp of the last update to the account.

**Relationships**:
- Has one `UserProfile`.

---

### 2. UserProfile

Stores the user's survey responses and preferences for content personalization.

- **`id`**: `UUID` (Primary Key) - Unique identifier for the profile.
- **`user_id`**: `UUID` (Foreign Key to `User.id`) - Links the profile to a user.
- **`experience_level`**: `String` (Enum: "Beginner", "Intermediate", "Expert") - User's self-reported programming experience.
- **`learning_goal`**: `String` - A brief description of what the user wants to learn.
- **`preferred_language`**: `String` - The user's preferred language for the UI (future use).

**Relationships**:
- Belongs to one `User`.

---

### 3. Chapter

Represents a single chapter of the AI-generated book. The content is stored as Markdown.

- **`id`**: `UUID` (Primary Key) - Unique identifier for the chapter.
- **`title`**: `String` (Not Null) - The title of the chapter.
- **`chapter_number`**: `Integer` (Not Null) - The order of the chapter in the book.
- **`base_content_md`**: `Text` (Not Null) - The core, non-personalized Markdown content for the chapter.
- **`generated_at`**: `DateTime` - Timestamp of when the chapter was generated.

---

### 4. Plan (Conceptual)

Represents a sequence of executable steps for an AI agent. This model is based on the user-provided code snippets and represents a core concept for how the AI will be managed.

- **`id`**: `String` (Primary Key) - Unique identifier for the plan.
- **`name`**: `String` (Not Null) - A human-readable name for the plan.
- **`steps`**: `JSON/Array` - An ordered list of steps, where each step defines an action for the agent.
  - **`step.name`**: `String` - Name of the step.
  - **`step.prompt`**: `String` - The prompt or instruction for the agent.
  - **`step.status`**: `String` (Enum: "Pending", "InProgress", "Completed", "Failed") - The current status of the step.
- **`created_at`**: `DateTime` - Timestamp of when the plan was created.
- **`owner_id`**: `UUID` (Foreign Key to `User.id`) - The user who owns/created this plan.
