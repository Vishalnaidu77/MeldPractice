import express from "express";
import channel from "./service/mq.js";
import { sendEmail } from "./service/email.js";

const app = express();

app.get("/_status/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/_status/readyz", (req, res) => {
  res.status(200).json({ status: "ready" });
});

channel.consume('notification_queue', async (message) => {
    if(message !== null) {
        const notificationData = JSON.parse(message.content.toString());
        console.log("Received notification data:", notificationData);

        try {
            const { userId, displayName, email, action, timestamp } = notificationData;

            const to = email;
            const subject = `Notification: ${action}`;
            const text = `Hello ${displayName},\n\nYou have a new notification regarding: ${action} at ${timestamp}.\n\nBest regards,\nYour Team`;
            const html = `<p>Hello <strong>${displayName}</strong>,</p><p>You have a new notification regarding: <strong>${action}</strong> at <em>${timestamp}</em>.</p><p>Best regards,<br>Your Team</p>`;

            await sendEmail(to, subject, text, html);
            channel.ack(message);
        } catch (err) {
            console.error("Error processing notification data:", err);
        }
    }
})

export default app;