"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  CheckCircle2,
  AtSign,
  Globe,
  Share2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LENGTH = 2000;

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = { name: "", email: "", subject: "", message: "" };

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Please enter your name.";
  if (!data.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.subject.trim()) errors.subject = "Please enter a subject.";
  if (!data.message.trim()) {
    errors.message = "Please enter a message.";
  } else if (data.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be under ${MAX_MESSAGE_LENGTH} characters.`;
  }
  return errors;
}

// Basic HTML-escaping so raw user input is never rendered/sent unescaped.
function sanitize(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim();
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: sanitize(formData.name),
      email: sanitize(formData.email),
      subject: sanitize(formData.subject),
      message: sanitize(formData.message),
    };

    // Give the request a hard timeout so a hung network call can't leave
    // the form stuck in a "Sending..." state forever.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData(INITIAL_FORM);
      setErrors({});
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.error("The request timed out. Please try again.");
      } else {
        toast.error("Something went wrong sending your message. Please try again.");
      }
    } finally {
      clearTimeout(timeout);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <MessageSquare className="h-4 w-4" />
              <span>Get in Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">We&apos;d Love to Hear From You</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a question, feedback, or just want to say hi? Our team is here to help you on your career journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Email Us</h4>
                      <a href="mailto:support@skillpilot.ai" className="block text-muted-foreground text-sm hover:text-primary transition-colors">support@skillpilot.ai</a>
                      <a href="mailto:hello@skillpilot.ai" className="block text-muted-foreground text-sm hover:text-primary transition-colors">hello@skillpilot.ai</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Call Us</h4>
                      <a href="tel:+15551234567" className="block text-muted-foreground text-sm hover:text-primary transition-colors">+1 (555) 123-4567</a>
                      <p className="text-muted-foreground text-sm">Mon-Fri, 9am-6pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Visit Us</h4>
                      <p className="text-muted-foreground text-sm">123 Innovation Drive, Suite 400<br />San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h4 className="font-medium mb-4">Follow Us</h4>
                <div className="flex gap-3">
                  {[
                    { icon: AtSign, href: "https://twitter.com", label: "X (Twitter)" },
                    { icon: Share2, href: "https://linkedin.com", label: "LinkedIn" },
                    { icon: Globe, href: "https://skillpilot.ai", label: "Website" },
                  ].map((social, idx) => (
                    <Link
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200"
                    >
                      <social.icon className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-3">
              <Card className="border-border/50 shadow-sm bg-card">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "name-error" : undefined}
                          className="h-11 bg-background"
                        />
                        {errors.name && (
                          <p id="name-error" className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? "email-error" : undefined}
                          className="h-11 bg-background"
                        />
                        {errors.email && (
                          <p id="email-error" className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={handleChange}
                        aria-invalid={!!errors.subject}
                        aria-describedby={errors.subject ? "subject-error" : undefined}
                        className="h-11 bg-background"
                      />
                      {errors.subject && (
                        <p id="subject-error" className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" /> {errors.subject}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">Message</label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        maxLength={MAX_MESSAGE_LENGTH}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? "message-error" : undefined}
                        className="min-h-[150px] resize-none bg-background"
                      />
                      <div className="flex items-center justify-between">
                        {errors.message ? (
                          <p id="message-error" className="flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.message}
                          </p>
                        ) : <span />}
                        <span className="text-xs text-muted-foreground">
                          {formData.message.length}/{MAX_MESSAGE_LENGTH}
                        </span>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11 rounded-xl gap-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Sending...</>
                      ) : (
                        <>Send Message <Send className="h-4 w-4" /></>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden border border-border bg-card h-[400px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10" />
            <div className="text-center z-10 p-8">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Our Headquarters</h3>
              <p className="text-muted-foreground max-w-md mx-auto">123 Innovation Drive, Suite 400, San Francisco, CA 94105</p>
              <Button
                type="button"
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() =>
                  window.open(
                    "https://www.google.com/maps/search/?api=1&query=123+Innovation+Drive+Suite+400+San+Francisco+CA+94105",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Open in Google Maps
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Quick answers to common questions.</p>
          </motion.div>

          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ staggerChildren: 0.1 }} className="space-y-4">
            {[
              { q: "How quickly do you respond to inquiries?", a: "We strive to respond to all messages within 24 hours during business days." },
              { q: "Do you offer enterprise solutions?", a: "Yes! Please mention 'Enterprise' in your subject line, and our sales team will reach out to discuss custom solutions." },
              { q: "Can I schedule a demo?", a: "Absolutely. Select 'Request a Demo' as the subject, and we'll send you a calendar link to book a personalized walkthrough." },
            ].map((faq) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2 flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      {faq.q}
                    </h4>
                    <p className="text-muted-foreground text-sm ml-7">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}