"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ContactCard } from "./ContactCard";

// Dynamically load your updated 3D scene 
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

export default function ContactPage() {
  const contactData = [
  {
    name: "Alex Thorne",
    role: "Lead Technical Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    phone: "+15550199",
    whatsapp: "15550199",
    // 📍 CHANGE THIS: Use the official /embed URL format from Google Maps
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.0148!2d77.4925!3d13.0148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDAwJzUzLjNfTiA3N8KwMjknMzMuMCJF!5e0!3m2!1sen!2sin!4v1700000000000",
    mapLineUrl: "https://maps.google.com/?q=13.0148,77.4925"
  },
  {
    name: "Marcus Vance",
    role: "Operations Manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    phone: "+442079460192",
    whatsapp: "442079460192",
    // 📍 CHANGE THIS: Use the official /embed URL format for the second location
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.5404!2d-0.1278!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzI2LjYiTiAwwrAwNyc0MC4xX1c!5e0!3m2!1sen!2suk!4v1700000000000",
    mapLineUrl: "https://maps.google.com/?q=51.5074,-0.1278"
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


