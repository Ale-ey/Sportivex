import React from "react";
import { Button } from "../../../components/ui/button";
import { MessageCircle, Users } from "lucide-react";

const AiChatTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="h-[calc(100vh-9rem)] rounded-lg overflow-hidden shadow-lg">
        <div
          className="h-full p-6 flex flex-col"
          style={{
            background:
              "linear-gradient(180deg, #023E8A 0%, #0077B6 50%, #00B4D8 100%)",
          }}
        >
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-white">AI Assistant</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* Assistant message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white/90" />
              </div>
              <div className="max-w-2xl bg-white/8 border border-white/6 rounded-lg p-4 text-white text-sm shadow-sm">
                <p>
                  Hello! I can help with training plans, technique tips, or
                  nutrition. What would you like to discuss today?
                </p>
              </div>
            </div>

            {/* User reply */}
            <div className="flex items-start justify-end space-x-3">
              <div className="max-w-2xl bg-white/12 rounded-lg p-3 text-white text-sm shadow-sm text-right">
                <p>Where are some good places to get pad thai in Toronto?</p>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white/90" />
              </div>
            </div>

            {/* Assistant long reply */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white/90" />
              </div>
              <div className="max-w-3xl bg-white/8 border border-white/6 rounded-lg p-4 text-white text-sm shadow-sm">
                <ol className="list-decimal ml-5 space-y-2">
                  <li>
                    Pai Northern Thai Kitchen - authentic northern Thai flavors.
                  </li>
                  <li>
                    Sabai Sabai Kitchen and Bar - traditional Thai dishes.
                  </li>
                  <li>Sukhothai - multiple locations, popular pad thai.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-white/6 rounded-full p-2 flex items-center space-x-3">
              <input
                className="flex-1 bg-transparent placeholder-white/60 text-white text-sm px-3 py-2 focus:outline-none"
                placeholder="Ask me anything..."
              />
              <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white px-4 py-2 rounded-full">
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatTab;
