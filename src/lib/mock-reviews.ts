
export const MOCK_REVIEWS = [
  { quote: "Exactly what I needed for my car. Fast shipping!", author: "Michael R.", location: "St Paul, MN", rating: 5 },
  { quote: "Great quality and competitive price. Highly recommend.", author: "Sarah L.", location: "Minneapolis, MN", rating: 5 },
  { quote: "Part arrived in perfect condition and works flawlessly.", author: "John D.", location: "Rochester, MN", rating: 4 },
  { quote: "Very professional service and knowledgeable staff.", author: "Emma W.", location: "Duluth, MN", rating: 5 },
  { quote: "The engine was as described. Excellent packaging.", author: "Robert B.", location: "Bloomington, MN", rating: 5 },
  { quote: "Saved a lot of money compared to the local dealer.", author: "Lisa K.", location: "Brooklyn Park, MN", rating: 4 },
  { quote: "Reliable and fast delivery. Will buy again.", author: "William T.", location: "Plymouth, MN", rating: 5 },
  { quote: "The gearbox works perfectly. Thank you!", author: "Jessica M.", location: "Woodbury, MN", rating: 5 },
  { quote: "Excellent customer support throughout the process.", author: "Christopher P.", location: "Eagan, MN", rating: 5 },
  { quote: "Good value for money. The part was easy to install.", author: "Ashley S.", location: "Maple Grove, MN", rating: 4 },
  { quote: "Impressive inventory and quick turnaround time.", author: "David H.", location: "St. Cloud, MN", rating: 5 },
  { quote: "The best place for used auto parts. Very satisfied.", author: "Amanda G.", location: "Blaine, MN", rating: 5 },
  { quote: "Everything went smoothly. Highly recommended.", author: "Matthew F.", location: "Eden Prairie, MN", rating: 5 },
  { quote: "Prompt communication and high-quality products.", author: "Nicole E.", location: "Coon Rapids, MN", rating: 4 },
  { quote: "The engine runs like a dream. Thank you so much!", author: "James V.", location: "Burnsville, MN", rating: 5 },
  { quote: "Fair prices and honest descriptions. A+ service.", author: "Stephanie C.", location: "Apple Valley, MN", rating: 5 },
  { quote: "Quick shipping and excellent part condition.", author: "Daniel O.", location: "Minnetonka, MN", rating: 5 },
  { quote: "Very happy with my purchase. Will recommend to friends.", author: "Megan J.", location: "Edina, MN", rating: 4 },
  { quote: "Superb quality control. The part was clean and ready.", author: "Andrew K.", location: "St. Louis Park, MN", rating: 5 },
  { quote: "Professional grade parts at affordable prices.", author: "Heather B.", location: "Shakopee, MN", rating: 5 }
];

export const MOCK_TESTIMONIALS = [
  { quote: "Engine Markets is my go-to for all engine needs. Their expertise is unmatched.", author: "George Miller", location: "St Paul, MN", avatar: "https://i.pravatar.cc/150?u=george", rating: 5 },
  { quote: "The level of professionalism at Engine Markets is outstanding. Highly recommended.", author: "Karen Smith", location: "Minneapolis, MN", avatar: "https://i.pravatar.cc/150?u=karen", rating: 5 },
  { quote: "I was hesitant to buy a used engine, but they made the process so easy and reassuring.", author: "Paul Wright", location: "Rochester, MN", avatar: "https://i.pravatar.cc/150?u=paul", rating: 5 },
  { quote: "Fast shipping and the engine was exactly as described. Saved my car!", author: "Linda Jones", location: "St Paul, MN", avatar: "https://i.pravatar.cc/150?u=linda", rating: 5 },
  { quote: "Great customer service. They really know their engines.", author: "Mark Davis", location: "Minneapolis, MN", avatar: "https://i.pravatar.cc/150?u=mark", rating: 4 },
  { quote: "Reliable, fast, and professional. The best in the business.", author: "Susan Brown", location: "St Paul, MN", avatar: "https://i.pravatar.cc/150?u=susan", rating: 5 },
  { quote: "Excellent value for money. My car is back on the road thanks to Engine Markets.", author: "Kevin Wilson", location: "Minneapolis, MN", avatar: "https://i.pravatar.cc/150?u=kevin", rating: 5 },
  { quote: "The staff went above and beyond to help me find the right part.", author: "Nancy Garcia", location: "Rochester, MN", avatar: "https://i.pravatar.cc/150?u=nancy", rating: 5 },
  { quote: "Top-notch quality control. You can trust their parts.", author: "Brian Taylor", location: "St Paul, MN", avatar: "https://i.pravatar.cc/150?u=brian", rating: 5 },
  { quote: "Engine Markets provided me with a high-quality turbo at a fraction of the cost.", author: "Laura Lee", location: "Minneapolis, MN", avatar: "https://i.pravatar.cc/150?u=laura", rating: 4 }
];

// Helper to get random subset based on a seed (like productId)
export function getRandomSubset<T>(array: T[], min: number, max: number, seed: string): T[] {
  // Simple hash function for seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const rng = () => {
    hash = (hash * 16807) % 2147483647;
    return (hash - 1) / 2147483646;
  };

  const count = Math.floor(rng() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}
