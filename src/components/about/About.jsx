import React from "react";
import {
  Heart,
  Users,
  Shield,
  Award,
  Target,
  Droplet,
  Clock,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageContainer, SectionContainer, FeatureCard, ImpactCard, IconWrapper } from "@/components/ui/bms-components";

import Header from "../Header";
import Footer from "../Footer";

const AboutUs = () => {
  const stats = [
    { icon: Users, number: "50,000+", label: "Lives Saved", color: "border-red-500" },
    { icon: Droplet, number: "100,000+", label: "Donations", color: "border-blue-500" },
    { icon: MapPin, number: "500+", label: "Camps Organized", color: "border-green-500" },
    { icon: Shield, number: "99.8%", label: "Safety Rate", color: "border-purple-500" },
  ];

  const team = [
    { name: "Dr. Sarah Johnson", role: "Medical Director", avatar: "SJ" },
    { name: "Michael Chen", role: "Operations Head", avatar: "MC" },
    { name: "Emily Davis", role: "Community Manager", avatar: "ED" },
    { name: "Dr. James Wilson", role: "Quality Assurance", avatar: "JW" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description:
        "We believe in the power of human kindness and the impact one person can make in saving lives.",
    },
    {
      icon: Shield,
      title: "Safety First",
      description:
        "Every donation follows strict medical protocols ensuring donor safety and blood quality.",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building strong communities where people help each other in times of need.",
    },
    {
      icon: Target,
      title: "Excellence",
      description:
        "Committed to maintaining the highest standards in blood collection and distribution.",
    },
  ];

  return (
    <PageContainer>
      <Header />

      {/* Hero */}
      <SectionContainer variant="gradient" className="py-20 mt-20">
        <div className="text-center">
          <Badge className="mb-6 bg-white/20 text-white border-white/30">Saving Lives Together</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-white">
            Saving Lives, One Drop at a Time
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
            We are a dedicated platform connecting blood donors with those in
            need, making blood donation accessible, safe, and impactful.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg">
              Join Our Mission
            </Button>
            <Button variant="outline" size="lg" className="border-white bg-white/20 text-white hover:bg-white/30 hover:text-white">
              Learn More
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* Stats */}
      <SectionContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const variants = ['critical', 'info', 'success', 'warning'];
            return (
              <ImpactCard
                key={i}
                icon={stat.icon}
                title={stat.label}
                value={stat.number}
                variant={variants[i]}
              />
            );
          })}
        </div>
      </SectionContainer>

      {/* Mission & Vision */}
      <SectionContainer variant="white">
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-slate-900 tracking-tight">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-500 font-medium mb-6">
                To create a world where no one dies waiting for blood. We bridge
                the gap between voluntary blood donors and patients.
              </p>

              <div className="space-y-4">
                {[
                  { text: "24/7 Emergency Blood Availability", icon: Clock },
                  { text: "100% Safe & Verified Donors", icon: Shield },
                  { text: "Nationwide Network Coverage", icon: MapPin },
                ].map((item, i) => (
                  <div key={i} className="flex items-center">
                    <IconWrapper icon={item.icon} variant="red" className="mr-3" />
                    <span className="text-slate-500 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-slate-900 tracking-tight">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-slate-500 font-medium mb-6">
                We envision a future where blood transfusion becomes a
                hassle-free process for every patient.
              </p>

              <div className="bg-red-50 p-6 rounded-2xl">
                <IconWrapper icon={Award} variant="red" className="w-fit mb-4 w-12 h-12" />
                <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  Quality Promise
                </h4>
                <p className="text-slate-500 font-medium">
                  Every unit of blood goes through 12 rigorous quality checks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionContainer>

      {/* Values */}
      <SectionContainer>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Our Values</h2>
          <Separator className="w-24 mx-auto bg-red-600 h-1" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, i) => (
            <FeatureCard
              key={i}
              icon={value.icon}
              title={value.title}
              description={value.description}
              variant="red"
            />
          ))}
        </div>
      </SectionContainer>

      {/* Team */}
      <SectionContainer variant="white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Our Team</h2>
          <Separator className="w-24 mx-auto bg-red-600 h-1" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback className="bg-red-50 text-red-600 text-lg font-bold">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                  {member.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  {member.role}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* CTA */}
      <SectionContainer variant="gradient" className="text-center">
        <Badge className="mb-6 bg-white/20 text-white border-white/30">Join the Movement</Badge>
        <h2 className="text-4xl font-bold text-white tracking-tight mb-6">
          Ready to Make a Difference?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto">
          Every donation can save up to three lives. Be the hero someone needs today.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button size="lg">
            Become a Donor
          </Button>
          <Button variant="outline" size="lg" className="border-white bg-white/20 text-white hover:bg-white/30 hover:text-white">
            Organize a Camp
          </Button>
        </div>
      </SectionContainer>

      <Footer />
    </PageContainer>
  );
};

export default AboutUs;
