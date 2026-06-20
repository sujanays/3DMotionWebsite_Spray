"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ContactCard } from "./ContactCard";

// Dynamically load your updated 3D scene 
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function ContactPage() {
  const contactData = [
  {
    name: "Pavan U",
    role: "Yeshwanthpur Branch",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    phone: "+91 7829987528",
    whatsapp: "+91 7829987528",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d290.72705848954354!2d77.49234158070166!3d13.014795978231101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1781757933133!5m2!1sen!2sin",
    mapLineUrl: "https://maps.app.goo.gl/VrxgorH1DhT1fFz76"


  },
  {
    name: "Prashanth U",
    role: "Peenya II Stage Branch",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    phone: "+91 7829100850",
    whatsapp: "+91 7829100850",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d9302.621998881312!2d77.50131712371636!3d13.031940711980452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1781757674826!5m2!1sen!2sin",
    mapLineUrl: "https://maps.app.goo.gl/Gs1uyLHPtcjA8vJ18"

   }
];

  return (
    <div className="relative w-full min-h-screen bg-black/60 flex flex-col items-center justify-center px-4 py-6 sm:py-16 gap-4 sm:gap-8 pointer-events-none overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes inlineFadeInDown {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes inlineFadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-down { animation: inlineFadeInDown 0.8s ease-out forwards; }
        .animate-fade-up { animation: inlineFadeInUp 0.8s ease-out forwards; animation-delay: 0.15s; }
      `}} />

      {/* Background Canvas Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Scene scrollProgress={0} isLoaded={true} minimal={true} />
      </div>

      {/* Interface Layer */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-4 sm:gap-6 max-w-4xl pointer-events-auto h-full my-auto">
        <div className="w-full flex justify-center opacity-0 animate-fade-down">
          <ContactCard {...contactData[0]} />
        </div>

        <div className="w-full flex justify-center opacity-0 animate-fade-up">
          <ContactCard {...contactData[1]} />
        </div>
      </div>
    </div>
  );
}


