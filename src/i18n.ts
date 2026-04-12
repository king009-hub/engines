import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    saveMissing: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          header: {
            search_placeholder: "Search...",
            basket: "BASKET",
            estimate: "ESTIMATE",
            my_account: "My Account",
            view_all: "View All {{name}}",
          },
          footer: {
            society: "The Society",
            who_we_are: "Who we are",
            payment_methods: "Payment methods",
            contact: "Contact",
            access_customers: "Access Customers",
            my_account: "My account",
            quotes: "Quotes",
            information: "Information",
            terms: "Terms & Conditions",
            privacy: "Privacy Policy",
            company_info: "Engine Markets",
            since: "Since 2009",
            rights_reserved: "All rights reserved.",
          },
          legal: {
            last_updated: "Last Updated: April 2026",
            terms: {
              title: "Terms & Conditions",
              intro: {
                title: "1. Introduction",
                content: "Welcome to Engine Markets (enginemarkets.com). These Terms & Conditions govern your use of our website and the purchase of our products. By accessing our site, you agree to be bound by these terms."
              },
              products: {
                title: "2. Product Information",
                content: "We specialize in used engines, gearboxes, and automotive parts. While we strive for accuracy, all products are sold based on their specific condition as described in the product listing. Images are of the actual items or representative of the stock."
              },
              warranty: {
                title: "3. Warranty & Returns",
                content: "All our used engines and gearboxes come with a standard warranty period (typically 3-6 months unless specified otherwise). Returns are accepted within 14 days of delivery if the item is found to be defective or not as described. Installation must be performed by a certified professional for the warranty to be valid."
              },
              shipping: {
                title: "4. Shipping & Delivery",
                content: "We ship to major cities including Minneapolis, St. Paul, and Rochester, as well as nationwide. Delivery times vary by location. Shipping costs are calculated at checkout based on the weight and dimensions of the engine or part."
              },
              payment: {
                title: "5. Payment",
                content: "We accept various payment methods through our secure Stripe integration. All prices are in USD unless otherwise stated. Orders are processed once full payment is confirmed."
              },
              liability: {
                title: "6. Limitation of Liability",
                content: "Engine Markets is not liable for any indirect, incidental, or consequential damages arising from the use or installation of our products. Our liability is limited to the purchase price of the product."
              },
              contact: {
                title: "7. Contact Information",
                content: "For any questions regarding these terms, please contact us at:"
              }
            },
            about: {
              title: "Who We Are",
              intro: "Engine Markets has been your trusted specialist in used automotive engines and parts since 2009. We are dedicated to providing high-quality, reliable, and affordable solutions for vehicle owners and mechanics nationwide.",
              history: {
                title: "Our History",
                content: "Starting as a small family-owned business in St. Paul, we have grown into a leading supplier of used engines and gearboxes. Over the past 15 years, we have built a reputation for expertise and integrity in the automotive industry."
              },
              mission: {
                title: "Our Mission",
                content: "Our mission is simple: to keep your vehicle on the road without breaking the bank. We rigorously test every engine and part we sell to ensure it meets our strict quality standards before it reaches your door."
              },
              expertise: {
                title: "Our Expertise",
                content: "We specialize in a wide range of components, including used engines, manual and automatic gearboxes, turbochargers, and various engine parts. Our team of experts is always available to help you find the exact part you need for your vehicle."
              }
            },
            payment: {
              title: "Payment Methods",
              intro: "We offer secure and flexible payment options to ensure a smooth purchasing experience for our customers.",
              stripe: {
                title: "Secure Payments via Stripe",
                content: "All our online transactions are processed securely through Stripe, a leading global payment processor. Your sensitive payment information is never stored on our servers."
              },
              methods: {
                title: "Accepted Methods",
                list: [
                  "Credit & Debit Cards (Visa, Mastercard, American Express, Discover)",
                  "Digital Wallets (Apple Pay, Google Pay)",
                  "Secure Online Bank Transfers",
                  "Contactless Payments for Local Pickup"
                ]
              },
              security: {
                title: "Transaction Security",
                content: "We use industry-standard SSL encryption to protect your data during checkout. Our integration with Stripe ensures that your payment is handled with the highest level of security and fraud protection."
              }
            },
            privacy: {
              title: "Privacy Policy",
              collect: {
                title: "1. Information We Collect",
                content: "We collect information that you provide to us directly when you create an account, make a purchase, or contact us. This includes your name, email address, phone number, shipping address, and payment information."
              },
              use: {
                title: "2. How We Use Your Information",
                content: "We use your information to:",
                list: [
                  "Process and fulfill your orders",
                  "Communicate with you regarding your orders and inquiries",
                  "Provide customer support and warranty services",
                  "Send you updates, promotions, and news (with your consent)",
                  "Improve our website and customer experience"
                ]
              },
              sharing: {
                title: "3. Information Sharing",
                content: "We do not sell your personal information. We only share it with trusted third-party service providers who assist us in operating our website, processing payments (Stripe), and delivering orders. These providers are obligated to protect your data and only use it for the specified purposes."
              },
              security: {
                title: "4. Data Security",
                content: "We take the security of your information seriously. We use industry-standard encryption (SSL/TLS) to protect your data during transmission and secure storage for all personal information. Payment information is handled securely by Stripe and is not stored on our servers."
              },
              cookies: {
                title: "5. Cookies and Tracking",
                content: "Our website uses cookies to enhance your browsing experience, remember your cart, and analyze traffic. You can manage your cookie preferences through your browser settings."
              },
              rights: {
                title: "6. Your Rights",
                content: "You have the right to access, correct, or delete your personal information. You can manage most of this through your account settings or by contacting us directly."
              },
              contact: {
                title: "7. Contact Information",
                content: "For any questions regarding our Privacy Policy, please contact us at:"
              }
            }
          },
          home: {
            hero_title: "YOUR USED ENGINE SPECIALIST",
            hero_subtitle: "Quality, reliability and expertise since 2009",
            latest_products: "Our latest products",
            testimonials_title: "What our customers say",
            testimonials_subtitle: "We pride ourselves on providing the best engines and service in the industry.",
          },
          testimonials: [
            {
              quote: "The engine I bought was in perfect condition, just as described. The team was very helpful and the delivery was fast. I highly recommend Engine Markets!",
              author: "Alex Johnson",
              location: "New York, USA",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              rating: 5
            },
            {
              quote: "I was looking for a specific gearbox for my old Renault and found it here. The price was fair and the part works perfectly. Great service!",
              author: "Maria Garcia",
              location: "Paris, France",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              rating: 5
            },
            {
              quote: "Excellent customer service. They helped me find the right turbo for my Audi and answered all my questions. I will definitely be back.",
              author: "David Smith",
              location: "London, UK",
              avatar: "https://randomuser.me/api/portraits/men/56.jpg",
              rating: 5
            },
            {
              quote: "The quality of the engine parts is top-notch. My car runs like new again. Thank you Engine Markets for your professionalism.",
              author: "Sophie Dubois",
              location: "Brussels, Belgium",
              avatar: "https://randomuser.me/api/portraits/women/68.jpg",
              rating: 4
            },
            {
              quote: "A very reliable supplier for used engines. The engine arrived well-packaged and on time. I am very satisfied with my purchase.",
              author: "Chen Wang",
              location: "Berlin, Germany",
              avatar: "https://randomuser.me/api/portraits/men/76.jpg",
              rating: 5
            },
            {
              quote: "I had a great experience with Engine Markets. The staff is knowledgeable and they have a huge inventory. I found exactly what I needed.",
              author: "Fatima Al-Fassi",
              location: "Dubai, UAE",
              avatar: "https://randomuser.me/api/portraits/women/12.jpg",
              rating: 5
            }
          ],
          reviews: {
            title: "Customer Reviews",
            out_of_5: "out of 5",
            write_review: "Write a Review",
            cancel: "Cancel",
            rating: "Rating",
            name: "Name",
            location: "Location",
            review: "Your Review",
            placeholder: "Tell us about your experience with this product...",
            submit: "Submit Review",
            submitting: "Submitting...",
            approval_notice: "Note: Reviews are subject to approval before appearing on the site.",
            no_reviews: "No reviews yet",
            be_first: "Be the first to review this product!",
            fill_required: "Please fill in all required fields.",
            submit_success: "Review submitted successfully! It will appear after approval.",
            submit_error: "Failed to submit review. Please try again."
          },
          products: {
            all_products: "All Products",
            home: "Home",
            previous: "Previous",
            next: "Next",
            search_results: "Search results for \"{{query}}\"",
            no_products: "No products found",
            add_to_basket: "Add to basket",
            view_product: "View product",
            availability: "Availability",
            in_stock: "In stock",
            out_of_stock: "Out of stock",
            engine_code: "Engine code",
            fuel_type: "Fuel type",
            mileage: "Mileage",
            brand: "Brand",
            category: "Category",
            price: "Price",
            related_products: "Related products",
            characteristics: "Characteristics",
            description: "Description",
            showing: "Showing",
            of: "of",
            results: "results",
            sort_by: "Sort by",
            sort_newest: "Newest to Oldest",
            sort_oldest: "Oldest to Newest",
            sort_price_asc: "Price: Low to High",
            sort_price_desc: "Price: High to Low",
            sort_popularity: "Popularity",
            loading: "Loading...",
            request_quote: "Request a quote for this engine",
            compatibility: "Compatible Vehicles",
          },
          cart: {
            title: "Your Basket",
            empty: "Your basket is empty",
            continue_shopping: "Continue shopping",
            summary: "Summary",
            total: "Total",
            checkout: "Checkout",
            subtotal: "Subtotal",
            shipping: "Shipping",
            remove: "Remove",
            quantity: "Quantity",
          },
          account: {
            title: "My Account",
            login: "Login",
            register: "Register",
            email: "Email",
            password: "Password",
            full_name: "Full Name",
            phone: "Phone",
            address: "Address",
            save_changes: "Save Changes",
            sign_out: "Sign Out",
            admin_panel: "Admin Panel",
          },
          dynamic: {
            engine: "Engine",
            engines: "Engines",
            used_engine: "Used Engine",
            used_engines: "Used Engines",
            gearbox: "Gearbox",
            gearboxes: "Gearboxes",
            turbo: "Turbo",
            turbos: "Turbos",
            used: "Used",
            new: "New",
            reconditioned: "Reconditioned",
            diesel: "Diesel",
            petrol: "Petrol",
            electric: "Electric",
            hybrid: "Hybrid",
            manual: "Manual",
            automatic: "Automatic",
            all_products: "All Products",
            search: "Search",
            category: "Category",
            brand: "Brand",
            in_stock: "In Stock",
            out_of_stock: "Out of Stock"
          }
        }
      },
      fr: {
        translation: {
          header: {
            search_placeholder: "Rechercher",
            basket: "PANIER",
            estimate: "ESTIMATION",
            my_account: "Mon Compte",
            view_all: "Voir tout {{name}}",
          },
          footer: {
            society: "La Société",
            who_we_are: "Qui sommes-nous",
            payment_methods: "Modes de paiement",
            contact: "Contact",
            access_customers: "Accès Clients",
            my_account: "Mon compte",
            quotes: "Devis",
            information: "Informations",
            terms: "Conditions Générales",
            privacy: "Politique de Confidentialité",
            company_info: "Engine Markets",
            since: "Depuis 2009",
            rights_reserved: "Tous droits réservés.",
          },
          legal: {
            last_updated: "Dernière mise à jour : Avril 2026",
            terms: {
              title: "Conditions Générales",
              intro: {
                title: "1. Introduction",
                content: "Bienvenue chez Engine Markets (enginemarkets.com). Ces Conditions Générales régissent votre utilisation de notre site web et l'achat de nos produits. En accédant à notre site, vous acceptez d'être lié par ces conditions."
              },
              products: {
                title: "2. Informations sur les produits",
                content: "Nous sommes spécialisés dans les moteurs d'occasion, les boîtes de vitesses et les pièces automobiles. Bien que nous nous efforcions d'être précis, tous les produits sont vendus en fonction de leur état spécifique tel que décrit dans la fiche produit. Les images sont celles des articles réels ou représentatives du stock."
              },
              warranty: {
                title: "3. Garantie et retours",
                content: "Tous nos moteurs et boîtes de vitesses d'occasion bénéficient d'une période de garantie standard (généralement 3 à 6 mois, sauf indication contraire). Les retours sont acceptés dans les 14 jours suivant la livraison si l'article s'avère défectueux ou non conforme à la description. L'installation doit être effectuée par un professionnel certifié pour que la garantie soit valide."
              },
              shipping: {
                title: "4. Expédition et livraison",
                content: "Nous livrons dans les grandes villes, notamment Minneapolis, St. Paul et Rochester, ainsi que dans tout le pays. Les délais de livraison varient selon l'emplacement. Les frais d'expédition sont calculés lors du paiement en fonction du poids et des dimensions du moteur ou de la pièce."
              },
              payment: {
                title: "5. Paiement",
                content: "Nous acceptons divers modes de paiement via notre intégration Stripe sécurisée. Tous les prix sont en USD, sauf indication contraire. Les commandes sont traitées une fois le paiement intégral confirmé."
              },
              liability: {
                title: "6. Limitation de responsabilité",
                content: "Engine Markets n'est pas responsable des dommages indirects, accessoires ou consécutifs résultant de l'utilisation ou de l'installation de nos produits. Notre responsabilité est limitée au prix d'achat du produit."
              },
              contact: {
                title: "7. Informations de contact",
                content: "Pour toute question concernant ces conditions, veuillez nous contacter à :"
              }
            },
            about: {
              title: "Qui sommes-nous",
              intro: "Engine Markets est votre spécialiste de confiance en moteurs et pièces automobiles d'occasion depuis 2009. Nous nous engageons à fournir des solutions de haute qualité, fiables et abordables pour les propriétaires de véhicules et les mécaniciens du pays.",
              history: {
                title: "Notre histoire",
                content: "Ayant débuté comme une petite entreprise familiale à St. Paul, nous sommes devenus un fournisseur de premier plan de moteurs et de boîtes de vitesses d'occasion. Au cours des 15 dernières années, nous nous sommes forgés une réputation d'expertise et d'intégrité dans l'industrie automobile."
              },
              mission: {
                title: "Notre mission",
                content: "Notre mission est simple : maintenir votre véhicule sur la route sans vous ruiner. Nous testons rigoureusement chaque moteur et chaque pièce que nous vendons pour nous assurer qu'ils répondent à nos normes de qualité strictes avant qu'ils n'arrivent chez vous."
              },
              expertise: {
                title: "Notre expertise",
                content: "Nous nous spécialisons dans une large gamme de composants, notamment les moteurs d'occasion, les boîtes de vitesses manuelles et automatiques, les turbocompresseurs et diverses pièces de moteur. Notre équipe d'experts est toujours disponible pour vous aider à trouver la pièce exacte dont vous avez besoin pour votre véhicule."
              }
            },
            payment: {
              title: "Modes de paiement",
              intro: "Nous proposons des options de paiement sécurisées et flexibles pour garantir une expérience d'achat fluide à nos clients.",
              stripe: {
                title: "Paiements sécurisés via Stripe",
                content: "Toutes nos transactions en ligne sont traitées de manière sécurisée via Stripe, un processeur de paiement mondial de premier plan. Vos informations de paiement sensibles ne sont jamais stockées sur nos serveurs."
              },
              methods: {
                title: "Méthodes acceptées",
                list: [
                  "Cartes de crédit et de débit (Visa, Mastercard, American Express, Discover)",
                  "Portefeuilles numériques (Apple Pay, Google Pay)",
                  "Virements bancaires en ligne sécurisés",
                  "Paiements sans contact pour le ramassage local"
                ]
              },
              security: {
                title: "Sécurité des transactions",
                content: "Nous utilisons un cryptage SSL standard pour protéger vos données lors du paiement. Notre intégration avec Stripe garantit que votre paiement est traité avec le plus haut niveau de sécurité et de protection contre la fraude."
              }
            },
            privacy: {
              title: "Politique de confidentialité",
              collect: {
                title: "1. Informations que nous collectons",
                content: "Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, effectuez un achat ou nous contactez. Cela inclut votre nom, votre adresse e-mail, votre numéro de téléphone, votre adresse de livraison et vos informations de paiement."
              },
              use: {
                title: "2. Comment nous utilisons vos informations",
                content: "Nous utilisons vos informations pour :",
                list: [
                  "Traiter et exécuter vos commandes",
                  "Communiquer avec vous concernant vos commandes et demandes",
                  "Fournir un support client et des services de garantie",
                  "Vous envoyer des mises à jour, des promotions et des nouvelles (avec votre consentement)",
                  "Améliorer notre site web et l'expérience client"
                ]
              },
              sharing: {
                title: "3. Partage d'informations",
                content: "Nous ne vendons pas vos informations personnelles. Nous ne les partageons qu'avec des prestataires de services tiers de confiance qui nous aident à exploiter notre site web, à traiter les paiements (Stripe) et à livrer les commandes. Ces prestataires sont tenus de protéger vos données et de ne les utiliser qu'aux fins spécifiées."
              },
              security: {
                title: "4. Sécurité des données",
                content: "Nous prenons la sécurité de vos informations au sérieux. Nous utilisons un cryptage standard (SSL/TLS) pour protéger vos données pendant la transmission et un stockage sécurisé pour toutes les informations personnelles. Les informations de paiement sont gérées en toute sécurité par Stripe et ne sont pas stockées sur nos serveurs."
              },
              cookies: {
                title: "5. Cookies et suivi",
                content: "Notre site web utilise des cookies pour améliorer votre expérience de navigation, mémoriser votre panier et analyser le trafic. Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur."
              },
              rights: {
                title: "6. Vos droits",
                content: "Vous avez le droit d'accéder à vos informations personnelles, de les corriger ou de les supprimer. Vous pouvez gérer la plupart de ces éléments via les paramètres de votre compte ou en nous contactant directement."
              },
              contact: {
                title: "7. Informations de contact",
                content: "Pour toute question concernant notre politique de confidentialité, veuillez nous contacter à :"
              }
            }
          },
          home: {
            hero_title: "VOTRE SPÉCIALISTE DU MOTEUR D'OCCASION",
            hero_subtitle: "Qualité, fiabilité et expertise depuis 2009",
            latest_products: "Nos derniers produits",
            testimonials_title: "Ce que disent nos clients",
            testimonials_subtitle: "Nous sommes fiers de fournir les meilleurs moteurs et services de l'industrie.",
          },
          testimonials: [
            {
              quote: "Le moteur que j'ai acheté était en parfait état, exactement comme décrit. L'équipe a été très utile et la livraison a été rapide. Je recommande vivement Engine Markets !",
              author: "Alex Johnson",
              location: "New York, USA",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              rating: 5
            },
            {
              quote: "Je cherchais une boîte de vitesses spécifique pour ma vieille Renault et je l'ai trouvée ici. Le prix était juste et la pièce fonctionne parfaitement. Super service !",
              author: "Maria Garcia",
              location: "Paris, France",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              rating: 5
            },
            {
              quote: "Excellent service client. Ils m'ont aidé à trouver le bon turbo pour mon Audi et ont répondu à toutes mes questions. Je reviendrai certainement.",
              author: "David Smith",
              location: "Londres, UK",
              avatar: "https://randomuser.me/api/portraits/men/56.jpg",
              rating: 5
            },
            {
              quote: "La qualité des pièces de moteur est de premier ordre. Ma voiture roule à nouveau comme neuve. Merci Engine Markets pour votre professionnalisme.",
              author: "Sophie Dubois",
              location: "Bruxelles, Belgique",
              avatar: "https://randomuser.me/api/portraits/women/68.jpg",
              rating: 4
            },
            {
              quote: "Un fournisseur très fiable pour les moteurs d'occasion. Le moteur est arrivé bien emballé et à temps. Je suis très satisfait de mon achat.",
              author: "Chen Wang",
              location: "Berlin, Allemagne",
              avatar: "https://randomuser.me/api/portraits/men/76.jpg",
              rating: 5
            },
            {
              quote: "J'ai eu une excellente expérience avec Engine Markets. Le personnel est compétent et ils ont un inventaire énorme. J'ai trouvé exactement ce dont j'avais besoin.",
              author: "Fatima Al-Fassi",
              location: "Dubaï, EAU",
              avatar: "https://randomuser.me/api/portraits/women/12.jpg",
              rating: 5
            }
          ],
          reviews: {
            title: "Avis Clients",
            out_of_5: "sur 5",
            write_review: "Rédiger un avis",
            cancel: "Annuler",
            rating: "Note",
            name: "Nom",
            location: "Localisation",
            review: "Votre avis",
            placeholder: "Parlez-nous de votre expérience avec ce produit...",
            submit: "Envoyer l'avis",
            submitting: "Envoi en cours...",
            approval_notice: "Note : Les avis sont soumis à approbation avant d'apparaître sur le site.",
            no_reviews: "Pas encore d'avis",
            be_first: "Soyez le premier à donner votre avis sur ce produit !",
            fill_required: "Veuillez remplir tous les champs obligatoires.",
            submit_success: "Avis envoyé avec succès ! Il apparaîtra après approbation.",
            submit_error: "Échec de l'envoi de l'avis. Veuillez réessayer."
          },
          products: {
            all_products: "Tous les produits",
            home: "Accueil",
            previous: "Précédent",
            next: "Suivant",
            search_results: "Résultats de recherche pour \"{{query}}\"",
            no_products: "Aucun produit trouvé",
            add_to_basket: "Ajouter au panier",
            view_product: "Voir le produit",
            availability: "Disponibilité",
            in_stock: "En stock",
            out_of_stock: "En rupture de stock",
            engine_code: "Code moteur",
            fuel_type: "Type de carburant",
            mileage: "Kilométrage",
            brand: "Marque",
            category: "Catégorie",
            price: "Prix",
            related_products: "Produits connexes",
            characteristics: "Caractéristiques",
            description: "Description",
            showing: "Affichage de",
            of: "sur",
            results: "résultats",
            sort_by: "Trier par",
            sort_newest: "Du plus récent au plus ancien",
            sort_oldest: "Du plus ancien au plus récent",
            sort_price_asc: "Prix : croissant",
            sort_price_desc: "Prix : décroissant",
            sort_popularity: "Popularité",
            loading: "Chargement...",
            request_quote: "Demander un devis pour ce moteur",
            compatibility: "Véhicules compatibles",
          },
          cart: {
            title: "Votre Panier",
            empty: "Votre panier est vide",
            continue_shopping: "Continuer mes achats",
            summary: "Récapitulatif",
            total: "Total",
            checkout: "Passer commande",
            subtotal: "Sous-total",
            shipping: "Frais de livraison",
            remove: "Supprimer",
            quantity: "Quantité",
          },
          account: {
            title: "Mon Compte",
            login: "Connexion",
            register: "Inscription",
            email: "E-mail",
            password: "Mot de passe",
            full_name: "Nom complet",
            phone: "Téléphone",
            address: "Adresse",
            save_changes: "Enregistrer les modifications",
            sign_out: "Déconnexion",
            admin_panel: "Panneau d'administration",
          },
          dynamic: {
            engine: "Moteur",
            engines: "Moteurs",
            used_engine: "Moteur d'occasion",
            used_engines: "Moteurs d'occasion",
            gearbox: "Boîte de vitesses",
            gearboxes: "Boîtes de vitesses",
            turbo: "Turbo",
            turbos: "Turbos",
            used: "Occasion",
            new: "Neuf",
            reconditioned: "Reconditionné",
            diesel: "Diesel",
            petrol: "Essence",
            electric: "Électrique",
            hybrid: "Hybride",
            manual: "Manuelle",
            automatic: "Automatique",
            all_products: "Tous les produits",
            search: "Recherche",
            category: "Catégorie",
            brand: "Marque",
            in_stock: "En stock",
            out_of_stock: "En rupture de stock"
          }
        }
      }
    }
  });

export default i18n;
