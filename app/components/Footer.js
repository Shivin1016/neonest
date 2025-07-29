"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-5 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand and Description */}
<div>
            <div className="flex items-center gap-x-1 mb-2">
              <Image
                src="/logoFooter.jpg"
                alt="NeoNest Logo"
                width={40}
                height={40}
                className="object-contain -mt-1.5 animate-pulse"  
              />
              <span className="font-semibold text-lg mb-2">NeoNest</span>
            </div>
            <p className="text-gray-400 text-sm">
              Supporting parents through their baby's incredible first year with expert guidance, AI assistance, and a loving community—<br/>making parenting 10x easier, calmer, and more connected. <br/>Happy baby, Happy you!
            </p>
          </div>

{/* Features */}
          <div>
            <h4 className="font-semibold mb-2">Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/Growth" className="hover:text-white transition-colors block">
                  Growth Tracker
                </Link>
                <Link href="/Feeding" className="hover:text-white transition-colors block">
                  Feed Scheduler
                </Link>
              </li>
                <Link href="/Sleep" className="hover:text-white transition-colors block">
                  Sleep Tracker
                </Link>
              <li>
                <Link href="/Medical" className="hover:text-white transition-colors block">
                  Vaccine Tracker
                </Link>
              </li>
              <Link href="/Essentials" className="hover:text-white transition-colors block">
                  Inventory Tracker
                </Link>
              <li>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-2">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors block">
                  About NeoNest
                </Link>
              </li>
              <li>
                <Link href="/Faqs" className="hover:text-white transition-colors block">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/Resources" className="hover:text-white transition-colors block">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/NeonestAi" className="hover:text-white transition-colors block">
                  NeoNest AI
                </Link>
              </li>
              <li>
                <Link href="/Memories" className="hover:text-white transition-colors block">
                  Momories, Community & Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@babycare.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1-800-BABY-CARE</span>
              </div>
               <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                <span>@neonestofficial</span>
              </div>
               <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                <span>@neonestofficial</span>
              </div>
               <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                <span>@neonestofficial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 NeoNest. All rights reserved. Made with ❤️ for parents and babies.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


