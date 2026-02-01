import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Mita — Privacy Policy",
  description: "Read our privacy policy regarding data collection and security.",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-blue">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">1. Data Collection</h2>
          <p className="mb-4">
            Twenti Rewards collects information to provide a secure and efficient service. We collect email addresses for our waitlist and communication purposes. Additionally, we collect IP addresses to prevent fraud and ensure the integrity of our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">2. Data Sharing</h2>
          <p className="mb-4">
            We value your privacy. Your data may be shared anonymously with trusted third-party providers solely for the purpose of improving our services and offering relevant rewards. We do not sell your personal identifiable information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">3. Data Security</h2>
          <p className="mb-4">
            We employ industry-standard encryption and security protocols to protect your data from unauthorized access, alteration, or destruction. Your trust is our top priority.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#042C71] mb-4">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at twentistudio@gmail.com.
          </p>
        </section>
      </div>
    </div>
  );
}
