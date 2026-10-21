# Supabase email templates (Oonava branded)

Paste each file into **Supabase → Authentication → Emails → Templates**:

| File | Supabase template | Subject line |
|---|---|---|
| `1-reset-password.html` | Reset password | Reset your Oonava password |
| `2-invite-user.html` | Invite user | You're invited to the Oonava team |
| `3-confirm-signup.html` | Confirm signup | Confirm your Oonava email |
| `4-magic-link.html` | Magic link | Your Oonava sign-in link |
| `5-change-email.html` | Change email address | Confirm your new Oonava email |

The reset template links straight to `https://oonava.com/admin/reset` with a one-time token, so it never depends on the Site URL setting.
