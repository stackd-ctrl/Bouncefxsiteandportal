import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { LegalBody, LegalSection, LegalUpdated } from "@/components/LegalDoc";
import { DEFAULT_SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Bounce FX Party Rentals collects, uses, and protects your personal information.",
};

const UPDATED = "June 30, 2026";
const EMAIL = DEFAULT_SITE.email;
const PHONE = DEFAULT_SITE.phones[0];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Your privacy matters to us. This policy explains what we collect and why."
        color="bg-party-ink"
      />
      <LegalBody>
        <LegalUpdated date={UPDATED} />

        <p>
          Bounce FX Party Rentals (&ldquo;Bounce FX,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This
          Privacy Policy describes how we collect, use, and protect the
          information you provide when you visit our website, request a quote, or
          book a rental.
        </p>

        <LegalSection heading="Information we collect">
          <p>We collect information you give us directly, including:</p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              <strong>Contact details</strong> — your name, email address, and
              phone number.
            </li>
            <li>
              <strong>Event &amp; booking details</strong> — event date,
              delivery address, event type, item selections, and any special
              requests or notes you share with us.
            </li>
            <li>
              <strong>Payment information</strong> — when you pay a deposit or
              balance, your card details are entered directly into our payment
              processor (Stripe) and are <strong>never stored on our
              servers</strong>. We only receive confirmation that a payment
              succeeded and limited details such as the amount and a transaction
              reference.
            </li>
            <li>
              <strong>Communications</strong> — messages you send through our
              contact form, chat, or by email.
            </li>
          </ul>
          <p>
            We may also automatically collect basic technical information (such
            as your browser type and general usage data) to keep the site
            secure and working properly.
          </p>
        </LegalSection>

        <LegalSection heading="How we use your information">
          <ul className="list-disc space-y-1.5 pl-6">
            <li>To prepare quotes and fulfill your rental bookings.</li>
            <li>
              To deliver, set up, and pick up your rental items at the right
              place and time.
            </li>
            <li>
              To send booking confirmations, reminders, and service updates.
            </li>
            <li>To respond to your questions and provide customer support.</li>
            <li>
              To process payments and keep records required for our business.
            </li>
          </ul>
        </LegalSection>

        <LegalSection heading="How we share information">
          <p>
            We do <strong>not</strong> sell or rent your personal information.
            We share it only with trusted service providers who help us run our
            business, and only as needed to provide our services:
          </p>
          <ul className="list-disc space-y-1.5 pl-6">
            <li>
              <strong>Stripe</strong> — secure payment processing.
            </li>
            <li>
              <strong>Resend</strong> — sending transactional emails such as
              booking confirmations.
            </li>
            <li>
              <strong>Hosting &amp; infrastructure providers</strong> — to
              operate and store data for the website and booking system.
            </li>
          </ul>
          <p>
            We may also disclose information if required by law, or to protect
            the rights, property, or safety of our customers, our business, or
            others.
          </p>
        </LegalSection>

        <LegalSection heading="Data retention">
          <p>
            We keep booking and customer records for as long as needed to
            provide our services, maintain accurate business records, and comply
            with legal and tax obligations. You may request that we delete
            information we are not required to keep.
          </p>
        </LegalSection>

        <LegalSection heading="Your choices">
          <p>
            You may ask us to access, correct, or delete the personal
            information we hold about you, or ask us to stop sending you
            marketing messages, by contacting us using the details below. You
            can unsubscribe from non-essential emails at any time.
          </p>
        </LegalSection>

        <LegalSection heading="Children's privacy">
          <p>
            Our services are intended for adults booking party rentals. We do
            not knowingly collect personal information directly from children
            under 13.
          </p>
        </LegalSection>

        <LegalSection heading="Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the &ldquo;Last updated&rdquo; date at the top of this
            page.
          </p>
        </LegalSection>

        <LegalSection heading="Contact us">
          <p>
            Questions about this policy or your information? Reach us at{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="font-semibold text-party-red underline underline-offset-2"
            >
              {EMAIL}
            </a>{" "}
            or {PHONE}. Serving {DEFAULT_SITE.areaText}.
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
