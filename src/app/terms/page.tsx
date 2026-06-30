import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { LegalBody, LegalSection, LegalUpdated } from "@/components/LegalDoc";
import { DEFAULT_SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that apply when you book inflatables, tents, tables, and chairs from Bounce FX Party Rentals.",
};

const UPDATED = "June 30, 2026";
const EMAIL = DEFAULT_SITE.email;
const PHONE = DEFAULT_SITE.phones[0];

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The agreement between you and Bounce FX when you rent from us."
        color="bg-party-ink"
      />
      <LegalBody>
        <LegalUpdated date={UPDATED} />

        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
          Bounce FX Party Rentals website and your rental of our equipment. By
          booking a rental or using this site, you agree to these Terms.
        </p>

        <LegalSection heading="Our rentals">
          <p>
            Bounce FX Party Rentals provides inflatables, tents, tables, chairs,
            and related party equipment for rent, including delivery, setup, and
            pickup, throughout {DEFAULT_SITE.areaText}.
          </p>
        </LegalSection>

        <LegalSection heading="Booking & deposits">
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              A flat <strong>$50 deposit</strong> is required to reserve your
              date and items. You may also choose to pay in full or a custom
              partial amount at checkout.
            </li>
            <li>
              The remaining balance is due on the day of your event unless paid
              earlier.
            </li>
            <li>
              A booking is confirmed once your deposit is received and you
              receive a confirmation from us. Availability is not guaranteed
              until then.
            </li>
          </ul>
        </LegalSection>

        <LegalSection heading="Rental & Safety Agreement">
          <p>
            All rentals are also subject to our{" "}
            <a
              href="/rental-agreement.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-party-red underline underline-offset-2"
            >
              Rental &amp; Safety Agreement
            </a>
            , which you review and sign as part of booking. That agreement
            covers safe operation, supervision requirements, and assumption of
            risk, and is incorporated into these Terms by reference. If anything
            in the signed agreement conflicts with these Terms, the signed
            agreement controls for that rental.
          </p>
        </LegalSection>

        <LegalSection heading="Delivery & service area">
          <p>
            We deliver throughout the DMV. Delivery is included within our local
            radius; for locations beyond 15 miles, an additional mileage fee of
            $2.00 per mile applies. We will confirm any delivery fee with you
            before your booking is finalized. Please ensure clear access to the
            setup area and that someone 18 or older is present at delivery and
            pickup.
          </p>
        </LegalSection>

        <LegalSection heading="Your responsibilities">
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              Provide a safe, flat, and clear setup space, and accurate
              information about your location and surface (grass, concrete,
              etc.).
            </li>
            <li>
              Ensure access to a standard power outlet within range of
              inflatables, or arrange a generator with us in advance.
            </li>
            <li>
              Provide responsible adult supervision of inflatables and
              equipment at all times during use.
            </li>
            <li>
              Follow all safety rules in the Rental &amp; Safety Agreement and
              any instructions our team provides at setup.
            </li>
            <li>
              Return equipment in the same condition as delivered. You are
              responsible for loss or damage beyond normal wear that occurs
              while the equipment is in your care.
            </li>
          </ul>
        </LegalSection>

        <LegalSection heading="Weather & cancellations">
          <p>
            For everyone&rsquo;s safety, inflatables cannot be operated in high
            winds, heavy rain, or other unsafe conditions. If weather makes
            setup or operation unsafe, we will work with you to reschedule or
            discuss options. Cancellation and rescheduling details are described
            in your Rental &amp; Safety Agreement and confirmation. Please
            contact us as early as possible if your plans change.
          </p>
        </LegalSection>

        <LegalSection heading="Payments">
          <p>
            Payments are processed securely through Stripe. By providing payment
            information, you authorize us to charge the deposit and any agreed
            balance or fees for your rental.
          </p>
        </LegalSection>

        <LegalSection heading="Assumption of risk & liability">
          <p>
            Use of inflatables and party equipment involves inherent risks. By
            renting from us, you and your guests assume those risks as described
            in the Rental &amp; Safety Agreement. To the fullest extent
            permitted by law, Bounce FX Party Rentals is not liable for injury,
            loss, or damage arising from misuse, failure to supervise, or
            failure to follow the provided safety rules.
          </p>
        </LegalSection>

        <LegalSection heading="Intellectual property">
          <p>
            All content on this site — including text, logos, and images — is
            the property of Bounce FX Party Rentals or used with permission and
            may not be copied or reused without our consent.
          </p>
        </LegalSection>

        <LegalSection heading="Governing law">
          <p>
            These Terms are governed by the laws of the Commonwealth of
            Virginia, without regard to its conflict-of-laws rules.
          </p>
        </LegalSection>

        <LegalSection heading="Changes to these Terms">
          <p>
            We may update these Terms from time to time. The &ldquo;Last
            updated&rdquo; date above reflects the most recent version.
          </p>
        </LegalSection>

        <LegalSection heading="Contact us">
          <p>
            Questions about these Terms? Reach us at{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="font-semibold text-party-red underline underline-offset-2"
            >
              {EMAIL}
            </a>{" "}
            or {PHONE}.
          </p>
          <p className="pt-2">
            <Link
              href="/documents"
              className="font-semibold text-party-red underline underline-offset-2"
            >
              &larr; Back to all documents
            </Link>
          </p>
        </LegalSection>
      </LegalBody>
    </>
  );
}
