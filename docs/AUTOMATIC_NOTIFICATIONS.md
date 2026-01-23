# How to Setup Automated Notifications (Journeys)

Now that your app code is updated, you can make notifications send **automatically** from the OneSignal Dashboard without you doing anything!

## 1. Automatic "Welcome" Message
When someone clicks "Allow", you can send them a message immediately.
1.  Go to **OneSignal Dashboard** -> **Messages** -> **Journeys**.
2.  Click **New Journey**.
3.  Name it: "Welcome New Students".
4.  **Trigger**: Select "User joined".
5.  **Step 1**: Add a "Send Push" step.
6.  Type your message: "Welcome to GenSpark! 🚀 Ready to code today?"
7.  Click **Publish**.

## 2. "We Miss You" Reminders (After 24 hours)
Send a message if they haven't learned in a while.
1.  Add a **Wait** step after the Welcome message (set it to 24 hours).
2.  Add a **Send Push** step: "Don't break your streak! Spend 5 minutes on Python today."

## 3. Congratulations on Lesson Mastery
In the code, I added a "Tag" called `lesson_mastered`. You can use this!
1.  Create a **New Journey**.
2.  **Trigger**: Select "User Tag Changed".
3.  Choose Key: `lesson_mastered`.
4.  **Step 1**: Send Push: "Awesome job! You just mastered a new topic. Next lesson is waiting! 🏆"

## 4. How the Code Works
- When a user allows notifications, the app automatically adds a tag: `app_role: student`.
- When a user finishes a lesson, the app adds a tag: `lesson_mastered: [lesson_id]`.

By using these **Tags**, you can create very smart automations that run while you sleep!
