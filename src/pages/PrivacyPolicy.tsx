import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const PrivacyPolicy = () => {
  const { language, translate } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-green-700 dark:text-green-400">
        {translate("Privacy Policy")}
      </h1>
      
      <div className="prose prose-green dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("1. Information We Collect")}</h2>
          <p className="mb-4">
            {translate("We collect information you provide directly to us when using our services, including:")}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>{translate("Personal information such as your name, age, city, CNIC, email, and phone number")}</li>
            <li>{translate("Your idea submission, including title, description, and video")}</li>
            <li>{translate("Any additional information you choose to provide through our platform")}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("2. How We Use Your Information")}</h2>
          <p className="mb-4">
            {translate("We use the information we collect to:")}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>{translate("Evaluate your idea submission for the DLM program")}</li>
            <li>{translate("Communicate with you about your application status")}</li>
            <li>{translate("Verify your identity and eligibility to participate")}</li>
            <li>{translate("Improve our services and user experience")}</li>
            <li>{translate("Comply with legal obligations")}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("3. Information Sharing and Disclosure")}</h2>
          <p className="mb-4">
            {translate("We do not sell, trade, or rent your personal information to third parties. We may share your information with:")}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>{translate("Our panel of expert judges who evaluate submissions")}</li>
            <li>{translate("Trusted service providers who assist us in operating our platform")}</li>
            <li>{translate("Legal authorities when required by law or to protect our rights")}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("4. Data Security")}</h2>
          <p className="mb-4">
            {translate("We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("5. Your Rights")}</h2>
          <p className="mb-4">
            {translate("You have the right to:")}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>{translate("Access and update your personal information")}</li>
            <li>{translate("Request deletion of your personal information")}</li>
            <li>{translate("Opt-out of certain communications")}</li>
            <li>{translate("Withdraw your consent where processing is based on consent")}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("6. Data Retention")}</h2>
          <p className="mb-4">
            {translate("We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("7. Cookies and Tracking Technologies")}</h2>
          <p className="mb-4">
            {translate("We may use cookies and similar tracking technologies to enhance your experience on our website. You can control cookie settings through your browser preferences.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("8. Children's Privacy")}</h2>
          <p className="mb-4">
            {translate("Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("9. Changes to This Privacy Policy")}</h2>
          <p className="mb-4">
            {translate("We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last Updated\" date.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("10. Contact Us")}</h2>
          <p className="mb-4">
            {translate("If you have any questions about this Privacy Policy, please contact us at:")}
          </p>
          <p className="mb-4">
            {translate("Email: privacy@daslakhmission.com")}
          </p>
        </section>

        <section className="mb-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {translate("Last Updated: October 7, 2025")}
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;