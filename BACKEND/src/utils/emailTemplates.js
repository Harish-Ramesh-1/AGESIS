export function buildOtpEmailHtml(code) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agesis International School - Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 20px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#0f4c81; color:#ffffff; text-align:center; padding:30px;">
              <h1 style="margin:0; font-size:28px;">Agesis International School</h1>
              <p style="margin:8px 0 0; font-size:15px;">
                Secure Login Verification
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px; color:#333333;">

              <h2 style="margin-top:0;">Your One-Time Password (OTP)</h2>

              <p style="font-size:16px; line-height:1.7;">
                We received a request to sign in to your
                <strong>Agesis International School</strong> account.
              </p>

              <p style="font-size:16px;">
                Please use the verification code below:
              </p>

              <!-- OTP Box -->
              <div style="
                margin:30px 0;
                padding:18px;
                background:#f1f5fb;
                border:2px dashed #0f4c81;
                border-radius:10px;
                text-align:center;
                font-size:36px;
                font-weight:bold;
                letter-spacing:8px;
                color:#0f4c81;">
                ${code}
              </div>

              <p style="font-size:15px; line-height:1.7;">
                This OTP is valid for a limited time and can only be used once.
                Do not share this code with anyone.
              </p>

              <p style="font-size:15px; line-height:1.7;">
                If you did not request this login, you can safely ignore this email.
              </p>

              <hr style="border:none; border-top:1px solid #e6e6e6; margin:30px 0;">

              <p style="font-size:13px; color:#777777;">
                This is an automated email from
                <strong>Agesis International School</strong>. Please do not reply.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8; text-align:center; padding:20px; font-size:12px; color:#888888;">
              © 2026 Agesis International School. All Rights Reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
}
