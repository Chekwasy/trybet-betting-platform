import 'dotenv/config';
import Queue from 'bull/lib/queue.js';
import nodemailer from 'nodemailer';


//pass: 'ucblaybosshvkvwt'
//dobhplzccqrsxfco

const isDateInPast = (dateString) => {
  const dateParts = dateString.match(/(\d{2})(\d{2})(\d{4})/);
  if (!dateParts) return false;

  const day = parseInt(dateParts[1]);
  const month = parseInt(dateParts[2]) - 1; // Months are 0-based
  const year = parseInt(dateParts[3]);

  const inputDate = new Date(year, month, day);
  const currentDate = new Date();

  return inputDate.getTime() < currentDate.getTime();
};


const secretKey = process.env.MSK || '';

const transporter = nodemailer.createTransport({
    host: 'workplace.truehost.cloud',
    port: 587, // or 465
    secure: false, // true for 465, false for 587
    auth: {
        user: 'info@trybet.com.ng',
        pass: secretKey,
    },
    // logger: true,
    // debug: true,
    // tls: {
    // // set to false only if you have certificate issues; prefer leaving it default
    // rejectUnauthorized: true
    // }
});



//creating new queue with same queue name as in route file
const tokenQueue = new Queue('Send Trybet Token');


//job to send user token for password reset
tokenQueue.process(async (job, done) => {
	const email = job.data.email;
	const token = job.data.token;

	if (!email || !token) {
		throw new Error("Missing email or token");
	}
	console.log('Processing', email);
    if (secretKey === '') {
		throw new Error("Missing key");
	}

	//Data of email to be sent
	let mailOptions = {
		from: 'info@trybet.com.ng',
		to: email,
		subject: 'One Time Token (OTP) - TryBet',
		html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your TryBet One-Time Token (OTP)</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid #e0e0e0;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #1a73e8; /* A professional blue, or your brand's primary color */
            font-size: 28px;
            margin: 0;
        }
        .content {
            text-align: center;
            margin-bottom: 20px;
        }
        .content h2 {
            color: #333333;
            font-size: 22px;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .otp-code {
            display: inline-block;
            background-color: #e6f3ff; /* Light blue background for OTP */
            color: #1a73e8;
            font-size: 32px;
            font-weight: bold;
            padding: 15px 25px;
            border-radius: 8px;
            letter-spacing: 3px;
            margin: 25px 0;
            border: 1px dashed #a3d4ff;
        }
        .instructions {
            text-align: left;
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #1a73e8;
            border-radius: 4px;
        }
        .instructions p {
            margin: 5px 0;
            font-size: 15px;
            color: #555555;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
            font-size: 12px;
            color: #888888;
        }
        .footer p {
            margin: 5px 0;
        }
        .button {
            display: inline-block;
            background-color: #1a73e8;
            color: #ffffff !important; /* !important to override mail client styles */
            padding: 12px 25px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
        }
        .small-text {
            font-size: 0.85em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TryBet</h1>
            <p class="small-text">Bet with confidence</p>
        </div>
        <div class="content">
            <h2>Your One-Time Password (OTP)</h2>
            <p>Please use the following code to complete your action:</p>
            <div class="otp-code">${token.token}</div>
            <p>For your security, this token is essential for verifying your request.</p>

            <div class="instructions">
                <p><strong>Important Information:</strong></p>
                <ul>
                    <li>This token will expire in **10 minutes**.</li>
                    <li>For security, this token will expire in **5 minutes** after your second attempt.</li>
                    <li>This token will become invalid after **4 incorrect attempts**.</li>
                    <li>Please do not share this code with anyone. TryBet will never ask for this code over the phone or email.</li>
                </ul>
            </div>

            <p style="margin-top: 25px;">If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TryBet. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>`
	}
	let mailOptions2 = {
		                from: 'info@trybet.com.ng',
				to: 'richardchekwas@gmail.com',
		                subject: 'Problem Email',
		                html: `<div>
		                <h2>Problem email ${email},</h2>
		                <h2>TryBet</h2>
		                </div>`
		        }
	transporter.sendMail(mailOptions, (err, info) => {
		if(err) {
			console.log(err);
			transporter.sendMail(mailOptions2, (er, info2) => {
				if(er) {
					console.log(err);} else {
					console.log(info2.response);
					}
			});
		} else {
			console.log(info.response);
 		}
	});
	done();
});


//creating new queue with same queue name as in route file
const notifyQueue = new Queue('Notify');

//job to send users notifications
notifyQueue.process(async (job, done) => {
	const option = job.data.option;
	const time = job.data.time;
    const Sbal = job.data.Sbal;
    const stake = job.data.stake;
    const odd = job.data.odd;
    const Ebal = job.data.Ebal;
    const status = job.data.status;
    const code = job.data.code;
    const usr = job.data.usr;

	if (!option || !time || !Sbal  || !stake || !odd  || !Ebal  || !status || !code || !usr) {
		throw new Error("Missing information");
	}
    if (secretKey === '') {
		throw new Error("Missing key");
	}

    const len = usr.length;
    for (let i = 0; i < len; i++) {
        const email = usr[i].email;
        const subs = usr[i].sub;
        const chk = isDateInPast(subs.slice(-8));
        
        if (!chk && subs.slice(0, 4) !== 'free') {
            //Data of email to be sent
            console.log(`notify email: ${email}`);
            let mailOptions = {
                'Content-Type': 'text/html',
                from: 'info@trybet.com.ng',
                to: email,
                subject: `Event Update for ${option} - TryBet`,
                html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bet Details Slip</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', sans-serif; background-color: #f1f5f9; margin: 0; padding: 0;">

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="min-height: 100vh; padding: 1rem;">
        <tr>
            <td align="center" style="padding: 1rem;">
                <!-- Main Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 28rem; width: 100%; background-color: #ffffff; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                    <tr>
                        <td align="center">
                            <!-- Header Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-image: linear-gradient(to right, #059669, #047857); background-color: #047857; color: #fff; padding: 2.5rem; text-align: center; border-radius: 1.5rem 1.5rem 0 0;">
                                <tr>
                                    <td style="padding: 2.5rem; border-radius: 1.5rem 1.5rem 0 0;">
                                        <h1 style="font-size: 2.25rem; font-weight: 800; letter-spacing: -0.025em; margin: 0;">Trybet</h1>
                                        <p style="margin-top: 0.5rem; font-size: 0.875rem; opacity: 0.8;">Confirmation and details of your recent bet.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center">
                            <!-- Content Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding: 1.5rem;">
                                <tr>
                                    <td style="padding: 1.5rem;">
                                        <p style="text-align: center; font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; color: #1a202c;">Your bet is **${status}**.</p>
                                        
                                        <!-- Details Card -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);">
                                            <tr>
                                                <td style="padding: 1.5rem;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <!-- Detail Item: Option -->
                                                        <tr>
                                                            <td style="padding: 0.75rem; border-radius: 0.5rem; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1rem;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 1.25rem; height: 1.25rem; color: #9ca3af; padding-right: 0.75rem; vertical-align: middle;">
                                                                            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;">
                                                                                <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 9.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414l2-2a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                                                            </svg>
                                                                        </td>
                                                                        <td style="font-size: 0.875rem; font-weight: 500; color: #4b5563; vertical-align: middle;">Option:   </td>
                                                                        <td style="font-weight: 700; color: #1a202c; font-size: 1rem; text-align: right; vertical-align: middle;">${option}</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr><td height="1rem" style="font-size: 1rem; line-height: 1rem;">&nbsp;</td></tr>

                                                        <!-- Detail Item: Time -->
                                                        <tr>
                                                            <td style="padding: 0.75rem; border-radius: 0.5rem; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1rem;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 1.25rem; height: 1.25rem; color: #9ca3af; padding-right: 0.75rem; vertical-align: middle;">
                                                                            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;">
                                                                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clip-rule="evenodd"></path>
                                                                            </svg>
                                                                        </td>
                                                                        <td style="font-size: 0.875rem; font-weight: 500; color: #4b5563; vertical-align: middle;">Time:    </td>
                                                                        <td style="font-weight: 700; color: #1a202c; font-size: 1rem; text-align: right; vertical-align: middle;">${time}</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr><td height="1rem" style="font-size: 1rem; line-height: 1rem;">&nbsp;</td></tr>

                                                        <!-- Detail Item: Starting Balance -->
                                                        <tr>
                                                            <td style="padding: 0.75rem; border-radius: 0.5rem; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1rem;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 1.25rem; height: 1.25rem; color: #9ca3af; padding-right: 0.75rem; vertical-align: middle;">
                                                                            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;">
                                                                                <path d="M4 4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4z"></path>
                                                                            </svg>
                                                                        </td>
                                                                        <td style="font-size: 0.875rem; font-weight: 500; color: #4b5563; vertical-align: middle;">Starting Balance:    </td>
                                                                        <td style="font-weight: 700; color: #1a202c; font-size: 1rem; text-align: right; vertical-align: middle;">₦${Sbal}</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr><td height="1rem" style="font-size: 1rem; line-height: 1rem;">&nbsp;</td></tr>

                                                        <!-- Detail Item: Stake -->
                                                        <tr>
                                                            <td style="padding: 0.75rem; border-radius: 0.5rem; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1rem;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 1.25rem; height: 1.25rem; color: #9ca3af; padding-right: 0.75rem; vertical-align: middle;">
                                                                            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;">
                                                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                                                                                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
                                                                            </svg>
                                                                        </td>
                                                                        <td style="font-size: 0.875rem; font-weight: 500; color: #4b5563; vertical-align: middle;">Stake:    </td>
                                                                        <td style="font-weight: 700; color: #1a202c; font-size: 1rem; text-align: right; vertical-align: middle;">₦${stake}</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr><td height="1rem" style="font-size: 1rem; line-height: 1rem;">&nbsp;</td></tr>
                                                        
                                                        <!-- Detail Item: Odd -->
                                                        <tr>
                                                            <td style="padding: 0.75rem; border-radius: 0.5rem; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1rem;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 1.25rem; height: 1.25rem; color: #9ca3af; padding-right: 0.75rem; vertical-align: middle;">
                                                                            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;">
                                                                                <path d="M11 6a3 3 0 11-6 0 3 3 0 016 0zM14 17a6 6 0 00-12 0h12zM13 16a6 6 0 01-12 0h12zM17 10a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                                            </svg>
                                                                        </td>
                                                                        <td style="font-size: 0.875rem; font-weight: 500; color: #4b5563; vertical-align: middle;">Odd:    </td>
                                                                        <td style="font-weight: 700; color: #1a202c; font-size: 1rem; text-align: right; vertical-align: middle;">${odd}</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr><td height="1rem" style="font-size: 1rem; line-height: 1rem;">&nbsp;</td></tr>

                                                        <!-- Detail Item: Expected Balance -->
                                                        <tr>
                                                            <td style="padding: 0.75rem; border-radius: 0.5rem; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1rem;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 1.25rem; height: 1.25rem; color: #9ca3af; padding-right: 0.75rem; vertical-align: middle;">
                                                                            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;">
                                                                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 100 2h4a1 1 0 100-2H8z"></path>
                                                                            </svg>
                                                                        </td>
                                                                        <td style="font-size: 0.875rem; font-weight: 500; color: #4b5563; vertical-align: middle;">Expected Balance:    </td>
                                                                        <td style="font-weight: 700; color: #1a202c; font-size: 1rem; text-align: right; vertical-align: middle;">₦${Ebal}</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <!-- Detail Item: Code -->
                                                        <tr>
                                                            <td style="padding: 0.75rem; border-radius: 0.5rem; background-color: #ffffff; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); margin-bottom: 1rem;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="width: 1.25rem; height: 1.25rem; color: #9ca3af; padding-right: 0.75rem; vertical-align: middle;">
                                                                            <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style="width: 1.25rem; height: 1.25rem; vertical-align: middle;">
                                                                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9a1 1 0 100 2h4a1 1 0 100-2H8z"></path>
                                                                            </svg>
                                                                        </td>
                                                                        <td style="font-size: 0.875rem; font-weight: 500; color: #4b5563; vertical-align: middle;">SportyBet Code:    </td>
                                                                        <td style="font-weight: 700; color: #1a202c; font-size: 1rem; text-align: right; vertical-align: middle;">${code}</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center">
                            <!-- Footer Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e2e8f0; padding: 1.5rem; text-align: center; font-size: 0.75rem; color: #64748b; border-radius: 0 0 1.5rem 1.5rem;">
                                <tr>
                                    <td style="padding: 1.5rem; text-align: center;">
                                        <p style="margin: 0;">Thank you for choosing Trybet. Good luck with your bets!</p>
                                        <div style="margin-top: 1rem; text-align: center;">
                                            <a href="#" style="color: #059669; text-decoration: none; font-weight: 500;">trybet.com.ng</a>
                                            <span style="color: #cbd5e1; margin: 0 0.5rem;">|</span>
                                            <a href="mailto:info@trybet.com.ng" style="color: #059669; text-decoration: none; font-weight: 500;">info@trybet.com.ng</a>
                                        </div>
                                        <p style="margin-top: 0.5rem; color: #94a3b8; margin-bottom: 0;">&copy; 2025 TryBet. All rights reserved.</p>
                                        <p style="color: #94a3b8; margin-top: 0.5rem; margin-bottom: 0;">This is an automated message.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`


                }
            let mailOptions2 = {
                from: 'info@trybet.com.ng',
                to: 'richardchekwas@gmail.com',
                subject: 'Problem Email',
                html: `<div>
                    <h2>Problem email ${email},</h2>
                    <h2>TryBet</h2>
                    </div>`
            }
            transporter.sendMail(mailOptions, (err, info) => {
                if(err) {
                    console.log(err);
                    transporter.sendMail(mailOptions2, (er, info2) => {
                        if(er) {
                            console.log(err);} else {
                            console.log(info2.response);
                            }
                    });
                } else {
                    console.log(info.response);
                }
            });
        }
    }
	    done();

});
