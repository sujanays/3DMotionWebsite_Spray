"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically load your updated 3D scene 
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

interface ContactCardProps {
  name: string;
  role: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  mapEmbedUrl: string;
  mapLineUrl: string;
}

function ContactCard({
  name,
  role,
  avatar,
  phone,
  whatsapp,
  mapEmbedUrl,
  mapLineUrl,
}: ContactCardProps) {
  const cleanWhatsApp = whatsapp.replace(/\D/g, "");

  return (
    /* Optimized padding from p-6 down to p-4 on smaller viewports to fit both containers onto mobile screens */
    <div className="w-full max-w-xl bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 text-white shadow-2xl flex flex-col sm:flex-row gap-4 sm:gap-6 transition-all duration-300 hover:border-cyan-500/40 group/card pointer-events-auto">
      {/* Left side: Profile Photo & Details */}
      <div className="flex flex-row sm:flex-col items-center text-left sm:items-start gap-3 shrink-0">
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(0,212,255,0.15)] group-hover/card:scale-105 transition-transform duration-300"
        />
        <div>
          <h3 className="text-lg sm:text-xl font-bold tracking-wide">{name}</h3>
          <p className="text-xs text-cyan-400 font-medium mt-0.5">{role}</p>
        </div>
      </div>

      {/* Right side: Actions & Live Map Embed */}
      <div className="flex-1 flex flex-col gap-3 sm:gap-4">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-cyan-500 hover:text-black py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 text-center"
          >
            📞 Call Now
          </a>

          <a
            href={`https://wa.me/${cleanWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-white py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border border-emerald-500/20 text-center"
          >
            💬 WhatsApp
          </a>
        </div>

        {/* Embedded Map Container - scaled down h-20 on mobile to fit the viewport frame perfectly */}
        <div className="relative group/map rounded-xl overflow-hidden bg-black/80 border border-white/5 h-20 sm:h-28 w-full z-20">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0, filter: "grayscale(1) invert(0.9) contrast(1.2)" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="pointer-events-none"
          />
          <a
            href={mapLineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 bg-black/70 opacity-0 group-hover/map:opacity-100 flex items-center justify-center text-xs font-semibold text-cyan-300 transition-opacity duration-200 backdrop-blur-[1px] text-center"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const contactData = [
    {
      name: "Alex Thorne",
      role: "Lead Technical Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      phone: "+15550199",
      whatsapp: "15550199",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.6175393033593!2d-73.98823932342551!3d40.74844443537873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2s!4v1710000000000!5m2!1sen!2s",
      mapLineUrl: "https://maps.app.goo.gl/YVwunr7W9gN2"
    },
    {
      name: "Marcus Vance",
      role: "Operations Manager",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      phone: "+442079460192",
      whatsapp: "442079460192",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.2773822002347!2d-0.12720542337775926!3d51.50072911046187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604c38c8cd1d9%3A0xb78f2474b9a45aa9!2sBig%20Ben!5e0!3m2!1sen!2s!4v1710000000000!5m2!1sen!2s",
      mapLineUrl: "https://maps.app.goo.gl/pM7KxS4Wq8E2"
    }
  ];

  return (
    /* Changed padding to py-6 on mobile and adjusted layout constraints to allow clean device fitting */
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

      {/* Interface Layer - Swapped container down to pointer-events-auto to enable card buttons */}
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