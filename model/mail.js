await sendEmail(
    data.ContactEmail,
    "Your Billing Details Have Been Successfully Added!",
    `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Billing Details Added</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #dddddd;
          }
          .email-header {
            background-color: #4CAF50;
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
          }
          .email-body {
            padding: 20px;
            color: #333333;
          }
          .email-body h2 {
            color: #4CAF50;
            font-size: 20px;
          }
          .email-footer {
            text-align: center;
            background-color: #f1f1f1;
            padding: 10px;
            font-size: 14px;
            color: #555555;
          }
          .email-footer a {
            color: #4CAF50;
            text-decoration: none;
          }
          .cta-button {
            display: inline-block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #45a049;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="email-header">
            <h1>Billing Details Added Successfully!</h1>
          </div>
  
          <!-- Body -->
          <div class="email-body">
            <h2>Dear ${data.ContactName || "Valued Customer"},</h2>
            <p>
              We’re excited to let you know that your billing details have been successfully added to our system.
            </p>
            <p>
              <strong>Your Unique Billing ID:</strong> <span style="color: #4CAF50;">${
                data.BillingId
              }</span>
            </p>
            <p>
              Having your billing details up-to-date ensures a seamless and efficient experience with our services.
            </p>
            <p>
              If you have any questions or need further assistance, please don’t hesitate to reach out to our support team. 
            </p>
            
          </div>
  
          <!-- Footer -->
          <div class="email-footer">
            <p>
              Thank you for choosing our services!<br>
              <strong>The JPS Team</strong>
            </p>
            <p>
              Need help? <a href="mailto:mitmangukiya192@gmail.com">Contact Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  );


   await sendEmail(
        data.ContactEmail,
        "Your Billing Details Have Been Successfully Added!",
        `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Billing Details</title>
              <style>
                body {
                  font-family: 'Arial', sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                  color: #333333;
                }
                .email-container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border-radius: 10px;
                  border: 2px solid rgb(23, 22, 22);
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                }
                .email-header {
                  background-color:rgb(172, 130, 80);
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
                  border-bottom: 3px solid #0056b3;
                }
                .email-header h1 {
                  margin: 0;
                  font-size: 24px;
                }
                .email-body {
                  padding: 20px;
                }
                .email-body h2 {
                  font-size: 20px;
                  color:rgb(172, 130, 80);
                }
                .email-body p {
                  line-height: 1.6;
                  font-size: 16px;
                }
                .email-body ul {
                  list-style: none;
                  padding: 0;
                }
                .email-body ul li {
                  background-color: #f9f9f9;
                  margin: 10px 0;
                  padding: 10px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                  color: #333;
                }
                .total-amount {
                  text-align: center;
                  margin: 20px 0;
                  font-size: 18px;
                  font-weight: bold;
                  color: #333;
                }
                .cta {
                  text-align: center;
                  margin: 30px 0;
                }
                .cta a {
                  background-color: #007BFF;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 10px 20px;
                  border-radius: 5px;
                  font-size: 16px;
                  transition: background-color 0.3s ease;
                }
                .cta a:hover {
                  background-color: #0056b3;
                }
                .email-footer {
                  background-color: #f1f1f1;
                  text-align: center;
                  padding: 15px;
                  font-size: 14px;
                  color: #777777;
                  border-top: 1px solid #ddd;
                }
                .email-footer a {
                  color: #007BFF;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <!-- Header -->
                <div class="email-header">
                  <h1>Your Billing Details</h1>
                </div>
                
                <!-- Body -->
                <div class="email-body">
                  <h2>Hello ${data.FirstName || "Customer"} ${
          data.LastName || ""
        },</h2>
  
                  <p>Thank you for choosing our services. Here are the details of your recent billing:</p>
        
                  <ul>
                    ${billingEntries
                      .map(
                        (item) => `
                        <li>
                          <strong>${item.Carats} Carat ${
                          item.Shape
                        } Diamond</strong><br>
                          Color: ${item.Color}, Clarity: ${item.Clarity}, Lab: ${
                          item.Lab
                        }, Cut: ${item.Cut}<br>
                          Quantity: ${item.Quantity} x $${item.Price.toFixed(
                          2
                        )}<br>
                          <strong>Total: $${item.Amount.toFixed(2)}</strong>
                        </li>
                      `
                      )
                      .join("")}
                  </ul>
        
                  <div class="total-amount">
                    Total Amount: <span>$${billingEntries
                      .reduce((acc, item) => acc + item.Amount, 0)
                      .toFixed(2)}</span>
                  </div>
        
                </div>
        
                <!-- Footer -->
                <div class="email-footer">
                  <p>Need help? <a href="mailto:mitmangukiya192@gmail.com">Contact Support</a></p>
                  <p>Thank you for choosing our services!<br><strong>JPS Jwelers</strong></p>
                </div>
              </div>
            </body>
            </html>
          `
      );