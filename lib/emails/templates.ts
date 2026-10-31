import "server-only";

import type { AlumniRegistration } from "@/lib/types";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://alumni.sbssu.ac.in");

/**
 * 1. Email template sent upon completing free alumni directory registration
 */
export function getRegistrationEmailTemplate(
  registration: AlumniRegistration,
): {
  subject: string;
  html: string;
  text: string;
} {
  const paymentLink = `${APP_URL}/payment/${registration.id}`;
  const profileLink = `${APP_URL}/sanjh-2026/pass/${registration.id}`;

  const subject = `Welcome to SBSSU Alumni Association – Registration Confirmed (${registration.regNumber})`;

  const text = `Dear ${registration.fullName},

Welcome to the Shaheed Bhagat Singh State University Alumni Association!

Your registration has been successfully recorded in the university directory.
- Registration ID: ${registration.regNumber}
- Batch: Class of ${registration.passingYear} (${registration.era} Era)
- Degree & Branch: ${registration.degree} – ${registration.branch}

1ST ALUMNI MEET & SANJH 2026:
We invite you to attend the 1st Alumni Meet & Sanjh 2026 Annual Cultural Function on November 14, 2026, at 5:00 PM at the SBSSU campus in Ferozepur.

If you plan to attend in person, please acquire your official Alumni Meet Event Pass (₹1,000) via UPI QR:
${paymentLink}

View your alumni record anytime:
${profileLink}

Warm regards,
Shaheed Bhagat Singh State University Alumni Association
Ferozepur, Punjab | alumni.sbssu.ac.in
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #fed7aa; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #d97706 50%, #059669 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffedd5; margin-bottom: 8px;">
                Shaheed Bhagat Singh State University
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; line-height: 1.3;">
                Welcome to the Alumni Network!
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #ffedd5;">
                SBSCET (1995) • SBSSTC (2011) • SBSSU (2021)
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="font-size: 15px; margin: 0 0 16px; color: #18181b;">
                Dear <strong>${registration.fullName}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 20px;">
                Congratulations! Your registration in the official <strong>Shaheed Bhagat Singh State University Alumni Directory</strong> is complete. Your details have been permanently recorded so your alma mater can celebrate your journey and achievements.
              </p>

              <!-- Registration Credentials Card -->
              <table role="presentation" width="100%" style="background-color: #fff7ed; border: 1px solid #fdba74; border-radius: 14px; margin-bottom: 24px; padding: 18px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c2410c; font-weight: 700;">
                      Official Alumni Registration
                    </div>
                    <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #9a3412; margin: 4px 0 12px;">
                      ${registration.regNumber}
                    </div>
                    <table role="presentation" width="100%" style="font-size: 12px; color: #431407;">
                      <tr>
                        <td style="padding: 3px 0; color: #9a3412;">Program:</td>
                        <td style="padding: 3px 0; font-weight: 600; text-align: right;">${registration.degree} – ${registration.branch}</td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; color: #9a3412;">Graduation Batch:</td>
                        <td style="padding: 3px 0; font-weight: 600; text-align: right;">Class of ${registration.passingYear} (${registration.era})</td>
                      </tr>
                      ${
                        registration.currentDesignation
                          ? `
                      <tr>
                        <td style="padding: 3px 0; color: #9a3412;">Designation:</td>
                        <td style="padding: 3px 0; font-weight: 600; text-align: right;">${registration.currentDesignation} ${registration.organization ? `at ${registration.organization}` : ""}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 3px 0; color: #9a3412;">Registration Type:</td>
                        <td style="padding: 3px 0; font-weight: 700; color: #ea580c; text-align: right;">${registration.attendingMeet !== false ? "Register + Attend Meet" : "Directory Record Only (Free)"}</td>
                      </tr>
                      ${
                        registration.guests && registration.guests.length > 0
                          ? `
                      <tr>
                        <td style="padding: 3px 0; color: #9a3412;">Accompanying Family (${registration.guests.length}):</td>
                        <td style="padding: 3px 0; font-weight: 600; text-align: right;">${registration.guests.map((g) => `${g.name} (${g.relation})`).join(", ")}</td>
                      </tr>`
                          : ""
                      }
                      <tr>
                        <td style="padding: 3px 0; color: #9a3412;">Registration Fee:</td>
                        <td style="padding: 3px 0; font-weight: 700; color: #059669; text-align: right;">FREE (₹0 Paid)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Event Invitation -->
              <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 6px; font-size: 15px; font-weight: 800; color: #14532d;">
                  Join Us for the 1st Alumni Meet & Sanjh 2026!
                </h3>
                <p style="margin: 0 0 12px; font-size: 13px; line-height: 1.5; color: #166534;">
                  📅 <strong>Saturday, November 14, 2026 at 5:00 PM</strong><br>
                  📍 <strong>Main University Auditorium & Campus Lawns, SBSSU Ferozepur</strong>
                </p>
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #15803d;">
                  Visiting campus for the celebration requires an <strong>Event Pass (₹1,000)</strong>, which covers high tea, souvenir kit, grand gala dinner, and unlocks eligibility to apply to perform on stage!
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${paymentLink}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 28px; border-radius: 12px; box-shadow: 0 3px 8px rgba(234,88,12,0.3);">
                      Get Alumni Meet Pass (₹1,000 via UPI) →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; text-align: center; color: #71717a; margin: 0;">
                You can also <a href="${profileLink}" style="color: #ea580c; text-decoration: underline;">view your alumni profile card</a> anytime.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; border-top: 1px solid #e4e4e7; padding: 20px 28px; text-align: center; font-size: 11px; color: #71717a; line-height: 1.5;">
              <strong>Shaheed Bhagat Singh State University</strong><br>
              (Formerly SBSCET / SBSSTC) • Ferozepur – Moga Road, Ferozepur, Punjab 152004<br>
              Official Alumni Portal: <a href="https://alumni.sbssu.ac.in" style="color: #ea580c; text-decoration: none;">alumni.sbssu.ac.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

/**
 * 2. Email template sent when user submits UPI payment details (under review)
 */
export function getPaymentSubmittedEmailTemplate(
  registration: AlumniRegistration,
): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Payment Details Received for Sanjh 2026 Pass (${registration.regNumber})`;

  const text = `Dear ${registration.fullName},

We have received your payment submission for the Sanjh 2026 Alumni Meet Pass:
- Registration Number: ${registration.regNumber}
- Transaction ID: ${registration.txnId || registration.paymentDetails?.transactionId || "N/A"}
- Payment Mode: UPI QR (₹1,000)
- Status: Under Administrative Verification

Our university admin team will review your payment screenshot and Transaction ID. Once verified, you will receive an email containing your official digital Event Pass.

View your registration status:
${APP_URL}/sanjh-2026/pass/${registration.id}

Shaheed Bhagat Singh State University Alumni Association
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b;">
  <table role="presentation" width="100%" style="background-color: #fafafa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #fde68a; overflow: hidden;">
          <tr>
            <td style="background-color: #d97706; padding: 28px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 900;">Payment Verification in Progress</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #fef3c7;">Sanjh 2026 Event Pass • SBSSU Ferozepur</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px;">
              <p style="font-size: 14px; margin: 0 0 16px;">Dear <strong>${registration.fullName}</strong>,</p>
              <p style="font-size: 13px; line-height: 1.6; color: #52525b; margin: 0 0 20px;">
                Thank you for submitting your payment for the <strong>Sanjh 2026 Alumni Meet Event Pass (₹1,000)</strong>. Your submission is currently being verified by the university finance committee.
              </p>
              <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
                <div style="margin-bottom: 6px;"><strong>Registration ID:</strong> ${registration.regNumber}</div>
                <div style="margin-bottom: 6px;"><strong>Transaction ID:</strong> <span style="font-family: monospace; font-weight: 700;">${registration.txnId || registration.paymentDetails?.transactionId || "N/A"}</span></div>
                <div style="margin-bottom: 6px;"><strong>Payment Method:</strong> UPI QR (₹1,000)</div>
                <div><strong>Status:</strong> <span style="color: #b45309; font-weight: 700;">⏳ Pending Admin Verification</span></div>
              </div>
              <p style="font-size: 13px; line-height: 1.6; color: #52525b; margin: 0 0 20px;">
                Once an administrator verifies the screenshot and transaction ID, your official pass will be activated and sent to you via email.
              </p>
              <div style="text-align: center;">
                <a href="${APP_URL}/sanjh-2026/pass/${registration.id}" style="display: inline-block; background-color: #d97706; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 10px;">
                  Check Pass Status Online →
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}

/**
 * 3. Email template sent upon payment verification / pass issuance (contains full HTML Event Pass)
 */
export function getPassIssuedEmailTemplate(
  registration: AlumniRegistration,
  isComplimentary = false,
): {
  subject: string;
  html: string;
  text: string;
} {
  const passLink = `${APP_URL}/sanjh-2026/pass/${registration.id}`;
  const subject = `Official Event Pass Confirmed: Sanjh 2026 – SBSSU Alumni Meet (${registration.regNumber})`;

  const text = `Dear ${registration.fullName},

Congratulations! Your payment for the Sanjh 2026 Alumni Meet Event Pass has been VERIFIED.

OFFICIAL EVENT PASS:
- Pass ID: ${registration.regNumber}
- Alumnus: ${registration.fullName}
- Batch: Class of ${registration.passingYear} (${registration.era} Era)
- Program: ${registration.degree} – ${registration.branch}
- Transaction ID: ${registration.txnId || registration.paymentDetails?.transactionId || "Verified"}
- Status: Active Verified Pass (₹1,000)
${registration.guests && registration.guests.length > 0 ? `- Accompanying Family Guests (${registration.guests.length}): ${registration.guests.map((g) => `${g.name} (${g.relation})`).join(", ")}\n` : ""}- Attendance Mode: ${registration.attendanceType || "In-Person"}

EVENT DETAILS:
- Event: 1st Alumni Meet & Sanjh 2026 Annual Cultural Function
- Date: Saturday, November 14, 2026
- Time: 5:00 PM (Sharp)
- Venue: Main University Auditorium & Campus Lawns, SBSSU Ferozepur

INCLUDES:
- Reserved Auditorium Seating
- High Tea & Welcome Alumni Kit
- Grand Alumni Gala Dinner
- Cultural Stage Access (Eligible to apply to perform on stage)

View and print your digital barcode pass online:
${passLink}

We look forward to welcoming you home to SBSSU!

Shaheed Bhagat Singh State University Alumni Association
Ferozepur, Punjab | alumni.sbssu.ac.in
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafafa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Pass Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; border: 2px solid #ea580c; overflow: hidden; box-shadow: 0 8px 24px rgba(234,88,12,0.12);">
          <!-- Top Pass Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ea580c 0%, #d97706 50%, #059669 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffedd5; margin-bottom: 6px;">
                Official Gate Entry Pass • alumni.sbssu.ac.in
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; line-height: 1.2;">
                Sanjh 2026 – 1st Alumni Meet
              </h1>
              <p style="margin: 6px 0 14px; font-size: 13px; color: #ffedd5;">
                Shaheed Bhagat Singh State University, Ferozepur
              </p>
              <div style="display: inline-block; background-color: rgba(255,255,255,0.2); backdrop-filter: blur(8px); padding: 6px 16px; rounded: 9999px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 1px;">
                ${isComplimentary ? "✓ COMPLIMENTARY PASS" : "✓ VERIFIED ACTIVE PASS (₹1,000)"}
              </div>
            </td>
          </tr>

          <!-- Perforated Divider Visual in Email -->
          <tr>
            <td style="background-color: #ffffff; padding: 0 16px;">
              <div style="border-bottom: 2px dashed #fed7aa; height: 1px; margin: 12px 0;"></div>
            </td>
          </tr>

          <!-- Pass Details -->
          <tr>
            <td style="padding: 24px 28px;">
              <!-- Attendee Info -->
              <table role="presentation" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td style="vertical-align: top;">
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #a1a1aa;">
                      Attendee Name
                    </div>
                    <div style="font-size: 22px; font-weight: 900; color: #18181b; margin-top: 2px;">
                      ${registration.fullName}
                    </div>
                    <div style="font-size: 12px; color: #71717a; margin-top: 2px;">
                      ${registration.email} • ${registration.phone}
                    </div>
                  </td>
                  <td style="vertical-align: top; text-align: right;">
                    <div style="font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #a1a1aa;">
                      Pass / Reg Number
                    </div>
                    <div style="font-size: 16px; font-weight: 900; font-family: monospace; color: #ea580c; margin-top: 2px;">
                      ${registration.regNumber}
                    </div>
                    <div style="font-size: 11px; color: #059669; font-weight: 700; margin-top: 2px;">
                      Gate Entry Unlocked
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Academic Profile Card -->
              <table role="presentation" width="100%" style="background-color: #fdfbf7; border: 1px solid #fed7aa; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; font-size: 12px;">
                <tr>
                  <td style="color: #71717a; padding: 3px 0;">Degree & Branch:</td>
                  <td style="font-weight: 700; color: #18181b; text-align: right; padding: 3px 0;">${registration.degree} – ${registration.branch}</td>
                </tr>
                <tr>
                  <td style="color: #71717a; padding: 3px 0;">Batch & Alma Mater Era:</td>
                  <td style="font-weight: 700; color: #ea580c; text-align: right; padding: 3px 0;">Class of ${registration.passingYear} (${registration.era})</td>
                </tr>
                ${
                  registration.currentDesignation
                    ? `
                <tr>
                  <td style="color: #71717a; padding: 3px 0;">Professional Designation:</td>
                  <td style="font-weight: 600; color: #18181b; text-align: right; padding: 3px 0;">${registration.currentDesignation} ${registration.organization ? `@ ${registration.organization}` : ""}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="color: #71717a; padding: 3px 0;">Transaction ID (UPI):</td>
                  <td style="font-family: monospace; font-weight: 700; color: #18181b; text-align: right; padding: 3px 0;">${registration.txnId || registration.paymentDetails?.transactionId || "VERIFIED"}</td>
                </tr>
                ${
                  registration.guests && registration.guests.length > 0
                    ? `
                <tr>
                  <td style="color: #71717a; padding: 3px 0;">Accompanying Family Guests:</td>
                  <td style="font-weight: 700; color: #ea580c; text-align: right; padding: 3px 0;">${registration.guests.map((g) => `${g.name} (${g.relation})`).join(", ")}</td>
                </tr>`
                    : ""
                }
              </table>

              <!-- Event Schedule Badge -->
              <table role="presentation" width="100%" style="background-color: #fff7ed; border: 1px solid #fdba74; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
                <tr>
                  <td style="text-align: center; width: 33.3%; border-right: 1px solid #fed7aa;">
                    <div style="font-size: 10px; color: #9a3412; font-weight: 700; text-transform: uppercase;">Date</div>
                    <div style="font-size: 13px; font-weight: 800; color: #431407; margin-top: 2px;">Nov 14, 2026</div>
                  </td>
                  <td style="text-align: center; width: 33.3%; border-right: 1px solid #fed7aa;">
                    <div style="font-size: 10px; color: #9a3412; font-weight: 700; text-transform: uppercase;">Reporting Time</div>
                    <div style="font-size: 13px; font-weight: 800; color: #431407; margin-top: 2px;">5:00 PM Sharp</div>
                  </td>
                  <td style="text-align: center; width: 33.3%;">
                    <div style="font-size: 10px; color: #9a3412; font-weight: 700; text-transform: uppercase;">Venue</div>
                    <div style="font-size: 13px; font-weight: 800; color: #431407; margin-top: 2px;">Auditorium</div>
                  </td>
                </tr>
              </table>

              <!-- Pass Benefits -->
              <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; color: #14532d; line-height: 1.6;">
                <strong style="display: block; margin-bottom: 4px; font-size: 13px;">Pass Entitlements Included:</strong>
                • Admission badge and reserved seating in Main University Auditorium<br>
                • High Tea, Souvenir Kit, and Grand Gala Dinner<br>
                • Eligible to apply to perform on stage during the Sanjh 2026 Cultural Function<br>
                • Official Participation Certificate for performers
              </div>

              ${
                registration.performerStatus === "approved"
                  ? `
              <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: #ffffff; border-radius: 14px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #a7f3d0;">
                  ★ APPROVED STAGE PERFORMER
                </div>
                <div style="font-size: 15px; font-weight: 900; margin-top: 4px;">
                  ${registration.performanceApplication?.title || "Cultural Act"} (${registration.performanceApplication?.category || "Stage Performance"})
                </div>
                <div style="font-size: 12px; color: #ecfdf5; margin-top: 4px;">
                  Please report to the SECA Stage Coordinator at 4:30 PM for sound check.
                </div>
              </div>`
                  : ""
              }

              <!-- Print / View Pass Online Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center">
                    <a href="${passLink}" style="display: inline-block; background-color: #ea580c; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 10px rgba(234,88,12,0.3);">
                      Open & Print Digital Pass Online →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 11px; text-align: center; color: #71717a; margin: 0;">
                Present this email or the online barcode at the campus registration counter for check-in.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; border-top: 1px solid #e4e4e7; padding: 18px 28px; text-align: center; font-size: 11px; color: #71717a; line-height: 1.5;">
              Shaheed Bhagat Singh State University Alumni Association<br>
              Ferozepur – Moga Road, Ferozepur, Punjab 152004 • <a href="https://alumni.sbssu.ac.in" style="color: #ea580c; text-decoration: none;">alumni.sbssu.ac.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}
