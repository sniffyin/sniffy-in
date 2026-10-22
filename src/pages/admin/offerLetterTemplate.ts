/**
 * offerLetterTemplate.ts — Groomer "Offer Letter cum Employment Terms".
 *
 * Pure content, no I/O. The generated letter is snapshotted onto a
 * policy_acknowledgments row (kind = 'offer_letter') when the admin creates a
 * sign-link, so editing this template later never rewrites a letter someone
 * already read and signed.
 *
 * Paragraphs may contain **bold** spans; use `parseBold()` to render them
 * (web) or draw them (PDF). Amounts are written "Rs." on purpose — jsPDF's
 * built-in Helvetica has no ₹ glyph.
 *
 * Deliberately no post-probation salary figure: the letter only says the
 * salary "may be reviewed".
 */

import type { RolePolicySection } from './policyTypes';

export interface OfferLetterData {
  /** ISO yyyy-mm-dd — date printed on the letter. */
  letter_date:    string;
  /** ISO yyyy-mm-dd — employment start date. */
  effective_date: string;
  /** Paragraphs between "Dear …" and section 1. */
  preamble:       string[];
}

export const OFFER_LETTER_TITLE = 'OFFER LETTER CUM EMPLOYMENT TERMS';

const PROBATION_MONTHS_WORD = 'three (3)';
const PROBATION_SALARY      = 'Rs. 35,000/- (Rupees Thirty Five Thousand Only)';

/** yyyy-mm-dd → dd-mm-yyyy (the format Sniffy letters use). */
export function fmtLetterDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : iso;
}

export function parseBold(text: string): { text: string; bold: boolean }[] {
  return text
    .split('**')
    .map((t, i) => ({ text: t, bold: i % 2 === 1 }))
    .filter(s => s.text.length > 0);
}

export function buildOfferLetterContent(opts: {
  employeeName:  string;
  letterDate:    string;
  effectiveDate: string;
}): { title: string; data: OfferLetterData; sections: RolePolicySection[] } {
  const { employeeName, letterDate, effectiveDate } = opts;
  const eff = fmtLetterDate(effectiveDate);

  const preamble = [
    `We are pleased to offer you employment with **Sniffy Pet Partners** as a **Pet Groomer** with effect from **${eff}**, subject to the terms and conditions stated in this letter.`,
    'Your role will involve providing professional pet grooming services at customer locations, maintaining service quality, ensuring pet safety, and representing the company in a disciplined and professional manner.',
  ];

  const sections: RolePolicySection[] = [
    { heading: '1. Salary & Compensation', items: [
      `During the first ${PROBATION_MONTHS_WORD} months’ probation period, you will receive a fixed monthly salary of **${PROBATION_SALARY}**.`,
      'Upon successful completion of probation, and subject to satisfactory performance, attendance, punctuality, customer feedback, and overall conduct, your salary may be reviewed based on merit and business requirements.',
      'Salary processing for each month shall be calculated based on attendance, leaves, incentives, deductions, and approved records up to the **25th day** of that month. Salary shall ordinarily be credited within the **first week of the following month**. Any adjustments after the **25th** may be carried forward to the next salary cycle.',
    ]},
    { heading: '2. Working Schedule & Performance Expectations', items: [
      'Your working schedule shall be **six days per week** with one weekly off day as assigned by management. Daily appointments and duty timings may vary depending on customer bookings and route planning.',
      'You are expected to complete a minimum target of **24 grooming sessions per week** (without helper support), and a minimum of **36 grooming sessions per week** with helper support. Sessions completed beyond target may qualify for incentive benefits as decided by management from time to time.',
      'An on-time attendance **bonus of Rs. 25 per session** may be paid where delay does not exceed 15 minutes. A performance **incentive of Rs. 25** may be paid for every genuine customer rating received, irrespective of the star rating given.',
      'Where a customer upgrades from one service package to a higher package through your recommendation, 10% of the additional upgraded value may be paid as incentive.',
    ]},
    { heading: '3. Travel & Cancellation Policy', items: [
      'Where travel distance between appointments exceeds 15 kilometres, petrol reimbursement at Rs. 5 per kilometre may be paid, subject to prior approval and submission of screenshot/map proof.',
      'If a customer cancels an appointment after booking allocation, such session shall not count as completed. However, an amount of Rs. 50 may be paid towards travel compensation where applicable in such cancellations.',
      'No compensation shall be payable where cancellation is caused by the groomer’s delay, refusal, negligence, misconduct, or failure to report.',
    ]},
    { heading: '4. Leave, Holidays & Attendance', items: [
      'You shall be entitled to eight (8) paid holidays in a calendar year. For employees based in Pune, the standard holiday list may include: Republic Day (26 January), Chhatrapati Shivaji Maharaj Jayanti (19 February), Guddi Padwa, Maharashtra Day (1 May), Independence Day (15 August), Ganesh Chaturthi, Diwali (Main Day), and Christmas (25 December).',
      'If operational requirements require you to work on an official holiday, the company may provide one extra day salary or compensatory off, as decided by management.',
      'In addition, one paid leave per completed month may be credited, subject to approval and company policy. Planned leave should preferably be applied for at least one week in advance. Emergency leave must be informed immediately.',
      'Repeated late attendance or irregular reporting may affect incentives and performance review.',
    ]},
    { heading: '5. Probation & Confirmation', items: [
      `Your first ${PROBATION_MONTHS_WORD} months of employment shall be treated as probation. During this period, your performance, service quality, discipline, punctuality, attendance, and customer feedback shall be reviewed.`,
      'Unauthorized leave during probation may be treated as Loss of Pay. Upon satisfactory completion of probation, your employment may be confirmed in writing.',
    ]},
    { heading: '6. Duties & Professional Conduct', items: [
      'You are expected to maintain polite and respectful behaviour with all customers, report to appointments on time, wear company uniform/ID if provided, maintain personal hygiene, and uphold the reputation of Sniffy Pet Partners.',
      'Any rude behaviour, arguments, abusive language, misrepresentation, or unprofessional conduct shall be treated seriously.',
    ]},
    { heading: '7. Pet Safety, Hygiene & Company Property', items: [
      'Pet safety shall remain your highest priority at all times. Pets must be handled patiently and safely. Where required, safety tools such as muzzle, gloves, or collar must be used. Any injury, emergency, or aggressive pet situation must be reported immediately to the coordinator.',
      'You must keep tools clean and sanitized before and after each service and leave the customer premises neat after work completion.',
      'The company may provide consumables such as shampoo, wipes, ear cleanser, deworming products, spot-on items, and other materials. These must be properly used and stock responsibly maintained.',
      'Any company tools, equipment, or stock lost or damaged due to negligence may be recovered from salary as per applicable law.',
    ]},
    { heading: '8. Payments, Confidentiality & Restrictions', items: [
      'You shall not privately negotiate rates with customers or collect unauthorized payments. All payments must be made through official company channels.',
      'You shall not directly accept private/offline bookings from company customers during employment.',
      'All customer information including address, phone number, pet details, and company pricing/data must remain confidential.',
    ]},
    { heading: '9. Termination', items: [
      'During probation, either party may terminate employment by giving 15 days’ notice. After confirmation, 30 days’ notice or salary in lieu thereof may apply.',
      'The company reserves the right to terminate employment immediately in cases of serious misconduct, theft, fraud, animal abuse, repeated negligence, or breach of trust.',
    ]},
    { heading: '10. Grooming Kit & Equipment Responsibility', items: [
      'Sniffy Pet Partners shall provide you with a grooming kit and necessary equipment (“Kit”) required to perform your duties. The Kit remains the property of the company at all times. You shall be fully responsible for the safe custody, maintenance, and proper use of the Kit issued to you.',
      'In the event of loss, theft, damage, or misuse of the Kit or any part thereof due to negligence or carelessness on your part, the cost of repair or replacement shall be deducted from your salary. The deduction may be made in one or more instalments as deemed appropriate by the company, subject to applicable law.',
      'Upon resignation, termination, or end of employment for any reason, the Kit must be returned to the company in good working condition. Failure to return the Kit or returning it in a damaged/incomplete state shall result in salary recovery or legal action as applicable.',
    ]},
    { heading: '11. Acceptance', items: [
      `I, ${employeeName}, hereby accept this offer of employment and confirm that I have read, understood, and agree to abide by all the terms and conditions stated in this letter. I agree to comply with all company policies, rules, regulations, and code of conduct as applicable now or as may be introduced from time to time.`,
      'I further acknowledge that any dispute, claim, or legal proceeding arising out of or in connection with this employment, including but not limited to matters related to salary, termination, conduct, or breach of terms, shall be subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra, India. Both parties agree to submit to such jurisdiction and waive any objection to the venue or jurisdiction of such courts.',
      'Please sign below as confirmation of your acceptance of this offer and all terms contained herein.',
    ]},
  ];

  return {
    title: OFFER_LETTER_TITLE,
    data: { letter_date: letterDate, effective_date: effectiveDate, preamble },
    sections,
  };
}
