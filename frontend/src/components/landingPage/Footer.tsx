import { ArrowRight, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!email) {
    // //   toast({
    // //     title: "Error",
    // //     description: "Please enter your email address.",
    // //     variant: "destructive",
    // //   });
    //   return;
    // }

    // setIsSubmitting(true);

    // try {
    //   // EmailJS configuration
    //   const EMAILJS_SERVICE_ID = "service_i3h66xg";
    //   const EMAILJS_TEMPLATE_ID = "template_fgq53nh";
    //   const EMAILJS_PUBLIC_KEY = "wQmcZvoOqTAhGnRZ3";

    //   const templateParams = {
    //     from_name: "Website Subscriber",
    //     from_email: email,
    //     message: `New subscription request from the website footer.`,
    //     to_name: "WRLDS Team",
    //     reply_to: email,
    //   };

    //   await emailjs.send(
    //     EMAILJS_SERVICE_ID,
    //     EMAILJS_TEMPLATE_ID,
    //     templateParams,
    //     EMAILJS_PUBLIC_KEY
    //   );

    //   toast({
    //     title: "Success!",
    //     description: "Thank you for subscribing to our newsletter.",
    //     variant: "default",
    //   });

    //   setEmail("");
    // } catch (error) {
    //   console.error("Error sending subscription:", error);

    //   toast({
    //     title: "Error",
    //     description: "There was a problem subscribing. Please try again later.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <footer id="contact" className="bg-[#1e40af] text-white pt-16 pb-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 pb-10 border-b border-blue-300">
          <div className="lg:col-span-2">
            <img
              src="/lovable-uploads/7d120ee6-3614-4b75-9c35-716d54490d67.png"
              alt="Sportivex Logo"
              className="h-10 w-auto mb-6 invert" // Added invert to make logo white
            />
            <p className="text-gray-200 mb-6">
              Sportivex is your comprehensive sports management platform.
              We combine modern technology, user-friendly design, and
              comprehensive features to bring your sports facility management to the next level.
            </p>
            <p className="text-gray-200 mb-6">
              NUST University
              <br />
              Islamabad, Pakistan
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/sportivex/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white transition-colors hover:bg-white/30 hover:text-white"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Get in Touch</h3>
            <form className="space-y-4" onSubmit={handleSubscribe}>
              <div>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-white text-[#1e40af] rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Sportivex. All rights
            reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/privacy-policy"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
