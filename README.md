# haithao-wedding

Wedding invitation (Minimalism Đỏ Đậm) - plain HTML/CSS/JS with an admin page.

    node server.js          # PORT=3000, ADMIN_PASSWORD=...  (default password: admin123)

- Invitation: `/`  (add `?open=1` to skip the envelope)
- Admin: `/admin/` - edit text, images, album, timeline, gift QR, music. Saved to `data/content.json`.
- Defaults live in `content.json`.
