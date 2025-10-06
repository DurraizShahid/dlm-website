import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const TermsOfService = () => {
  const { language, translate } = useLanguage();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-green-700 dark:text-green-400">
        {translate("Terms of Service")}
      </h1>
      
      <div className="prose prose-green dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("1. Acceptance of Terms")}</h2>
          <p className="mb-4">
            {translate("By accessing or using the Das Lakh Mission (\"DLM\") website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our website or services.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("2. Description of Service")}</h2>
          <p className="mb-4">
            {translate("DLM provides a platform for individuals in Pakistan to submit innovative ideas for a chance to win funding of up to 10 Lakh Rupees. Our service includes idea submission, community voting, expert evaluation, and winner selection.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("3. User Eligibility")}</h2>
          <p className="mb-4">
            {translate("To participate in DLM, you must be at least 18 years old and a resident of Pakistan. By using our services, you represent and warrant that you meet these requirements.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("4. User Responsibilities")}</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>{translate("Provide accurate and complete information when submitting your idea")}</li>
            <li>{translate("Maintain the confidentiality of your account and password")}</li>
            <li>{translate("Notify us immediately of any unauthorized use of your account")}</li>
            <li>{translate("Do not submit ideas that are illegal, harmful, or infringe on others' rights")}</li>
            <li>{translate("Respect other users and participate in a respectful manner")}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("5. Intellectual Property")}</h2>
          <p className="mb-4">
            {translate("You retain all rights to your submitted ideas. By submitting to DLM, you grant us a non-exclusive, royalty-free license to use, display, and promote your idea for the purposes of evaluation, selection, and marketing related to the DLM program.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("6. Idea Submission")}</h2>
          <p className="mb-4">
            {translate("DLM does not claim ownership of any ideas submitted through our platform. However, we reserve the right to evaluate, modify, reject, or remove any submissions that violate these terms or are deemed inappropriate.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("7. Selection Process")}</h2>
          <p className="mb-4">
            {translate("The selection of winners is at the sole discretion of DLM and our panel of experts. All decisions are final and binding. No correspondence will be entered into regarding the selection process.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("8. Limitation of Liability")}</h2>
          <p className="mb-4">
            {translate("DLM shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services, including but not limited to loss of data, loss of profits, or business interruption.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("9. Modifications to Terms")}</h2>
          <p className="mb-4">
            {translate("We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any modifications constitutes acceptance of those changes.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("10. Governing Law")}</h2>
          <p className="mb-4">
            {translate("These Terms of Service shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.")}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{translate("11. Contact Information")}</h2>
          <p className="mb-4">
            {translate("If you have any questions about these Terms of Service, please contact us at:")}
          </p>
          <p className="mb-4">
            {translate("Email: contact@daslakhmission.com")}
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

export default TermsOfService;