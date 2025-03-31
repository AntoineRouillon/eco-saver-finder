
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
                Achats Intelligents
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900">
              Économisez sur Amazon
            </h1>
            <p className="mt-3 text-xl text-gray-500 max-w-2xl mx-auto">
              Trouvez automatiquement des alternatives d'occasion sur Leboncoin pendant votre navigation sur Amazon.fr
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button 
                onClick={() => setShowDemo(true)}
                className="px-5 py-6 rounded-xl bg-[#4AB07B] hover:bg-[#3d9366] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Comment ça marche
              </Button>
              <Button
                variant="outline"
                className="px-5 py-6 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300"
              >
                Télécharger l'extension
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
            <h2 className="text-3xl font-light text-gray-900">Comment ça marche</h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
              Notre extension s'intègre parfaitement à votre expérience de navigation sur Amazon,
              vous aidant à trouver de meilleures offres sur les marchés d'occasion.
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
            <h2 className="text-3xl font-light text-gray-900">Fonctionnalités clés</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Trouvez de meilleures offres",
                description: "Recherchez automatiquement des alternatives d'occasion pendant que vous naviguez sur les produits Amazon."
              },
              {
                title: "Économisez de l'argent",
                description: "Comparez les prix entre produits neufs et d'occasion pour prendre des décisions d'achat plus intelligentes."
              },
              {
                title: "Achetez durablement",
                description: "Réduisez l'impact environnemental en considérant des articles d'occasion avant d'acheter neuf."
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
              Commencer avec notre extension est rapide et facile.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Télécharger",
                description: "Obtenez le package d'extension depuis notre site web."
              },
              {
                step: "2",
                title: "Installer",
                description: "Ajoutez l'extension à votre navigateur en quelques clics."
              },
              {
                step: "3",
                title: "Naviguez & Économisez",
                description: "Commencez à faire du shopping sur Amazon et voyez automatiquement les alternatives."
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
              © {new Date().getFullYear()} Amazon Alternative Finder. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
