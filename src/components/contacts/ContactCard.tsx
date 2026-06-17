"use client";

import React from "react";

interface ContactCardProps {
  name: string;
  role: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  mapEmbedUrl: string;
  mapLineUrl: string;
}

export function ContactCard({
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

      {/* Right side: Actions & Live Full-Color Map Embed */}
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

        {/* Embedded Map Container */}
        <div className="relative group/map rounded-xl overflow-hidden bg-black/80 border border-white/5 h-20 sm:h-28 w-full z-20">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full object-cover pointer-events-none"
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