import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service | ManyHandz",
  description: "ManyHandz Terms of Service agreement.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: January 1, 2025
        </p>

        <Separator className="my-8" />

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              By accessing or using the ManyHandz application ("Service"), you
              agree to be bound by these Terms of Service ("Terms"). If you do
              not agree to all of these Terms, you may not access or use the
              Service. These Terms apply to all visitors, users, and others who
              access or use the Service. By using the Service, you represent
              that you are at least 13 years of age, or if you are under 13,
              that you have obtained parental or guardian consent to use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              2. Description of Service
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ManyHandz is a household chore coordination and accountability
              platform. The Service allows users to create shared chore boards,
              assign and rotate tasks among household members, track task
              completion with photo verification, generate fairness scores, and
              engage in gamification features such as points, badges, and
              competitions. The Service is provided as a Progressive Web
              Application (PWA) accessible via web browsers on desktop and
              mobile devices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. User Accounts</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              To use certain features of the Service, you must create an
              account. You are responsible for maintaining the confidentiality
              of your account credentials and for all activities that occur
              under your account. You agree to provide accurate, current, and
              complete information during the registration process and to
              update such information to keep it accurate, current, and
              complete. You must notify us immediately of any unauthorized use
              of your account or any other breach of security. We will not be
              liable for any loss or damage arising from your failure to
              protect your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              4. Subscriptions & Payments
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ManyHandz offers a subscription-based service with a free trial
              period. After the trial period ends, continued access to the
              Service requires a paid subscription. Subscription fees are
              billed in advance on a monthly or annual basis, depending on the
              plan you select. You authorize us to charge your designated
              payment method for recurring subscription fees. Subscription
              renewals are automatic unless you cancel before the end of the
              current billing period. Refunds are handled in accordance with
              the refund policy outlined on our billing page. Prices are
              subject to change with 30 days advance notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. User Content</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              You retain ownership of all content you submit, post, or display
              through the Service, including but not limited to photos, text,
              chore descriptions, and profile information ("User Content"). By
              submitting User Content, you grant ManyHandz a non-exclusive,
              worldwide, royalty-free license to use, reproduce, modify, and
              display such content solely for the purpose of providing and
              improving the Service. You represent and warrant that you own or
              have the necessary rights to submit User Content and that such
              content does not violate any third-party rights or applicable
              laws. We reserve the right to remove User Content that violates
              these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Privacy</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your use of the Service is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your personal
              information. By using the Service, you consent to the collection
              and use of your information as described in the Privacy Policy.
              We are committed to protecting your data and comply with
              applicable data protection regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Intellectual Property
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The Service and its original content (excluding User Content),
              features, and functionality are and will remain the exclusive
              property of ManyHandz and its licensors. The Service is
              protected by copyright, trademark, and other laws. Our
              trademarks and trade dress may not be used in connection with any
              product or service without the prior written consent of
              ManyHandz. You may not copy, modify, distribute, sell, or lease
              any part of the Service or its content, nor may you reverse
              engineer or attempt to extract the source code of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Termination</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We may terminate or suspend your account and access to the
              Service immediately, without prior notice or liability, for any
              reason, including but not limited to a breach of these Terms.
              Upon termination, your right to use the Service will cease
              immediately. If you wish to terminate your account, you may do
              so by accessing your account settings or by contacting our
              support team. All provisions of these Terms which by their nature
              should survive termination shall survive, including ownership
              provisions, warranty disclaimers, indemnity, and limitations of
              liability. Your data will be retained for 30 days after account
              termination, after which it will be permanently deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              9. Limitation of Liability
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              In no event shall ManyHandz, its directors, employees, partners,
              agents, suppliers, or affiliates be liable for any indirect,
              incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from (i) your
              access to or use of or inability to access or use the Service;
              (ii) any conduct or content of any third party on the Service;
              (iii) any content obtained from the Service; and (iv)
              unauthorized access, use, or alteration of your transmissions or
              content, whether based on warranty, contract, tort (including
              negligence), or any other legal theory, whether or not we have
              been informed of the possibility of such damage. Our total
              liability shall not exceed the amount you have paid us in the
              twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We reserve the right to modify or replace these Terms at any
              time at our sole discretion. If a revision is material, we will
              provide at least 30 days notice prior to any new terms taking
              effect by posting a notice within the Service or sending an
              email to the address associated with your account. What
              constitutes a material change will be determined at our sole
              discretion. By continuing to access or use our Service after
              those revisions become effective, you agree to be bound by the
              revised terms. If you do not agree to the new terms, you must
              stop using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">11. Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If you have any questions about these Terms, please contact us
              at{" "}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_LEGAL_EMAIL || "legal@manyhandz.com"}`}
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {process.env.NEXT_PUBLIC_LEGAL_EMAIL || "legal@manyhandz.com"}
              </a>
              . We will make every effort to respond to your inquiry within a
              reasonable timeframe.
            </p>
          </section>
        </div>

        <Separator className="my-8" />

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
