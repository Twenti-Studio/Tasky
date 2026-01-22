import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Tasky — Terms of Service",
  description: "Read our terms of service regarding account usage and payments.",
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen text-gray-800">
      <div className="bg-[#042C71] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-blue-200 hover:text-white text-sm font-medium inline-block">
              &larr; Back to Home
            </Link>
            {/* <div className="bg-white p-1.5 rounded-lg shadow-md">
              <Image 
                src="/tasky-logo.png" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="rounded-md"
              />
            </div> */}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-blue">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">1. One Account Rule</h2>
          <p className="mb-4">
            To ensure fair play, we strictly enforce a &quot;One Account Per User&quot; rule. Users found creating multiple accounts will be banned permanently. Automated bots and scripts are strictly prohibited.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">2. Prohibited Activities</h2>
          <p className="mb-4">
            The use of VPNs, proxies, location-spoofing software, or any other method to mask your real identity or location is strictly prohibited. Violation of this policy will result in immediate account termination.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">3. Withdrawals and Payments</h2>
          <p className="mb-4">
            All withdrawal requests are subject to a manual review process. This review typically takes between 1 to 7 business days. We reserve the right to withhold payment if any suspicious activity is detected.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">4. Changes to Terms</h2>
          <p>
            Twenti Studio reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  );
}
