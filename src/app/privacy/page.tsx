import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy | ManyHandz",
  description: "ManyHandz Privacy Policy.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: January 1, 2025
        </p>

        <Separator className="my-8" />

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold">
              1. Information We Collect
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We collect information you provide directly to us when you create
              an account, including your name, email address, and profile
              photo. When you use the Service, we collect information about
              your chore completions, photos uploaded as proof of task
              completion, household membership data, and preferences. We also
              automatically collect certain technical information when you
              access the Service, including your device type, browser type,
              operating system, IP address, and usage patterns such as pages
              visited and features used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              2. How We Use Information
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We use the information we collect to provide, maintain, and
              improve the Service, including to process chore assignments,
              calculate fairness scores, deliver push notifications, and power
              gamification features. We use your email address to send
              transactional communications such as account verification,
              password resets, and subscription receipts. We may also use
              aggregated, anonymized data to analyze usage trends and improve
              the Service. We use AI-based image analysis to verify task
              completions from uploaded photos; however, these photos are only
              processed for verification purposes and are not used to train AI
              models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Data Storage</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your data is stored securely on servers provided by our
              infrastructure partners. All data is encrypted in transit using
              TLS 1.2 or higher and encrypted at rest using AES-256
              encryption. Photos uploaded as proof of chore completion are
              stored in secure cloud storage with access restricted to
              members of the relevant household. We retain your account data
              for as long as your account is active. Upon account deletion,
              your personal data is purged within 30 days, though anonymized
              aggregated data may be retained for analytical purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Data Sharing</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with trusted service
              providers who assist us in operating the Service, such as
              payment processors, cloud hosting providers, and email delivery
              services. These providers are contractually obligated to protect
              your data and may only use it for the specific services they
              provide to us. We may also disclose your information if required
              by law, regulation, legal process, or governmental request, or
              when we believe disclosure is necessary to protect our rights,
              your safety, or the safety of others.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Cookies</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ManyHandz uses cookies and similar technologies to maintain your
              session, remember your preferences, and understand how you
              interact with the Service. Essential cookies are required for the
              Service to function properly, including authentication and
              security cookies. We may use analytics cookies to collect
              aggregated usage data to help us improve the Service. You can
              control cookie preferences through your browser settings,
              although disabling essential cookies may affect the
              functionality of the Service. We do not use cookies for
              third-party advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Your Rights</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              You have the right to access, correct, update, or delete your
              personal information at any time through your account settings.
              You may export your data in CSV or JSON format from the Settings
              page. You have the right to opt out of non-essential
              communications by updating your notification preferences. If you
              are located in the European Economic Area (EEA), you have
              additional rights under the General Data Protection Regulation
              (GDPR), including the right to data portability, the right to
              restrict processing, and the right to object to processing. To
              exercise any of these rights, please contact us at the email
              address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              7. Children&apos;s Privacy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              ManyHandz is designed to be used by households that may include
              children under the age of 13. However, accounts for children
              under 13 must be created and managed by a parent or legal
              guardian. We do not knowingly collect personal information from
              children under 13 without parental consent. If we learn that we
              have collected personal information from a child under 13
              without parental consent, we will take steps to delete that
              information as quickly as possible. Parents or guardians may
              contact us to review, modify, or delete their child&apos;s
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              8. Changes to This Policy
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new Privacy
              Policy within the Service and updating the "Last updated" date
              at the top of this page. For significant changes, we will also
              send an email notification to the address associated with your
              account. We encourage you to review this Privacy Policy
              periodically to stay informed about how we are protecting your
              information. Your continued use of the Service after changes are
              posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us at{" "}
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@manyhandz.com"}`}
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                {process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "privacy@manyhandz.com"}
              </a>
              . We will respond to your inquiry within 30 days. For
              GDPR-related requests, you may also contact our Data Protection
              Officer at the same address.
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
