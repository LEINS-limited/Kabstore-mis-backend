export const headerHTML = `<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <title>Kabstore</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8f9fa;
      line-height: 1.6;
      color: #1a1a1a;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background-color: #ffffff;
    }
    .header {
      padding: 32px 40px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 32px 40px;
    }
    .content p {
      margin-bottom: 16px;
      font-size: 15px;
      color: #4b5563;
    }
    .content p:last-child {
      margin-bottom: 0;
    }
    .code-box {
      display: inline-block;
      padding: 12px 20px;
      margin: 8px 0;
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: 0.05em;
    }
    .button {
      display: inline-block;
      margin: 16px 0 8px;
      padding: 12px 24px;
      background-color: #1a1a1a;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
    }
    .button:hover {
      background-color: #2d2d2d;
      color: #ffffff !important;
    }
    .footer {
      padding: 24px 40px 32px;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
      color: #9ca3af;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h1>Kabstore</h1>`;

export const footerHTML = `    </div>
    <div class='footer'>
      <p>Kabstore - Your priority</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
