import { Mail, Linkedin } from "lucide-react";

const ContactInfo = () => {
  return (
    <section
      id="contact-info"
      className="bg-[#1e40af] text-white relative py-[15px] md:py-[25px]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-block mb-3 px-3 py-1 bg-white text-[#1e40af] rounded-full text-sm font-medium">
            Get In Touch
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Contact Us Today
          </h2>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Have questions about our sports management solutions? Reach out to
            our team and let's discuss how we can help bring your ideas to life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ali's Contact Info */}
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <img
                src="/Ali.jpg"
                alt="Ali Haider"
                className="w-32 h-32 rounded-full mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-[#1e40af]">Ali Haider</h3>
              <p className="text-gray-600 mb-4">Founder</p>
              <div className="flex flex-col space-y-3">
                <a
                  href="mailto:aleeyhaider986@gmail.com"
                  className="flex items-center text-gray-700 hover:text-[#1e40af]"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  aleeyhaider986@gmail.com
                </a>
                <a
                  href="https://www.linkedin.com/in/ali-haider-123456789/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-[#1e40af]"
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  LinkedIn Profile
                </a>
              </div>
            </div>
          </div>

          {/* Ammer's Contact Info */}
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <img
                src="/Ammer.jpg"
                alt="Ammer Saeed"
                className="w-32 h-32 rounded-full mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-[#1e40af]">Ammer Saeed</h3>
              <p className="text-gray-600 mb-4">Founder</p>
              <div className="flex flex-col space-y-3">
                <a
                  href="mailto:ammer@sportivex.com"
                  className="flex items-center text-gray-700 hover:text-[#1e40af]"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  ammer@sportivex.com
                </a>
                <a
                  href="https://www.linkedin.com/in/ammer-saeed-123456789/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-[#1e40af]"
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
