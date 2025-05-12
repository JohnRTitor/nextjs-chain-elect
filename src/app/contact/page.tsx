"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClockIcon, MapPinIcon, MailIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TelegramIcon } from "@/components/icons";

export default function ContactPage() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Calculate the current time in India (IST)
    const updateTime = () => {
      const indiaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(indiaTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000); // Update every second
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const contactInfo = [
    {
      icon: <MapPinIcon width="24" height="24" />,
      title: "Location",
      detail: "Kolkata, India",
      link: null,
    },
    {
      icon: <MailIcon width="24" height="24" />,
      title: "Email",
      detail: "gourabmukherjee312@gmail.com",
      link: "mailto:gourabmukherjee312@gmail.com",
    },
    {
      icon: <TelegramIcon width="24" height="24" />,
      title: "Telegram",
      detail: "@johnrtitor",
      link: "https://t.me/johnrtitor",
    },
    {
      icon: <TelegramIcon width="24" height="24" />,
      title: "Telegram",
      detail: "@leo10gourab",
      link: "https://t.me/leo10gourab",
    },
    {
      icon: <ClockIcon width="24" height="24" />,
      title: "Current Time in India",
      detail: currentTime,
      link: null,
    },
  ];

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We’re here to help! Reach out to us for any questions or assistance regarding our
            blockchain-based voting app.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="lg:col-span-2 mx-auto w-full max-w-2xl animate-slide-up">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <Card className="p-0 overflow-hidden bg-white dark:bg-slate-800 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="grid gap-8">
                  {contactInfo.map((info, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-4 transition-all duration-300",
                        "hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md",
                        "transform hover:translate-x-1",
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="text-xl text-primary-light dark:text-primary-dark transition-transform duration-300 hover:scale-110">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                            target={info.link.startsWith("http") ? "_blank" : undefined}
                            rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            {info.detail}
                          </a>
                        ) : (
                          <p className="text-gray-600 dark:text-gray-300">{info.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Availability Section */}
                <div className="my-8 py-6 border-y border-gray-200 dark:border-gray-700 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-start gap-4">
                    <div className="text-xl text-primary-light dark:text-primary-dark animate-pulse">
                      <ClockIcon width="24" height="24" />
                    </div>
                    <div className="w-full">
                      <h3 className="font-medium text-lg mb-2">Availability</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        We’re available during the following hours:
                      </p>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span>Monday - Friday</span>
                          <span className="font-mono text-green-600 dark:text-green-400">
                            9:00 AM - 6:00 PM IST
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Saturday</span>
                          <span className="font-mono text-green-600 dark:text-green-400">
                            10:00 AM - 4:00 PM IST
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Sunday</span>
                          <span className="font-mono text-red-500">Closed</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Let’s Connect Section */}
        <div className="mt-16 p-6 bg-surface-light dark:bg-surface-dark rounded-2xl text-center transition-all duration-500 hover:shadow-lg animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-4">Let’s Connect</h2>
          <p className="max-w-2xl mx-auto">
            Have a question or want to collaborate? Feel free to reach out to us. We’re always
            excited to hear from you!
          </p>
        </div>
      </div>
    </div>
  );
}
