
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import BrowserExtension from "@/components/BrowserExtension";

const Index = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-neutral-50 z-0"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-4"
          >
            <div className="mb-2">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-50 text-green-800 rounded-full">
                Smart Shopping
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900">
              Save money on Amazon
            </h1>
            <p className="mt-3 text-xl text-gray-500 max-w-2xl mx-auto">
              Automatically find second-hand alternatives from Leboncoin while browsing Amazon.fr
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button 
                onClick={() => setShowDemo(true)}
                className="px-5 py-6 rounded-xl bg-[#4AB07B] hover:bg-[#3d9366] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                See how it works
              </Button>
              <Button
                variant="outline"
                className="px-5 py-6 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300"
              >
                Download Extension
              </Button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Demo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-light text-gray-900">How it works</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Our extension seamlessly integrates with your Amazon browsing experience,
              helping you find better deals on second-hand marketplaces.
            </p>
          </motion.div>

          <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            <div className="bg-gray-800 h-10 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-4 bg-gray-700 rounded-md px-4 py-1 text-xs text-gray-300 flex-grow">
                amazon.fr/echo-dot-2022/dp/B09B94956P/
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://m.media-amazon.com/images/I/61MbLLagiVL._AC_SX679_.jpg" 
                alt="Amazon Echo Dot" 
                className="w-full h-auto"
              />
              <AnimatePresence>
                {showDemo && <BrowserExtension onClose={() => setShowDemo(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900">Key Features</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Find Better Deals",
                description: "Automatically search for second-hand alternatives while you browse Amazon products."
              },
              {
                title: "Save Money",
                description: "Compare prices between new and used products to make smarter purchasing decisions."
              },
              {
                title: "Shop Sustainably",
                description: "Reduce environmental impact by considering pre-owned items before buying new."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-sm"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Install Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900">Installation</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Getting started with our extension is quick and easy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Download",
                description: "Get the extension package from our website."
              },
              {
                step: "2",
                title: "Install",
                description: "Add the extension to your browser with just a few clicks."
              },
              {
                step: "3",
                title: "Browse & Save",
                description: "Start shopping on Amazon and automatically see alternatives."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-[#4AB07B] font-medium">{step.step}</span>
                </div>
                <h3 className="text-xl font-medium text-center text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-center">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Amazon Alternative Finder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
