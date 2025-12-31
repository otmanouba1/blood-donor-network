import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  User,
  MessageSquare,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import Header from "../Header";
import Footer from "../Footer";

const Contact = () => {
  const contactCards = [
    {
      icon: Phone,
      title: "Emergency Helpline",
      lines: ["+212 522 123 456", "Available 24/7"],
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: ["support@bloodnetwork.ma", "info@bloodnetwork.ma"],
    },
    {
      icon: MapPin,
      title: "Head Office",
      lines: ["Casablanca, Grand Casablanca", "Morocco - 20000"],
    },
  ];

  const socialIcons = [Instagram, Facebook, Linkedin, Globe];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero */}
      <section className="relative py-20 mt-20 bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden">
        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            We’re here to support you. Reach out for help, queries, or
            blood-related assistance.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          {contactCards.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 border-b-4 border-red-500"
            >
              <div className="text-center py-4">
                <div className="bg-red-50 p-3 rounded-xl text-red-600 w-fit mx-auto mb-4">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">{item.title}</h3>
                {item.lines.map((line, j) => (
                  <p key={j} className="text-slate-500 font-medium">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 px-6">
          {/* Info Column */}
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Send Us a Message</h2>
            <p className="text-slate-500 font-medium mb-6">
              We’re always happy to help with donations, camps, or support
              queries.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-3 rounded-xl text-red-600">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-slate-500 font-medium">+212 522 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-3 rounded-xl text-red-600">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-slate-500 font-medium">support@bloodnetwork.ma</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-3 rounded-xl text-red-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-slate-500 font-medium">Casablanca, Grand Casablanca</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-6 mt-8">
              {socialIcons.map((Icon, i) => (
                <Icon
                  key={i}
                  className="w-7 h-7 text-red-600 hover:scale-110 hover:text-red-700 transition-transform cursor-pointer"
                />
              ))}
            </div>
          </div>

          {/* Form Column */}
          <Card className="rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardHeader>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Form</h3>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-900">Full Name</label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <Input className="pl-10 bg-white border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl" placeholder="Enter your name" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-900">Email</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <Input className="pl-10 bg-white border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl" placeholder="Enter your email" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-900">Phone</label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <Input className="pl-10 bg-white border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl" placeholder="Phone number" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-900">Message</label>
                <div className="relative mt-2">
                  <MessageSquare className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <Textarea
                    className="pl-10 bg-white border-slate-200 focus:ring-2 focus:ring-red-100 rounded-xl"
                    rows={4}
                    placeholder="Your message..."
                  />
                </div>
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200 rounded-xl font-medium transition-all duration-300 flex gap-2 justify-center items-center">
                <Send className="w-4 h-4" /> Send Message
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Map */}
      <section className="mb-10">
        <iframe
          title="map"
          className="w-full h-96 rounded-lg shadow-lg"
  src="https://maps.google.com/maps?q=Casablanca,%20Morocco&t=&z=13&ie=UTF8&iwloc=&output=embed"
          loading="lazy"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
