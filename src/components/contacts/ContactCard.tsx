"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically load your exact Home Page 3D scene 
const Scene = dynamic(() => import("@/components/Scene"), { ssr: false });

// ==========================================
// 1. CONTACT CARD SUB-COMPONENT
// ==========================================
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
    <div className="w-full max-w-xl bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-2xl flex flex-col sm:flex-row gap-6 transition-all duration-300 hover:border-cyan-500/40 group/card">
      {/* Left side: Profile Photo & Details */}
      <div className="flex flex-col items-center justify-center text-center sm:items-start sm:text-left gap-3 shrink-0">
        <img
          src={avatar}
          alt={name}
          className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(0,212,255,0.15)] group-hover/card:scale-105 transition-transform duration-300"
        />
        <div>
          <h3 className="text-xl font-bold tracking-wide">{name}</h3>
          <p className="text-xs text-cyan-400 font-medium mt-0.5">{role}</p>
        </div>
      </div>

      {/* Right side: Actions & Live Map Embed */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 bg-black">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-cyan-500 hover:text-black py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 text-center"
          >
            📞 Call Now
          </a>

          <a
            href={`https://wa.me/${cleanWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border border-emerald-500/20 text-center"
          >
            💬 WhatsApp
          </a>
        </div>

        {/* Embedded Map Container */}
        <div className="relative group/map rounded-xl overflow-hidden bg-black/80 border border-white/5 h-28 w-full z-20">
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

// ==========================================
// 2. MAIN PAGE CONTAINER USING HOME SCENE
// ==========================================
export default function ContactPage() {
  const contactData = [
    {
      name: "Alex Thorne",
      role: "Lead Technical Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      phone: "+15550199",
      whatsapp: "15550199",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.617540954605!2d-73.98824442342017!3d40.74844047138902!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
      mapLineUrl: "https://maps.app.goo.gl/Yp4w2S4pD8nK2n5S8"
    },
    {
      name: "Marcus Vance",
      role: "Operations Manager",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      phone: "+442079460192",
      whatsapp: "442079460192",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.540424204272!2d-0.12720032332616213!3d51.500729171814675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604c38c8cd1d9%3A0xb78f2474b9a45aa9!2sBig%20Ben!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin",
      mapLineUrl: "https://maps.app.goo.gl/3fZ82j4M8d9K2n5A7"
    }
  ];

  return (
    <div className="relative w-full min-h-screen bg-black/60 flex flex-col items-center justify-center px-4 py-16 gap-8">
      
      {/* Inline animations injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes inlineFadeInDown {
          0% { opacity: 0; transform: translateY(-40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes inlineFadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-down { animation: inlineFadeInDown 0.8s ease-out forwards; }
        .animate-fade-up { animation: inlineFadeInUp 0.8s ease-out forwards; animation-delay: 0.2s; }
      `}} />

      {/* Render the identical Home Scene here in minimal mode */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Scene scrollProgress={0} isLoaded={true} minimal={true} />
      </div>

      {/* Interface Layer */}
      <div className="relative z-10 w-full flex flex-col items-center gap-8 max-w-4xl">
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